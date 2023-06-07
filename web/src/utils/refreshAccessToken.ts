import axios from "axios";
import { SERVER_URL } from "../constants";
import { logout, setAccessToken, useAppDispatch } from "../store/index";

const refreshAccessToken = async () => {
  const appDispatch = useAppDispatch();
  try {
    const response = await axios.post(
      `${SERVER_URL}/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    );
    console.log("refresh token response", response.data);
    if (!response.data?.error && response.data?.accessToken) {
      appDispatch(setAccessToken(response.data.accessToken));
      return response.data.accessToken;
    }
  } catch (err) {
    console.log(err);
  }
  appDispatch(logout());
  return "";
};

export default refreshAccessToken;
