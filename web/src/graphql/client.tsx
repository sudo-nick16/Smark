import { authExchange } from "@urql/exchange-auth";
import axios from "axios";
import { useAtom } from "jotai";
import { createClient, Provider } from "urql";
import { SERVER_URL } from "../constants";
import { accessTokenAtom, isAuthAtom } from "../state";
import jwt_decode from "jwt-decode";

export function UrqlProvider({ children }: { children: React.ReactNode }) {
    const [isAuth, setIsAuth] = useAtom(isAuthAtom);
    const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
    const client = createClient({
        url: SERVER_URL,
        // fetchOptions: () => {
        //     return {
        //         headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' },
        //     };
        // },
        exchanges: [
            authExchange<{ accessToken: string }>({
                addAuthToOperation: ({ authState, operation }) => {
                    // the token isn't in the auth state, return the operation without changes
                    if (!authState || !authState.accessToken) {
                        return operation;
                    }

                    // fetchOptions can be a function (See Client API) but you can simplify this based on usage
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
                                    "Authorization": authState.accessToken,
                                },
                            },
                        },
                    };
                },
                willAuthError: ({ authState }) => {
                    if (!authState || !authState.accessToken) {
                        return true;
                    }
                    if (jwt_decode<{ exp: number }>(authState.accessToken).exp * 1000 <= Date.now()) {
                        return true;
                    }
                    return false;
                },
                getAuth: async ({ authState }) => {
                    const fetchToken = async () => {
                        const req = await axios.post(`${SERVER_URL}/auth/refresh-token`, {}, {
                            withCredentials: true
                        })

                        if (req.data.error || !req.data.accessToken) {
                            setIsAuth(false);
                            return null;
                        }

                        setAccessToken(req.data.accessToken);
                        setIsAuth(true);
                        return {
                            accessToken: req.data.accessToken,
                        }
                    }
                    // for initial launch, fetch the auth state from storage (local storage, async storage etc)
                    if (!authState) {
                        return await fetchToken();
                    }

                    /**
                     * the following code gets executed when an auth error has occurred
                     * we should refresh the token if possible and return a new auth state
                     * If refresh fails, we should log out
                     **/

                    // if your refresh logic is in graphQL, you must use this mutate function to call it
                    // if your refresh logic is a separate RESTful endpoint, use fetch or similar

                    const req = await axios.post(`${SERVER_URL}/auth/refresh-token`, {}, {
                        withCredentials: true
                    })

                    if (req.data.error || !req.data.accessToken) {
                        setIsAuth(false);
                        return null;
                    }

                    setAccessToken(req.data.accessToken);
                    setIsAuth(true);
                    return {
                        accessToken: req.data.accessToken,
                    }
                }
            }),

        ]
    });
    return (
        <Provider value={client} >
            {children}
        </Provider>
    )
}
