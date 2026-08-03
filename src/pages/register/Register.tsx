import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { registerUser } from "../../services/auth.service";
import type {
  AuthenticatedUser,
  RegisterData,
} from "../../types/auth.types";

interface RegisterProps {
  onRegisterSuccess: (user: AuthenticatedUser) => void;
}

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

const initialFormData: RegisterFormData = {
  firstName: "",
  lastName: "",
  studentCode: "",
  career: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const getRegisterErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return "No se pudo completar el registro.";
  if (error.message === "Email is already registered") return "Este correo electrónico ya está registrado.";
  if (error.message === "Student code is already registered") return "Esta matrícula ya está registrada.";
  if (error.message === "Default student role is not configured") return "El rol de estudiante no está configurado.";
  return error.message;
};

const Register = ({ onRegisterSuccess }: RegisterProps) => {
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fieldName = event.target.name as keyof RegisterFormData;
    setFormData((current) => ({ ...current, [fieldName]: event.target.value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (formData.password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        studentCode: formData.studentCode.trim(),
        career: formData.career.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      onRegisterSuccess(authData.user);
    } catch (error) {
      setErrorMessage(getRegisterErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.studentCode.trim() !== "" &&
    formData.career.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password !== "" &&
    formData.confirmPassword !== "";

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-[minmax(330px,0.78fr)_minmax(600px,1.22fr)]">
      <section className="auth-identity-pattern hidden min-h-screen flex-col justify-between p-9 text-white lg:flex xl:p-12">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-extrabold text-[#315765]">ET</span>
          <span>
            <strong className="block text-base">EduTrack AI</strong>
            <small className="block text-[10px] font-medium text-white/60">Aprendizaje con propósito</small>
          </span>
        </div>

        <div className="max-w-lg">
          <span className="inline-flex rounded-full border border-white/15 bg-white/[0.07] px-3 py-2 text-[11px] text-white/80">
            Configura tu espacio en pocos minutos
          </span>
          <h1 className="mt-5 text-[clamp(2.1rem,3.7vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em]">
            Comienza con una experiencia adaptada a ti.
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-white/72">
            Tus datos académicos nos permiten organizar materias, prácticas, recursos y recomendaciones de forma más útil.
          </p>

          <div className="mt-8 space-y-3 rounded-2xl border border-white/15 bg-white/[0.075] p-4">
            {[
              ["1", "Crea tu cuenta", "Información personal y matrícula"],
              ["2", "Completa tu perfil", "Carrera y contexto académico"],
              ["3", "Recibe tu plan", "Prioridades y recursos sugeridos"],
            ].map(([number, title, detail]) => (
              <div key={number} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold text-[#315765]">{number}</span>
                <span>
                  <strong className="block text-xs">{title}</strong>
                  <small className="mt-0.5 block text-[9px] text-white/50">{detail}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] leading-5 text-white/50">
          Tu información se utiliza únicamente para operar y personalizar EduTrack AI.
        </p>
      </section>

      <section className="app-grid-background flex min-h-screen items-center justify-center px-4 py-8 sm:px-7 lg:px-10">
        <div className="w-full max-w-3xl">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-hover text-xs font-extrabold text-white">ET</span>
            <span>
              <strong className="block text-base text-content">EduTrack AI</strong>
              <small className="block text-[10px] text-muted">Crea tu espacio académico</small>
            </span>
          </div>

          <span className="prototype-eyebrow">Primer paso</span>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-content">Crear cuenta</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Completa tus datos personales y académicos.</p>
            </div>
            <span className="prototype-badge">Cuenta de estudiante</span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="prototype-panel mt-6 p-5 sm:p-7">
            <div className="space-y-5">
              {errorMessage && (
                <Alert variant="danger" title="No se pudo completar el registro">
                  {errorMessage}
                </Alert>
              )}

              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-success">Información personal</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Nombre"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Escribe tu nombre"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    required
                  />
                  <Input
                    label="Apellido"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Escribe tu apellido"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-success">Información académica</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Matrícula"
                    name="studentCode"
                    value={formData.studentCode}
                    onChange={handleChange}
                    placeholder="Ejemplo: 20240196"
                    disabled={isSubmitting}
                    required
                  />
                  <Input
                    label="Carrera"
                    name="career"
                    value={formData.career}
                    onChange={handleChange}
                    placeholder="Desarrollo de Software"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-success">Acceso</p>
                <div className="space-y-4">
                  <Input
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    required
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <PasswordInput
                      label="Contraseña"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      helperText="Debe tener al menos 8 caracteres."
                      minLength={8}
                      disabled={isSubmitting}
                      required
                    />
                    <PasswordInput
                      label="Confirmar contraseña"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Repite tu contraseña"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => window.location.assign("/login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Iniciar sesión
                </button>
              </p>
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={!isFormComplete}
                className="sm:min-w-48"
              >
                {isSubmitting ? "Creando cuenta" : "Crear cuenta"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Register;
