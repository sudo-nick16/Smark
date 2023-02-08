import { Request, Response } from "express";

export type TokenPayload = {
    userId: string,
    username: string,
    tokenVersion: number,
}

export type Context = {
    req: Request;
    res: Response;
    user: TokenPayload | undefined;
}
