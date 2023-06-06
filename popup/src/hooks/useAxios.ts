import axios from "axios";
import { SERVER_URL } from "../constants";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import { Store } from "../store/StoreProvider";

const useAxios = () => {
    const { state, setState } = useContext(Store)!;

    const myAxios = axios.create({
        baseURL: SERVER_URL,
        timeout: 5000,
        headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${state.accessToken}`,
        },
        validateStatus: (_) => {
            return true;
        },
    });

    const refreshToken = async (): Promise<string> => {
        try {
            const response = await axios.post(
                `${SERVER_URL}/refresh-token`,
                {},
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (!response.data.error && response.data.accessToken) {
                return response.data.accessToken;
            }
        } catch (e) {
            console.log("error: ", e);
        }
        return "";
    };

    myAxios.interceptors.request.use(
        async (request) => {
            request.headers["Authorization"] = `JWT ${state.accessToken}`;
            let isExpired = true;
            try {
                const { exp } = (await jwt_decode(state.accessToken)) as {
                    exp: number;
                };
                isExpired = Date.now() >= exp * 1000;
                if (!isExpired) {
                    return request;
                }
            } catch (err) {
                console.log("error: ", err);
            }
            const accessToken = await refreshToken();
            setState({ accessToken });
            request.headers["Authorization"] = `JWT ${accessToken}`;
            return request;
        },
        function (error) {
            return Promise.reject(error);
        }
    );

    myAxios.interceptors.response.use(
        async (response) => {
            if (response.data.accessToken) {
                setState({
                    accessToken: response.data.accessToken,
                });
            }
            return response;
        },
        async (error) => {
            return Promise.reject(error);
        }
    );

    return myAxios;
};

export default useAxios;
