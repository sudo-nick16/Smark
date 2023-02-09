import { Request, Response } from "express";

export class TokenPayload {
    userId: string;
    username: string;
    tokenVersion: number;
}

export class Context {
    req: Request;
    res: Response;
    user: TokenPayload | undefined;
}
