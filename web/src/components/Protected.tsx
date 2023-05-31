import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/index";

type ProtectedProps = {
  children: React.ReactNode;
};

const Protected = ({ children }: ProtectedProps) => {
  const navigate = useNavigate();
  const auth = useSelector<RootState, boolean>(
    (state) => !!state.auth.user && !!state.auth.accessToken
  );

  useEffect(() => {
    if (!auth) {
      navigate("/");
    }
  }, []);

  if (!auth) {
    navigate("/");
    return null;
  }
  return <>{children}</>;
};

export default Protected;
