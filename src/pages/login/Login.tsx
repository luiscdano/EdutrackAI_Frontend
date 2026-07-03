import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { loginUser } from "../../services/auth.service";
import type {
  AuthenticatedUser,
  LoginCredentials,
} from "../../types/auth.types";

interface LoginProps {
  onLoginSuccess: (
    user: AuthenticatedUser,
  ) => void;
}

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
};

const getLoginErrorMessage = (
  error: unknown,
): string => {
  if (!(error instanceof Error)) {
    return "No se pudo iniciar sesión.";
  }

  if (error.message === "Invalid credentials") {
    return "Correo o contraseña incorrectos.";
  }

  return error.message;
};

const Login = ({
  onLoginSuccess,
}: LoginProps) => {
  const [credentials, setCredentials] =
    useState<LoginCredentials>(
      initialCredentials,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const authData = await loginUser({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      onLoginSuccess(authData.user);
    } catch (error) {
      setErrorMessage(
        getLoginErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full overflow-x-hidden bg-app-bg">
      {/* Panel izquierdo: solo escritorio */}
      <section className="hidden min-h-screen min-w-0 w-1/2 items-center justify-center bg-slate-950 lg:flex">
        <div className="w-full max-w-2xl px-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-content">
            EduTrack{" "}
            <span className="text-primary">
              AI
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted">
            Plataforma educativa inteligente para
            mejorar el rendimiento académico mediante
            recomendaciones personalizadas.
          </p>
        </div>
      </section>

      {/* Panel derecho */}
      <section className="flex min-h-screen min-w-0 w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Logo móvil */}
          <div className="mb-8 w-full text-center lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
              EduTrack{" "}
              <span className="text-primary">
                AI
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
              Plataforma educativa inteligente
            </p>
          </div>

          <Card padding="md">
            <h2 className="mb-6 text-center text-2xl font-bold text-content">
              Iniciar sesión
            </h2>

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="space-y-5">
                {errorMessage && (
                  <Alert
                    variant="danger"
                    title="No se pudo iniciar sesión"
                  >
                    {errorMessage}
                  </Alert>
                )}

                <Input
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                />

                <PasswordInput
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="mb-6 mt-3 text-right">
                <button
                  type="button"
                  className="text-sm text-primary transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={
                  !credentials.email.trim() ||
                  !credentials.password
                }
              >
                {isSubmitting
                  ? "Iniciando sesión"
                  : "Iniciar sesión"}
              </Button>
              <div className="mt-6 text-center text-sm text-muted">
  ¿No tienes una cuenta?{" "}
  <button
    type="button"
    onClick={() =>
      window.location.assign("/register")
    }
    className="font-semibold text-primary transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    Crear cuenta
  </button>
</div>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Login;