import { useState } from "react";

import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import AcademicProfileRoute from "./pages/academic/AcademicProfileRoute";
import AcademicManagement from "./pages/admin/AcademicManagement";
import Activities from "./pages/activities/Activities";
import Dashboard from "./pages/dashboard/Dashboard";
import DesignSystem from "./pages/design-system/DesignSystem";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  clearAuthSession,
  getAuthenticatedUser,
} from "./services/auth.service";

export default function App() {
  const [user, setUser] = useState(() => getAuthenticatedUser());
  const path =
    window.location.pathname
      .toLowerCase()
      .replace(/\/+$/, "") || "/";

  if (path === "/design-system") {
    return <DesignSystem />;
  }

  if (!user) {
    return path === "/register"
      ? <Register onRegisterSuccess={setUser} />
      : <Login onLoginSuccess={setUser} />;
  }

  const isAdmin = user.role.name.toLowerCase() === "admin";

  const logout = () => {
    clearAuthSession();
    window.history.replaceState({}, "", "/");
    setUser(null);
  };

  if (path === "/admin/academic-management") {
    if (isAdmin) {
      return <AcademicManagement />;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8">
        <Card padding="lg" className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-content">
            Acceso restringido
          </h1>
          <p className="mt-3 text-muted">
            Esta sección está disponible únicamente para administradores.
          </p>
          <Button
            className="mt-5"
            onClick={() => window.location.assign("/")}
          >
            Volver al dashboard
          </Button>
        </Card>
      </main>
    );
  }

  if (path === "/academic-setup") {
    return <AcademicProfileRoute userId={user.id} />;
  }

  if (path === "/study-sessions") {
    return (
      <Activities
        userId={user.id}
        onBack={() => window.location.assign("/")}
      />
    );
  }

  return (
    <Dashboard
      firstName={user.firstName}
      onOpenAcademicProfile={() =>
        window.location.assign("/academic-setup")
      }
      onOpenStudySessions={() =>
        window.location.assign("/study-sessions")
      }
      onOpenAdminAcademic={
        isAdmin
          ? () =>
              window.location.assign(
                "/admin/academic-management",
              )
          : undefined
      }
      onLogout={logout}
    />
  );
}
