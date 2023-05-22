import axios from "axios";
import { SERVER_URL } from "../constants";
import jwt_decode from "jwt-decode";
import { useSelector } from "react-redux";
import { logout, RootState, setAccessToken, useAppDispatch } from "../store/index";

const useAxios = () => {
    const authState = useSelector<RootState, RootState['auth']>(state => state.auth);
    const appDispatch = useAppDispatch();

    const axiosA = axios.create({
        baseURL: SERVER_URL,
        timeout: 5000,
        headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${authState.accessToken}`,
        },
        validateStatus: (status) => {
            // don't want axios throwin error on 4xx and 5xx #sorry axios
            return true
        }
    });

    const refreshToken = async () => {
        console.log("refreshing token");
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
            appDispatch(setAccessToken(response.data.accessToken));
            return response.data.accessToken;
        } else {
            console.log("logging out because couldn't refresh");
            appDispatch(logout());
            return "";
        }
    };

    axiosA.interceptors.request.use(
        async (request) => {
            request.headers["Authorization"] = `Bearer ${authState.accessToken}`;

            let isExpired = true;

            try {
                const { exp } = await jwt_decode(authState.accessToken) as { exp: number };
                isExpired = Date.now() >= exp * 1000;
                if (!isExpired) {
                    console.log("token is not expired");
                    return request;
                }
            } catch (err) {
                console.log("expired");
            }
            const accessToken = await refreshToken();
            request.headers["Authorization"] = `Bearer ${accessToken}`;
            return request;
        },
        function(error) {
            console.log("axios error req", error);
            return Promise.reject(error);
        }
    );

    axiosA.interceptors.response.use(
        async (response) => {
            if (response.data.accessToken) {
                console.log("setting user");
                appDispatch(setAccessToken(response.data.accessToken));
            }
            return response;
        },
        async (error) => {
            console.log("axios error", error, error.response.data.error);
            if (error.response.data.authFailed) {
                console.log("logging out because auth failed");
                appDispatch(logout());
            }
            return Promise.reject(error);
        }
    );

    return axiosA;
};

export default useAxios;
