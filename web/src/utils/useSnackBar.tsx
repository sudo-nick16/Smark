import {
  closeSnackBar,
  showErrorMessage,
  showSuccessMessage,
  useAppDispatch,
} from "../store/index";

const useSnackBarUtils = () => {
  const appDispatch = useAppDispatch();

  const showError = (message: string) => {
    appDispatch(showErrorMessage(message));
    setTimeout(() => {
      appDispatch(closeSnackBar());
    }, 1000);
  };

  const showSuccess = (message: string) => {
    appDispatch(showSuccessMessage(message));
    setTimeout(() => {
      appDispatch(closeSnackBar());
    }, 1000);
  };

  return { showSuccess, showError };
};

export default useSnackBarUtils;
