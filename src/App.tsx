import {
  useEffect,
  useState,
} from "react";

import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import AcademicSetup from "./pages/academic/AcademicSetup";
import DesignSystem from "./pages/design-system/DesignSystem";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import {
  clearAuthSession,
  getAuthenticatedUser,
} from "./services/auth.service";
import type { AuthenticatedUser } from "./types/auth.types";

function App() {
  const [currentUser, setCurrentUser] =
    useState<AuthenticatedUser | null>(() =>
      getAuthenticatedUser(),
    );

  const currentPath =
    window.location.pathname
      .toLowerCase()
      .replace(/\/+$/, "") || "/";

  useEffect(() => {
    if (
      currentUser &&
      currentPath !== "/" &&
      currentPath !== "/academic-setup" &&
      currentPath !== "/design-system"
    ) {
      window.history.replaceState({}, "", "/");
    }
  }, [currentUser, currentPath]);

  if (currentPath === "/design-system") {
    return <DesignSystem />;
  }

  if (!currentUser) {
    if (currentPath === "/register") {
      return (
        <Register
          onRegisterSuccess={setCurrentUser}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={setCurrentUser}
      />
    );
  }

  const handleLogout = () => {
    clearAuthSession();
    window.history.replaceState({}, "", "/");
    setCurrentUser(null);
  };

  const handleAcademicSetup = () => {
    window.location.assign("/academic-setup");
  };

  if (currentPath === "/academic-setup") {
    return (
      <AcademicSetup
        onContinueToDashboard={() =>
          window.location.assign("/")
        }
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8">
      <Card
        padding="lg"
        className="max-w-lg text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Sesión iniciada
        </p>

        <h1 className="mt-3 text-3xl font-bold text-content">
          Bienvenida, {currentUser.firstName}
        </h1>

        <p className="mt-3 text-muted">
          {currentUser.email}
        </p>

        <p className="mt-1 text-sm text-muted">
          Rol: {currentUser.role.name}
        </p>

        <Button
          fullWidth
          className="mt-6"
          onClick={handleAcademicSetup}
        >
          Configurar perfil académico
        </Button>

        <Button
          variant="outline"
          fullWidth
          className="mt-3"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </Card>
    </main>
  );
}

export default App;
