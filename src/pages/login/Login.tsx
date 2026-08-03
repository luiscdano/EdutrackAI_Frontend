import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { loginUser } from "../../services/auth.service";
import type {
  AuthenticatedUser,
  LoginCredentials,
} from "../../types/auth.types";

interface LoginProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
}

const initialCredentials: LoginCredentials = {
  email: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLoginErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return "No se pudo iniciar sesión.";

  const errorMessages: Record<string, string> = {
    "Invalid credentials": "Correo o contraseña incorrectos.",
    "Validation error": "Verifica que los datos introducidos sean válidos.",
    "Failed to authenticate user": "El servidor no pudo completar el inicio de sesión.",
    "Internal server error": "Ocurrió un error interno en el servidor.",
  };

  return errorMessages[error.message] ?? error.message;
};

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>(initialCredentials);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setRecoveryNotice(false);

    const email = credentials.email.trim();

    if (!email) {
      setErrorMessage("Introduce tu correo electrónico.");
      return;
    }

    if (!emailPattern.test(email)) {
      setErrorMessage("Introduce un correo electrónico válido.");
      return;
    }

    if (!credentials.password) {
      setErrorMessage("Introduce tu contraseña.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await loginUser({ email, password: credentials.password });
      onLoginSuccess(authData.user);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete =
    credentials.email.trim() !== "" && credentials.password !== "";

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[minmax(380px,0.96fr)_minmax(410px,1.04fr)]">
      <section className="auth-identity-pattern hidden min-h-screen flex-col justify-between p-9 text-white lg:flex xl:p-12">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-extrabold text-[#315765]">ET</span>
          <span>
            <strong className="block text-base">EduTrack AI</strong>
            <small className="block text-[10px] font-medium text-white/60">Aprendizaje con propósito</small>
          </span>
        </div>

        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-2 text-[11px] text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#a8c6b9]" />
            Tu espacio académico personalizado
          </span>
          <h1 className="mt-5 max-w-lg text-[clamp(2.15rem,4vw,3.15rem)] font-bold leading-[1.08] tracking-[-0.045em]">
            Aprende con claridad, avanza con calma.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-white/72">
            Organiza tus materias, identifica prioridades y convierte cada sesión de estudio en un paso concreto hacia tus objetivos.
          </p>

          <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.075] p-4">
            <div className="mb-3 flex items-center justify-between text-xs">
              <strong>Tu recorrido en EduTrack</strong>
              <span className="text-[10px] text-white/55">Simple y guiado</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                ["1", "Conoce", "Tu situación"],
                ["2", "Prioriza", "Lo importante"],
                ["3", "Practica", "Con enfoque"],
                ["4", "Mejora", "Con evidencia"],
              ].map(([number, title, detail], index) => (
                <div key={number} className={`min-h-28 rounded-xl border border-white/10 p-3 ${index === 0 ? "bg-white/15" : "bg-white/[0.055]"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${index === 0 ? "bg-white text-[#315765]" : "bg-white/10"}`}>
                    {number}
                  </span>
                  <strong className="mt-2.5 block text-[11px]">{title}</strong>
                  <small className="mt-1 block text-[9px] text-white/50">{detail}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/50">
          <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#a8c6b9]" /> Plataforma disponible</span>
          <span>Tu información académica permanece protegida</span>
        </div>
      </section>

      <section className="app-grid-background grid min-h-screen place-items-center px-4 py-8 sm:px-7 lg:px-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-hover text-xs font-extrabold text-white">ET</span>
            <span>
              <strong className="block text-base text-content">EduTrack AI</strong>
              <small className="block text-[10px] text-muted">Aprendizaje con propósito</small>
            </span>
          </div>

          <span className="prototype-eyebrow">Bienvenida de nuevo</span>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-content">Inicia sesión</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Continúa desde donde lo dejaste y revisa tu siguiente paso académico.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            {errorMessage && (
              <Alert variant="danger" title="No se pudo iniciar sesión">
                {errorMessage}
              </Alert>
            )}

            {recoveryNotice && (
              <div role="status" className="rounded-xl border border-border bg-surface-muted p-3 text-xs leading-5 text-muted">
                La recuperación por correo todavía no está disponible. Por ahora, solicita a un administrador que restablezca tu acceso.
              </div>
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
              label="Contraseña"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />

            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                Recordarme
              </label>
              <button
                type="button"
                onClick={() => setRecoveryNotice(true)}
                className="font-semibold text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={!isFormComplete || isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión" : "Iniciar sesión"}
            </Button>

            <div className="flex items-center gap-3 py-1 text-[10px] text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              o comienza ahora
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => window.location.assign("/register")}
            >
              Crear una cuenta de estudiante
            </Button>
          </form>

          <div className="mt-6 grid grid-cols-[30px_1fr] gap-2.5 rounded-xl bg-success/10 p-3 text-[10px] leading-5 text-muted">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">✓</span>
            <p>Usamos tu información únicamente para personalizar la experiencia académica y proteger tu cuenta.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
