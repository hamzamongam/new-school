import { ORPCError, os } from "@orpc/server";
import { logger } from "@/lib/logger";
import { baseContext } from "./middleware";

/**
 * Rate limit entry tracking structure
 */
interface RateLimitEntry {
	count: number;
	resetAt: number;
}

/**
 * In-memory rate limiter storage
 * Key: `${ip}:${endpoint}` (e.g., "192.168.1.1:login")
 * Value: RateLimitEntry with count and reset timestamp
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
	login: {
		maxRequests: 5,
		windowMs: 15 * 60 * 1000, // 15 minutes
	},
	registerSchool: {
		maxRequests: 3,
		windowMs: 60 * 60 * 1000, // 1 hour
	},
};

/**
 * Extract IP address from request headers
 */
function getClientIP(headers: Headers): string {
	// Check common headers for client IP (respecting proxy/load balancer headers)
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		return forwarded.split(",")[0]?.trim() || "unknown";
	}

	const realIP = headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	// Fallback (in server context, this might not be available)
	return "unknown";
}

/**
 * Clean up expired rate limit entries
 * This runs periodically to prevent memory leaks
 */
function cleanupExpiredEntries() {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
	setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Check if a request should be rate limited
 * @param ip - Client IP address
 * @param endpoint - Endpoint identifier (e.g., "login", "registerSchool")
 * @param config - Rate limit configuration
 * @returns true if rate limited, false otherwise
 */
function checkRateLimit(
	ip: string,
	endpoint: string,
	config: RateLimitConfig
): { limited: boolean; remaining: number; resetAt: number } {
	const key = `${ip}:${endpoint}`;
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	// If no entry or window expired, create new entry
	if (!entry || entry.resetAt < now) {
		const resetAt = now + config.windowMs;
		rateLimitStore.set(key, {
			count: 1,
			resetAt,
		});
		return {
			limited: false,
			remaining: config.maxRequests - 1,
			resetAt,
		};
	}

	// Check if limit exceeded
	if (entry.count >= config.maxRequests) {
		return {
			limited: true,
			remaining: 0,
			resetAt: entry.resetAt,
		};
	}

	// Increment count
	entry.count++;
	return {
		limited: false,
		remaining: config.maxRequests - entry.count,
		resetAt: entry.resetAt,
	};
}

/**
 * Create rate limiting middleware for a specific endpoint
 * @param endpoint - Endpoint identifier (must exist in RATE_LIMITS)
 * @returns ORPC middleware function
 */
export function createRateLimitMiddleware(endpoint: string) {
	const config = RATE_LIMITS[endpoint];
	if (!config) {
		throw new Error(`Rate limit configuration not found for endpoint: ${endpoint}`);
	}

	return baseContext.middleware(async ({ next, context }) => {
		const ip = getClientIP(context.headers);
		const result = checkRateLimit(ip, endpoint, config);

		if (result.limited) {
			logger.warn(
				{
					ip,
					endpoint,
					resetAt: new Date(result.resetAt).toISOString(),
				},
				"Rate limit exceeded"
			);
			throw new ORPCError("TOO_MANY_REQUESTS", {
				message: `Rate limit exceeded. Please try again after ${new Date(result.resetAt).toISOString()}`,
				data: {
					resetAt: result.resetAt,
					limit: config.maxRequests,
					windowMs: config.windowMs,
				},
			});
		}

		return next();
	});
}

