import React from "react";
import closeBtnImg from "../assets/close.png";
import { useSelector } from "react-redux";
import { closeSnackBar, RootState, useAppDispatch } from "../store/index";

type SnackBarProps = {
  className?: string;
};

const SnackBar: React.FC<SnackBarProps> = ({ className = "" }) => {
  const appDispatch = useAppDispatch();

  const snackState = useSelector<RootState, RootState["snackBar"]>(
    (state) => state.snackBar
  );

  const closeBtn = () => {
    appDispatch(closeSnackBar());
  };

  return (
    <div
      className={`z-30 fixed max-w-[95%] w-full md:w-[50%] justify-between flex items-center py-2 px-4 transition-all font-bold duration-100 overflow-hidden left-1/2 rounded-lg -translate-x-1/2 ${
        snackState.error ? "bg-red-500" : "bg-green-400 text-black"
      } ${snackState.isOpen ? "h-auto top-2" : "!h-0 -top-2 !p-0"}`}
    >
      {snackState.message}
      <img
        src={closeBtnImg}
        onClick={closeBtn}
        alt="close-btn"
        className="ml-3 w-3 h-3 hover:scale-105 cursor-pointer"
      />
    </div>
  );
};

export default SnackBar;
