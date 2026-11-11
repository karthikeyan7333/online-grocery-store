const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5510";

// Trim trailing slashes so existing endpoint paths join without duplicate slashes.
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");
