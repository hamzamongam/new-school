interface CookieAttributes {
	value: string;
	"max-age"?: number | undefined;
	expires?: Date | undefined;
	domain?: string | undefined;
	path?: string | undefined;
	secure?: boolean | undefined;
	httponly?: boolean | undefined;
	samesite?: ("strict" | "lax" | "none") | undefined;
	[key: string]: unknown;
}

export function splitCookies(header: string): string[] {
	const cookies: string[] = [];
	let start = 0;
	let i = 0;

	while (i < header.length) {
		if (header[i] === ",") {
			// Look ahead for = to see if it's a new cookie start
			let j = i + 1;
			while (j < header.length && header[j] === " ") {
				j++; // skip spaces
			}

			let isSeparator = false;
			let k = j;
			while (k < header.length) {
				if (header[k] === "=") {
					isSeparator = true;
					break;
				}
				if (header[k] === ";" || header[k] === ",") {
					isSeparator = false;
					break;
				}
				k++;
			}

			if (isSeparator) {
				cookies.push(header.substring(start, i));
				start = i + 1;
				while (start < header.length && header[start] === " ") {
					start++;
				}
				i = start;
				continue;
			}
		}
		i++;
	}
	cookies.push(header.substring(start));
	return cookies.filter((c) => c.length > 0);
}

export function parseSetCookieHeader(
	setCookie: string | string[],
): Map<string, CookieAttributes> {
	const cookies = new Map<string, CookieAttributes>();
	const cookieArray = Array.isArray(setCookie)
		? setCookie
		: splitCookies(setCookie);

	cookieArray.forEach((cookieString) => {
		const parts = cookieString.split(";").map((part) => part.trim());
		const [nameValue, ...attributes] = parts;
		const [name, ...valueParts] = (nameValue || "").split("=");

		const value = valueParts.join("=");

		if (!name || value === undefined) {
			return;
		}

		const attrObj: CookieAttributes = { value };

		attributes.forEach((attribute) => {
			if (!attribute) {
				return;
			}
			const [attrName, ...attrValueParts] = attribute.split("=");
			const attrValue = attrValueParts.join("=");

			if (!attrName) {
				return;
			}

			const normalizedAttrName = attrName.trim().toLowerCase();

			switch (normalizedAttrName) {
				case "max-age":
					attrObj["max-age"] = attrValue
						? parseInt(attrValue.trim(), 10)
						: undefined;
					break;
				case "expires":
					attrObj.expires = attrValue ? new Date(attrValue.trim()) : undefined;
					break;
				case "domain":
					attrObj.domain = attrValue ? attrValue.trim() : undefined;
					break;
				case "path":
					attrObj.path = attrValue ? attrValue.trim() : undefined;
					break;
				case "secure":
					attrObj.secure = true;
					break;
				case "httponly":
					attrObj.httponly = true;
					break;
				case "samesite":
					attrObj.samesite = attrValue
						? (attrValue.trim().toLowerCase() as "strict" | "lax" | "none")
						: undefined;
					break;
				default:
					// Handle any other attributes
					attrObj[normalizedAttrName] = attrValue ? attrValue.trim() : true;
					break;
			}
		});

		cookies.set(name, attrObj);
	});

	return cookies;
}
