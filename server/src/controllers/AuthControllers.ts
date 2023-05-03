import { Request, Response } from "express"
import { OAuth2Client } from "google-auth-library"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, WEB_URL } from "../constants"
import jwt from "jsonwebtoken";
import { UserModel } from "../entity/User";
import { setCookie } from "../utils/setCookie";
import { createRefreshToken, verifyRefreshToken, createAccessToken } from "../utils/tokens";
import { GoogleUser } from "../types";
import axios from "axios";

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
    console.log("redirecting to google auth workflow", googleOauthUrl)
    res.redirect(googleOauthUrl);
}

export function refreshToken(req: Request, res: Response) {
    console.log(req.cookies);
    const token = req.cookies?.smark;
    if (!token) {
        res.status(200).json({
            error: "No token",
        })
        return;
    }
    const payload = verifyRefreshToken(token);
    if (!payload) {
        res.status(200).json({
            error: "Invalid token",
        })
        return;
    }
    res.status(200).json({
        accessToken: createAccessToken({
            userId: payload.userId,
            username: payload.username,
            tokenVersion: payload.tokenVersion,
        }),
    });
}

export async function handleGoogleCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    console.log("req query", req.query);
    if (!code) {
        // res.status(400).send("No code provided");
        res.redirect(WEB_URL + "?error=true");
        return;
    }
    const { tokens } = await client.getToken(code);
    if (!tokens) {
        res.redirect(WEB_URL + "?error=true");
    }
    const payload = jwt.decode(tokens.id_token!) as GoogleUser;

    const u = await UserModel.findOne({
        email: payload.email
    })

    if (u) {
        const uObj = u.toObject();
        setCookie(res, createRefreshToken({
            userId: uObj._id.toString(),
            username: uObj.username,
            tokenVersion: uObj.tokenVersion,
        }));
        res.redirect(WEB_URL + "?success=true");
        return;
    }

    const user = await UserModel.create({
        name: payload.name,
        img: payload.picture,
        username: "user-" + payload.at_hash.toLowerCase().slice(10),
        email: payload.email,
        tokenVersion: 0,
    });

    const uObj = user.toObject();
    setCookie(res, createRefreshToken({
        userId: uObj._id.toString(),
        username: uObj.username,
        tokenVersion: uObj.tokenVersion,
    }));

    console.log(payload);
    res.redirect(WEB_URL + "?success=true");
}

export async function handleChromeAuth(req: Request, res: Response) {
    const token = req.query.token as string;
    console.log("req query token: ", req.query.token);
    if (!token) {
        res.status(400).json({ err: "No code provided" });
        return;
    }
    let payload: GoogleUser;
    try {
        const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        console.log(res.data);
        payload = res.data as GoogleUser;
    } catch (err) {
        res.status(200).json({ err: "Invalid Token" });
        return;
    }
    console.log("payload: ", payload);

    const u = await UserModel.findOne({
        email: payload.email
    })

    if (u) {
        setCookie(res, createRefreshToken(u.toObject()));
        res.status(200).json({
            msg: "user authenticated", accessToken: createAccessToken({
                userId: u._id,
                tokenVersion: u.tokenVersion,
                username: u.username,
            })
        });
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

    res.status(200).json({
        msg: "user authenticated", accessToken: createAccessToken({
            userId: user._id,
            tokenVersion: user.tokenVersion,
            username: user.username,
        })
    });
}
