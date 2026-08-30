import { Navigate } from "react-router-dom";

export function LoginPage() {
  return <Navigate replace to="/auth?mode=login" />;
}
