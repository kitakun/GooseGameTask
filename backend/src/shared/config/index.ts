export const JWT_SECRET = process.env["JWT_SECRET"] || "fallback-secret";
export const FRONTEND_URL =
  process.env["FRONTEND_URL"] || "http://localhost:5173";
export const PORT = parseInt(process.env["PORT"] || "3001");
export const NODE_ENV = process.env["NODE_ENV"] || "development";
