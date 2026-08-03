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
    "Failed to authenticate user":
      "El servidor no pudo completar el inicio de sesión.",
    "Internal server error": "Ocurrió un error interno en el servidor.",
  };

  return errorMessages[error.message] ?? error.message;
};

const GraduationIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 8 9-4 9 4-9 4-9-4Z" />
    <path d="M7 10.2V15c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.8" />
    <path d="M21 8v5" />
  </svg>
);

const JourneyIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 7.2c4 1.1 4.2 4.8 8 5.7" />
    <path d="m14 11 2 2-2 2" />
  </svg>
);

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [credentials, setCredentials] =
    useState<LoginCredentials>(initialCredentials);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

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
      const authData = await loginUser({
        email,
        password: credentials.password,
      });
      onLoginSuccess(authData.user);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccount = async () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD as
      | string
      | undefined;

    if (!demoEmail || !demoPassword) {
      setErrorMessage(
        "La cuenta de demostración todavía no está configurada.",
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const authData = await loginUser({
        email: demoEmail,
        password: demoPassword,
      });
      onLoginSuccess(authData.user);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete =
    credentials.email.trim() !== "" && credentials.password !== "";

  const journeySteps = [
    ["1", "Entender", "Revisa cómo vas"],
    ["2", "Organizar", "Prepara tu semana"],
    ["3", "Estudiar", "Sigue una actividad"],
    ["4", "Mejorar", "Ajusta el plan"],
  ];

  return (
    <main className="login-shell grid min-h-dvh bg-surface lg:grid-cols-[48%_52%]">
      <section className="auth-identity-pattern login-left-panel hidden min-h-dvh flex-col justify-between px-11 py-8 text-white lg:flex xl:px-14">
        <div className="login-brand flex items-center gap-3">
          <span className="grid h-[52px] w-[52px] place-items-center rounded-[14px] bg-white text-[#315765] shadow-sm">
            <GraduationIcon />
          </span>
          <span>
            <strong className="block text-[18px] font-extrabold leading-tight">
              EduTrack
            </strong>
            <small className="mt-1 block text-[11px] font-semibold text-white/70">
              Tu guía académica personal
            </small>
          </span>
        </div>

        <div className="login-left-content max-w-[650px]">
          <span className="login-journey-badge inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/90">
            <JourneyIcon />
            Del progreso a una acción clara
          </span>

          <h1 className="login-hero-title mt-6 max-w-[660px] text-[clamp(2.45rem,4.2vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.045em]">
            No solo mires tus notas.
            <br />
            Entiende qué hacer después.
          </h1>

          <p className="login-hero-copy mt-4 max-w-[610px] text-[16px] leading-7 text-white/88">
            EduTrack reúne tus materias, resultados y hábitos de estudio para
            ayudarte a avanzar con una guía clara, realista y ajustable.
          </p>

          <div className="login-journey mt-6 rounded-[18px] border border-white/20 bg-white/[0.055] p-4">
            <div className="login-journey-heading mb-3 flex items-center justify-between gap-3 text-[13px]">
              <strong>Así funciona tu recorrido</strong>
              <span className="text-[11px] text-white/65">
                Sin presión y a tu ritmo
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {journeySteps.map(([number, title, detail], index) => (
                <div
                  key={number}
                  className={`login-journey-card min-h-[108px] rounded-[13px] border border-white/15 p-3 ${
                    index === 0 ? "bg-white/14" : "bg-white/[0.065]"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold ${
                      index === 0
                        ? "bg-white text-[#315765]"
                        : "bg-white/12 text-white"
                    }`}
                  >
                    {number}
                  </span>
                  <strong className="mt-2.5 block text-[12px]">{title}</strong>
                  <small className="mt-1 block text-[10px] leading-4 text-white/65">
                    {detail}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="login-left-footer flex items-center justify-between gap-4 text-[10px] text-white/65">
          <span className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[#a8c6b9]" />
            Plataforma disponible
          </span>
          <span>Aprendizaje organizado a tu ritmo</span>
        </div>
      </section>

      <section className="login-right-panel flex min-h-dvh items-center justify-center overflow-y-auto bg-[#fffefa] px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="login-right-content w-full max-w-[530px]">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
              <GraduationIcon />
            </span>
            <span>
              <strong className="block text-base text-content">EduTrack</strong>
              <small className="text-[10px] text-muted">
                Tu guía académica personal
              </small>
            </span>
          </div>

          <div className="login-tabs grid grid-cols-2 gap-1 rounded-[14px] bg-surface-muted p-1.5">
            <button
              type="button"
              className="min-h-[46px] rounded-[11px] bg-surface px-4 text-sm font-bold text-content shadow-sm"
              aria-current="page"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/register")}
              className="min-h-[46px] rounded-[11px] px-4 text-sm font-bold text-muted transition hover:bg-surface/70 hover:text-content"
            >
              Crear perfil
            </button>
          </div>

          <div className="login-heading-block mt-3">
            <span className="prototype-eyebrow">Bienvenida nuevamente</span>
            <h2 className="login-heading mt-2.5 max-w-[480px] text-[clamp(1.9rem,2.8vw,2.45rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-content">
              Continúa desde donde te quedaste.
            </h2>
            <p className="login-description mt-3 max-w-[510px] text-[14px] leading-6 text-muted">
              Accede a tus materias, tu progreso y la actividad que tienes
              preparada para hoy.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="login-form mt-5 space-y-3.5">
            {errorMessage && (
              <Alert variant="danger" title="No se pudo iniciar sesión">
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
              className="login-field min-h-[48px] bg-[#fffefa]"
            />

            <PasswordInput
              label="Contraseña"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isSubmitting}
              required
              className="login-field min-h-[48px] bg-[#fffefa]"
            />

            <label className="flex w-max cursor-pointer items-center gap-3 text-[13px] font-medium text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Mantener mi sesión
            </label>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              disabled={!isFormComplete || isSubmitting}
              className="login-primary-button min-h-[48px] text-[15px]"
            >
              {isSubmitting ? "Iniciando sesión" : "Entrar a mi espacio"}
            </Button>

            <div className="login-divider flex items-center gap-3 text-[11px] text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              o continúa explorando
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => void handleDemoAccount()}
              disabled={isSubmitting}
              className="login-demo-button min-h-[46px] border-0 bg-surface-muted text-[14px] font-bold hover:bg-primary/10"
            >
              Ver una cuenta de demostración
            </Button>
          </form>

          <div className="login-privacy mt-4 grid grid-cols-[30px_1fr] gap-3 rounded-[14px] bg-success/15 px-4 py-3">
            <span className="pt-0.5 text-lg text-success">✓</span>
            <div>
              <strong className="block text-[11px] text-success">
                Tu información académica permanece privada.
              </strong>
              <p className="mt-0.5 text-[10px] leading-4 text-muted">
                Solo se utiliza para organizar tu experiencia de estudio.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
