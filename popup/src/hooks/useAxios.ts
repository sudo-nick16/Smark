import axios from "axios";
import { SERVER_URL } from "../constants";
import jwt_decode from "jwt-decode";
import { useContext } from "react";
import { Store } from "../store/StoreProvider";

const useAxios = () => {
  const { state, setState } = useContext(Store);

  const myAxios = axios.create({
    baseURL: SERVER_URL,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${state.accessToken}`,
    },
    validateStatus: () => {
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
      setState({ accessToken: response.data.accessToken });
      return response.data.accessToken as string;
    } else {
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
          setState({ accessToken: token });
          return request;
        }
        return request;
      }

      if (state.accessToken && !(await isExpired(state.accessToken))) {
        request.headers["Authorization"] = `JWT ${state.accessToken}`;
        return request;
      }

      const token = await refreshToken();
      request.headers["Authorization"] = `JWT ${token}`;
      setState({ accessToken: token });
      return request;
    },
    async (error) => {
      return Promise.reject(error);
    }
  );

  myAxios.interceptors.response.use(
    async (response) => {
      if (response.data.accessToken) {
        setState({ accessToken: response.data.accessToken });
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
