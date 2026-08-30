import { Navigate } from "react-router-dom";

export function SignupPage() {
  return <Navigate replace to="/auth?mode=signup" />;
}
