import dotenv from "dotenv";
dotenv.config();

export const DB_URI = process.env.DB_URI!;
export const REFRESH_SECRET = process.env.REFRESH_SECRET!;
export const ACCESS_SECRET = process.env.ACCESS_SECRET!;
export const PORT = process.env.PORT! || 42069;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
export const GOOGLE_CLIENT_SECRET= process.env.GOOGLE_CLIENT_SECRET!;
export const WEB_URL= process.env.WEB_URL!;
export const COOKIE_NAME= process.env.COOKIE_NAME!;
