import { useState } from "react";
import AcademicProfileRoute from "./pages/academic/AcademicProfileRoute";
import Activities from "./pages/activities/Activities";
import Dashboard from "./pages/dashboard/Dashboard";
import DesignSystem from "./pages/design-system/DesignSystem";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { clearAuthSession, getAuthenticatedUser } from "./services/auth.service";

export default function App() {
  const [user, setUser] = useState(() => getAuthenticatedUser());
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";

  if (path === "/design-system") return <DesignSystem />;
  if (!user) {
    return path === "/register"
      ? <Register onRegisterSuccess={setUser} />
      : <Login onLoginSuccess={setUser} />;
  }

  const logout = () => {
    clearAuthSession();
    window.history.replaceState({}, "", "/");
    setUser(null);
  };

  if (path === "/academic-setup") return <AcademicProfileRoute userId={user.id} />;
  if (path === "/study-sessions") return <Activities userId={user.id} onBack={() => window.location.assign("/")} />;

  return <Dashboard
    firstName={user.firstName}
    onOpenAcademicProfile={() => window.location.assign("/academic-setup")}
    onOpenStudySessions={() => window.location.assign("/study-sessions")}
    onLogout={logout}
  />;
}
