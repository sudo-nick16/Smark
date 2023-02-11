import { Response } from "express";
import { COOKIE_NAME } from "../constants";

export function setCookie(res: Response, cookieValue: string) {
    res.cookie(COOKIE_NAME, cookieValue, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    })
}

