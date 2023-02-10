import { Request, Response } from "express"
import { OAuth2Client } from "google-auth-library"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, WEB_URL } from "../constants"
import jwt from "jsonwebtoken";
import { UserModel } from "../entity/User";
import { setCookie } from "../utils/setCookie";
import { createRefreshToken } from "../utils/tokens";
import { GoogleUser } from "../types";

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];
const googleOauthUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
});

export function redirectToGoogleAuthWorkflow(_: Request, res: Response) {
    res.redirect(googleOauthUrl);
}

export async function handleGoogleCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    console.log("req query", req.query);
    if (!code) {
        res.status(400).send("No code provided");
        return;
    }
    const { tokens } = await client.getToken(code);
    if (!tokens) {
        res.redirect(WEB_URL);
    }
    const payload = jwt.decode(tokens.id_token!) as GoogleUser;

    const u = await UserModel.findOne({
        email: payload.email
    })

    if (u) {
        setCookie(res, createRefreshToken(u.toObject()));
        res.redirect(WEB_URL);
        return;
    }

    const user = await UserModel.create({
        name: payload.name,
        img: payload.picture,
        username: "user-" + payload.at_hash.toLowerCase().slice(10),
        email: payload.email,
        tokenVersion: 0,
    });

    setCookie(res, createRefreshToken(user.toObject()));

    console.log(payload);
    res.redirect(WEB_URL);
}
