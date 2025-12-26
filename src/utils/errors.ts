export type AppErrorCode = 
  | "BAD_REQUEST" 
  | "UNAUTHORIZED" 
  | "FORBIDDEN" 
  | "NOT_FOUND" 
  | "CONFLICT" 
  | "INTERNAL_SERVER_ERROR";

/**
 * AppError is the base class for all domain-specific errors.
 * It decouples the service layer from transport-specific error types (like ORPCError).
 */
export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super("NOT_FOUND", message, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super("CONFLICT", message, details);
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super("UNAUTHORIZED", message, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: unknown) {
    super("FORBIDDEN", message, details);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super("BAD_REQUEST", message, details);
    this.name = "BadRequestError";
  }
}
