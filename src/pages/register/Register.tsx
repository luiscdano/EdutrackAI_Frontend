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
import { registerUser } from "../../services/auth.service";
import type {
  AuthenticatedUser,
  RegisterData,
} from "../../types/auth.types";

interface RegisterProps {
  onRegisterSuccess: (
    user: AuthenticatedUser,
  ) => void;
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

const getRegisterErrorMessage = (
  error: unknown,
): string => {
  if (!(error instanceof Error)) {
    return "No se pudo completar el registro.";
  }

  if (error.message === "Email is already registered") {
    return "Este correo electrónico ya está registrado.";
  }

  if (
    error.message ===
    "Student code is already registered"
  ) {
    return "Esta matrícula ya está registrada.";
  }

  if (
    error.message ===
    "Default student role is not configured"
  ) {
    return "El rol de estudiante no está configurado.";
  }

  return error.message;
};

const Register = ({
  onRegisterSuccess,
}: RegisterProps) => {
  const [formData, setFormData] =
    useState<RegisterFormData>(
      initialFormData,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const fieldName =
      event.target.name as keyof RegisterFormData;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [fieldName]: event.target.value,
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

    if (formData.password.length < 8) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setErrorMessage(
        "Las contraseñas no coinciden.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        studentCode:
          formData.studentCode.trim(),
        career: formData.career.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      onRegisterSuccess(authData.user);
    } catch (error) {
      setErrorMessage(
        getRegisterErrorMessage(error),
      );
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
    <main className="flex min-h-screen w-full overflow-x-hidden bg-app-bg">
      {/* Panel izquierdo */}
      <section className="hidden min-h-screen w-2/5 min-w-0 items-center justify-center bg-slate-950 lg:flex">
        <div className="w-full max-w-xl px-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-content">
            EduTrack{" "}
            <span className="text-primary">
              AI
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted">
            Crea tu cuenta y comienza a mejorar tu
            rendimiento académico con recomendaciones
            personalizadas.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="flex min-h-screen w-full min-w-0 items-center justify-center px-4 py-8 sm:px-6 lg:w-3/5 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-3xl font-bold tracking-tight text-content sm:text-4xl">
              EduTrack{" "}
              <span className="text-primary">
                AI
              </span>
            </h1>

            <p className="mt-3 text-sm text-muted">
              Crea tu cuenta de estudiante
            </p>
          </div>

          <Card padding="md">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-content">
                Crear cuenta
              </h2>

              <p className="mt-2 text-sm text-muted">
                Completa tus datos personales y
                académicos.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="space-y-5">
                {errorMessage && (
                  <Alert
                    variant="danger"
                    title="No se pudo completar el registro"
                  >
                    {errorMessage}
                  </Alert>
                )}

                <div className="grid gap-5 md:grid-cols-2">
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

                <div className="grid gap-5 md:grid-cols-2">
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
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={!isFormComplete}
                className="mt-6"
              >
                {isSubmitting
                  ? "Creando cuenta"
                  : "Crear cuenta"}
              </Button>

              <div className="mt-6 text-center text-sm text-muted">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() =>
                    window.location.assign("/")
                  }
                  className="font-semibold text-primary transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Register;    