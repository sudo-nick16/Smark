import React from "react";
import google from "../assets/google.png";
import close from "../assets/close.png";
import { SERVER_URL } from "../constants";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  RootState,
  setUser,
  toggleAuthModal,
  useAppDispatch,
} from "../store/index";
import useAxios from "../utils/useAxios";
import useSnackBarUtils from "../utils/useSnackBar";
import { isChrome } from "../utils/isChrome";

type AuthModalProps = {};

const AuthModal: React.FC<AuthModalProps> = () => {
  const api = useAxios();
  const { showSuccess, showError } = useSnackBarUtils();

  const show = useSelector((state: RootState) => state.modalBars.authModal);

  const appDispatch = useAppDispatch();

  const toggle = () => {
    appDispatch(toggleAuthModal());
  };

  const handleSignin = async () => {
    try {
      if (!isChrome()) {
        console.log("--web--");
        window.location.assign(`${SERVER_URL}/oauth/google`);
        return;
      }
    } catch (error) {
      console.log("error while fetching token in web: ", error);
      return;
    }
    try {
      console.log("--extension--");
      chrome.identity.getAuthToken(
        { interactive: true },
        async function (token) {
          const req = await axios.get(
            `${SERVER_URL}/oauth/chrome?token=${token}`,
            {
              withCredentials: true,
            }
          );
          if (!req.data.error) {
            console.log(req.data);
            const res = await api.get("/me");
            if (res.data.user) {
              appDispatch(setUser(res.data.user));
              showSuccess("Logged in successfully");
            }
            toggle();
            return;
          }
          showError("Error while logging in");
        }
      );
    } catch (err) {
      console.log("error while fetching token in extension: ", err);
      return;
    }
  };
  return (
    <>
      {show && (
        <div className="fixed z-50 backdrop-blur-sm h-[100dvh] w-full flex items-center justify-center">
          <div className="bg-black px-14 py-8 rounded-xl s-shadow flex flex-col items-center justify-center relative">
            <img
              src={close}
              alt="close"
              className="h-4 w-4 absolute top-3 left-3 cursor-pointer"
              onClick={toggle}
            />
            <h1 className="font-bold text-white text-3xl">Sign in to Smark</h1>
            <div
              onClick={handleSignin}
              className="bg-white rounded-full flex items-center py-2 px-4 mt-8 cursor-pointer"
            >
              <img src={google} alt="google" className="h-6 w-6" />
              <span className="ml-3 font-bold">Continue with google</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
