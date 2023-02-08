import { REFRESH_SECRET, ACCESS_SECRET } from "../constants";
import jwt from "jsonwebtoken";
import { TokenPayload } from "src/graphql-types/Context";

export function createAccessToken(payload: TokenPayload): string {
    const token = jwt.sign(payload, ACCESS_SECRET, {
        algorithm: "HS512",
        expiresIn: '15m',
        subject: payload.username,
        issuer: "smark",
        allowInsecureKeySizes: false,
        allowInvalidAsymmetricKeyTypes: false,
    });
    return token
}

export function createRefreshToken(payload: TokenPayload): string {
    const token = jwt.sign(payload, REFRESH_SECRET, {
        algorithm: "HS512",
        expiresIn: '7d',
        subject: payload.username,
        issuer: "smark",
        allowInsecureKeySizes: false,
        allowInvalidAsymmetricKeyTypes: false,
    });
    return token
}

export function verifyAccessToken(token: string): TokenPayload | undefined {
    try {
        const tokenObj = jwt.verify(token, ACCESS_SECRET, {
            algorithms: ["HS512"],
            complete: true,
            issuer: "smark",
            ignoreExpiration: false,
            allowInvalidAsymmetricKeyTypes: false,
        });
        if (!tokenObj) {
            return undefined;
        }
        const payload = tokenObj.payload as TokenPayload;
        return payload;
    } catch (e) {
        return undefined;
    }
}

export function verifyRefreshToken(token: string): TokenPayload | undefined {
    try {
        const tokenObj = jwt.verify(token, REFRESH_SECRET, {
            algorithms: ["HS512"],
            complete: true,
            issuer: "smark",
            ignoreExpiration: false,
            allowInvalidAsymmetricKeyTypes: false,
        });
        if (!tokenObj) {
            return undefined;
        }
        const payload = tokenObj.payload as TokenPayload;
        return payload;
    } catch (e) {
        return undefined;
    }
}
