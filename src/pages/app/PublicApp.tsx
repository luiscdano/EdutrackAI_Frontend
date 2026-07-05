import DesignSystem from "../design-system/DesignSystem";
import Login from "../login/Login";
import Register from "../register/Register";
import type { AuthenticatedUser } from "../../types/auth.types";

interface Props { onAuth: (user: AuthenticatedUser) => void; }

export default function PublicApp({ onAuth }: Props) {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  if (path === "/design-system") return <DesignSystem />;
  if (path === "/register") return <Register onRegisterSuccess={onAuth} />;
  return <Login onLoginSuccess={onAuth} />;
}
