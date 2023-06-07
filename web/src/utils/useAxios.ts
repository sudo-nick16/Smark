import axios from "axios";
import { SERVER_URL } from "../constants";
import jwt_decode from "jwt-decode";
import { useSelector } from "react-redux";
import store, {
  logout,
  RootState,
  setAccessToken,
  useAppDispatch,
} from "../store/index";

const useAxios = () => {
  const appDispatch = useAppDispatch();
  const authState = store.getState().auth;

  const myAxios = axios.create({
    baseURL: SERVER_URL,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${authState.accessToken}`,
    },
    validateStatus: (status) => {
      // don't want axios throwin error on 4xx and 5xx #sorry axios
      return true;
    },
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
      console.log("setting access token: ", response.data.accessToken);
      appDispatch(setAccessToken(response.data.accessToken));
      return response.data.accessToken as string;
    } else {
      console.log("logging out because couldn't refresh");
      appDispatch(logout());
      return "";
    }
  };

  const isExpired = async (tokenStr: string) => {
    if (!isValid(tokenStr)) {
      return false;
    }
    try {
      const { exp } = (await jwt_decode(tokenStr.split(" ")[1])) as {
        exp: number;
      };
      const expired = Date.now() >= exp * 1000;
      if (!expired) {
        console.log("token is not expired");
        return false;
      }
    } catch (err) {
      console.log("expired");
    }
    return true;
  };

  const isValid = (token: string) => {
    const tokenArr = token.split(" ");
    if (tokenArr.length !== 2) {
      return false;
    }
    if (tokenArr[0] !== "JWT") {
      return false;
    }
    if (!tokenArr[1]) {
      return false;
    }
    return true;
  };

  myAxios.interceptors.request.use(
    async (request) => {
      const authState = store.getState().auth;
      console.log(
        "authstate inside axios",
        authState,
        request.headers.Authorization,
        isValid(request.headers.Authorization as string)
      );

      if (isValid(request.headers.Authorization as string)) {
        const expired = await isExpired(
          request.headers.Authorization as string
        );
        if (!expired) {
          return request;
        }
        const token = await refreshToken();
        if (token) {
          request.headers["Authorization"] = `JWT ${token}`;
          appDispatch(setAccessToken(token));
          return request;
        }
        return request;
      }

      if (authState.accessToken && !(await isExpired(authState.accessToken))) {
        request.headers["Authorization"] = `JWT ${authState.accessToken}`;
        return request;
      }

      console.log("fetching token");
      const token = await refreshToken();
      request.headers["Authorization"] = `JWT ${token}`;
      appDispatch(setAccessToken(token));
      return request;
    },
    async (error) => {
      console.log("axios error req", error);
      return Promise.reject(error);
    }
  );

  myAxios.interceptors.response.use(
    async (response) => {
      if (response.data.accessToken) {
        console.log("setting access token");
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
  return myAxios;
};

export default useAxios;
