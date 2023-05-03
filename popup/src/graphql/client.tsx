import { authExchange } from "@urql/exchange-auth";
import axios from "axios";
import { cacheExchange, createClient, dedupExchange, fetchExchange, Provider } from "urql";
import { SERVER_URL } from "../constants";
import jwt_decode from "jwt-decode";
import { useAtom } from "jotai";
import { isAuthAtom } from "../state/state";
import { useMemo } from "react";

export function UrqlProvider({ children }: { children: React.ReactNode }) {
    const [, setIsAuth] = useAtom(isAuthAtom);

    const client = useMemo(() => createClient({
        url: SERVER_URL+"/graphql",
        exchanges: [
            dedupExchange,
            cacheExchange,
            authExchange<{ accessToken: string }>({
                getAuth: async ({ authState }) => {
                    const fetchToken = async () => {
                        const req = await axios.post(`${SERVER_URL}/auth/refresh-token`, {}, {
                            withCredentials: true
                        })

                        if (req.data.error || !req.data.accessToken) {
                            setIsAuth(false);
                            return null;
                        }

                        setIsAuth(true);
                        return {
                            accessToken: req.data.accessToken,
                        }
                    }
                    return await fetchToken();
                },
                addAuthToOperation: ({ authState, operation }) => {
                    console.log("authState = ", authState)
                    if (!authState || !authState.accessToken) {
                        return operation;
                    }

                    const fetchOptions =
                        typeof operation.context.fetchOptions === 'function'
                            ? operation.context.fetchOptions()
                            : operation.context.fetchOptions || {};

                    return {
                        ...operation,
                        context: {
                            ...operation.context,
                            fetchOptions: {
                                ...fetchOptions,
                                headers: {
                                    ...fetchOptions.headers,
                                    "Authorization": `Bearer ${authState.accessToken}`,
                                },
                            },
                        },
                    };
                },
                didAuthError: ({ authState }) => {
                    return false;
                },
                willAuthError: ({ authState }) => {
                    if (!authState || !authState.accessToken) {
                        console.log("no token")
                        return true;
                    }
                    if (jwt_decode<{ exp: number }>(authState.accessToken).exp * 1000 <= Date.now()) {
                        console.log("token expired")
                        return true;
                    }
                    return false;
                },
            }),
            fetchExchange,
        ]
    }), []);
    return (
        <Provider value={client} >
            {children}
        </Provider>
    )
}

