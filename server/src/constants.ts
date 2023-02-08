import dotenv from "dotenv";
dotenv.config();

export const DB_URI = process.env.DB_URI!;
export const REFRESH_SECRET = process.env.REFRESH_SECRET!;
export const ACCESS_SECRET = process.env.ACCESS_SECRET!;
export const PORT = process.env.PORT! || 42069;
