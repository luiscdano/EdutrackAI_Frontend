import {
  useCallback,
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
  createAcademicProfile,
  getAcademicProfileByUser,
  updateAcademicProfile,
} from "./services/academic-profile.service";

import {
  clearAuthSession,
  getAuthenticatedUser,
} from "./services/auth.service";

import type { AcademicSettings } from "./types/academic.types";
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

  const [
    academicProfileId,
    setAcademicProfileId,
  ] = useState<string | null>(null);

  const [
    academicSettings,
    setAcademicSettings,
  ] = useState<AcademicSettings | null>(null);

  const [
    academicLoading,
    setAcademicLoading,
  ] = useState(
    currentPath === "/academic-setup",
  );

  const [
    academicError,
    setAcademicError,
  ] = useState<string | null>(null);

  const loadAcademicProfile =
    useCallback(async () => {
      if (!currentUser) {
        return;
      }

      try {
        const profile =
          await getAcademicProfileByUser(
            currentUser.id,
          );

        if (!profile) {
          setAcademicProfileId(null);
          setAcademicSettings(null);
          return;
        }

        setAcademicProfileId(profile.id);
        setAcademicSettings(
          profile.settings,
        );
      } catch (error) {
        setAcademicError(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el perfil académico.",
        );
      } finally {
        setAcademicLoading(false);
      }
    }, [currentUser]);

  useEffect(() => {
    if (
      !currentUser ||
      currentPath !== "/academic-setup"
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadAcademicProfile();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    currentPath,
    currentUser,
    loadAcademicProfile,
  ]);

  useEffect(() => {
    if (
      currentUser &&
      currentPath !== "/" &&
      currentPath !== "/academic-setup" &&
      currentPath !== "/design-system"
    ) {
      window.history.replaceState(
        {},
        "",
        "/",
      );
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

    setAcademicProfileId(null);
    setAcademicSettings(null);
    setAcademicError(null);

    window.history.replaceState(
      {},
      "",
      "/",
    );

    setCurrentUser(null);
  };

  const handleSaveAcademicProfile =
    async (
      settings: AcademicSettings,
    ) => {
      const savedProfile =
        academicProfileId
          ? await updateAcademicProfile(
              academicProfileId,
              settings,
            )
          : await createAcademicProfile(
              currentUser.id,
              settings,
            );

      setAcademicProfileId(
        savedProfile.id,
      );

      setAcademicSettings(
        savedProfile.settings,
      );
    };

  if (currentPath === "/academic-setup") {
    return (
      <AcademicSetup
        initialData={academicSettings}
        loading={academicLoading}
        error={academicError}
        onRetry={() => {
          setAcademicLoading(true);
          setAcademicError(null);
          void loadAcademicProfile();
        }}
        onSubmit={
          handleSaveAcademicProfile
        }
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
          onClick={() =>
            window.location.assign(
              "/academic-setup",
            )
          }
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