import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Select from "../../components/ui/Select";
import { createAcademicProfile } from "../../services/academic-profile.service";
import { registerUser } from "../../services/auth.service";
import type {
  AcademicSettings,
  AcademicSettingsFormData,
  DifficultyOption,
} from "../../types/academic.types";
import type {
  AuthenticatedUser,
  RegisterData,
} from "../../types/auth.types";

interface RegisterProps {
  onRegisterSuccess: (user: AuthenticatedUser) => void;
}

interface RegisterFormData
  extends RegisterData,
    AcademicSettingsFormData {
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
  academicLevel: "",
  learningStyle: "",
  preferredSchedule: "",
  weeklyGoal: 5,
  difficulties: [],
};

const difficultyOptions: Array<{
  value: DifficultyOption;
  label: string;
}> = [
  { value: "time_management", label: "Organización del tiempo" },
  { value: "mathematics", label: "Matemáticas" },
  { value: "reading_comprehension", label: "Comprensión lectora" },
  { value: "programming", label: "Programación" },
  { value: "concentration", label: "Concentración" },
  { value: "teamwork", label: "Trabajo en equipo" },
  { value: "communication", label: "Comunicación" },
  { value: "exam_anxiety", label: "Ansiedad en evaluaciones" },
];

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
  const [createdUser, setCreatedUser] = useState<AuthenticatedUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const fieldName = event.target.name as keyof RegisterFormData;
    setFormData((current) => ({
      ...current,
      [fieldName]: event.target.value,
    }));
    if (errorMessage) setErrorMessage(null);
  };

  const toggleDifficulty = (difficulty: DifficultyOption) => {
    setFormData((current) => ({
      ...current,
      difficulties: current.difficulties.includes(difficulty)
        ? current.difficulties.filter((item) => item !== difficulty)
        : [...current.difficulties, difficulty],
    }));
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

    if (
      !formData.academicLevel ||
      !formData.learningStyle ||
      !formData.preferredSchedule ||
      formData.weeklyGoal === ""
    ) {
      setErrorMessage("Completa toda la información académica.");
      return;
    }

    if (formData.difficulties.length === 0) {
      setErrorMessage("Selecciona al menos una dificultad o área que quieras mejorar.");
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

      const academicSettings: AcademicSettings = {
        academicLevel: formData.academicLevel,
        learningStyle: formData.learningStyle,
        preferredSchedule: formData.preferredSchedule,
        weeklyGoal: Number(formData.weeklyGoal),
        difficulties: formData.difficulties,
      };

      try {
        await createAcademicProfile(authData.user.id, academicSettings);
      } catch {
        setCreatedUser(authData.user);
        setErrorMessage(
          "Tu cuenta fue creada, pero no pudimos guardar el perfil académico. Puedes continuar y completarlo luego desde Perfil académico.",
        );
        return;
      }

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
    formData.confirmPassword !== "" &&
    formData.academicLevel !== "" &&
    formData.learningStyle !== "" &&
    formData.preferredSchedule !== "" &&
    formData.weeklyGoal !== "" &&
    formData.difficulties.length > 0;

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-sm font-extrabold text-white">
                ET
              </span>
              <span>
                <strong className="block text-base text-content">EduTrack AI</strong>
                <small className="block text-[10px] text-muted">Aprendizaje con propósito</small>
              </span>
            </div>
            <span className="prototype-eyebrow mt-7 inline-block">Registro completo</span>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.035em] text-content sm:text-4xl">
              Crea tu cuenta y configura tu perfil académico de una vez.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              Esta información permite organizar tus materias, prácticas, horarios y recomendaciones desde el primer ingreso.
            </p>
          </div>
          <span className="prototype-badge">Cuenta de estudiante</span>
        </header>

        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          {errorMessage && (
            <Alert
              variant={createdUser ? "warning" : "danger"}
              title={createdUser ? "Cuenta creada parcialmente" : "No se pudo completar el registro"}
            >
              {errorMessage}
            </Alert>
          )}

          <section className="prototype-panel p-5 sm:p-7">
            <div className="mb-5">
              <span className="prototype-eyebrow">1. Información personal</span>
              <h2 className="mt-1 text-xl font-bold text-content">Datos de tu cuenta</h2>
              <p className="mt-1 text-sm text-muted">Información utilizada para identificarte e iniciar sesión.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Escribe tu nombre"
                autoComplete="given-name"
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
              <Input
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Escribe tu apellido"
                autoComplete="family-name"
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
              <Input
                label="Matrícula"
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
                placeholder="Ejemplo: 20240196"
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
              <Input
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                disabled={isSubmitting || Boolean(createdUser)}
                required
                containerClassName="md:col-span-2"
              />
              <Input
                label="Carrera"
                name="career"
                value={formData.career}
                onChange={handleChange}
                placeholder="Desarrollo de Software"
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
              <PasswordInput
                label="Contraseña"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                helperText="Debe tener al menos 8 caracteres."
                minLength={8}
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
              <PasswordInput
                label="Confirmar contraseña"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
            </div>
          </section>

          <section className="prototype-panel p-5 sm:p-7">
            <div className="mb-5">
              <span className="prototype-eyebrow">2. Perfil académico</span>
              <h2 className="mt-1 text-xl font-bold text-content">Cómo estudias actualmente</h2>
              <p className="mt-1 text-sm text-muted">Estos datos se guardarán directamente en tu perfil académico.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Nivel académico"
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleChange}
                disabled={isSubmitting || Boolean(createdUser)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="secondary">Secundaria</option>
                <option value="technical">Técnico superior</option>
                <option value="undergraduate">Grado universitario</option>
                <option value="postgraduate">Postgrado</option>
              </Select>

              <Select
                label="Estilo de aprendizaje"
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleChange}
                disabled={isSubmitting || Boolean(createdUser)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditivo</option>
                <option value="reading">Lectura y escritura</option>
                <option value="kinesthetic">Práctico o kinestésico</option>
              </Select>

              <Select
                label="Horario preferido"
                name="preferredSchedule"
                value={formData.preferredSchedule}
                onChange={handleChange}
                disabled={isSubmitting || Boolean(createdUser)}
                required
              >
                <option value="">Selecciona una opción</option>
                <option value="morning">Mañana</option>
                <option value="afternoon">Tarde</option>
                <option value="night">Noche</option>
                <option value="weekend">Fin de semana</option>
                <option value="flexible">Horario flexible</option>
              </Select>

              <Input
                label="Meta semanal de estudio"
                name="weeklyGoal"
                type="number"
                min={1}
                max={40}
                value={formData.weeklyGoal}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormData((current) => ({
                    ...current,
                    weeklyGoal: value === "" ? "" : Number(value),
                  }));
                }}
                helperText="Cantidad de horas por semana."
                disabled={isSubmitting || Boolean(createdUser)}
                required
              />
            </div>
          </section>

          <section className="prototype-panel p-5 sm:p-7">
            <div className="mb-5">
              <span className="prototype-eyebrow">3. Áreas a mejorar</span>
              <h2 className="mt-1 text-xl font-bold text-content">¿Qué te resulta más difícil?</h2>
              <p className="mt-1 text-sm text-muted">Selecciona una o varias opciones para orientar tus recomendaciones.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {difficultyOptions.map((option) => (
                <div
                  key={option.value}
                  className={`rounded-xl border p-3 transition ${
                    formData.difficulties.includes(option.value)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white"
                  }`}
                >
                  <Checkbox
                    label={option.label}
                    checked={formData.difficulties.includes(option.value)}
                    onChange={() => toggleDifficulty(option.value)}
                    disabled={isSubmitting || Boolean(createdUser)}
                  />
                </div>
              ))}
            </div>
          </section>

          <footer className="flex flex-col gap-4 border-t border-border py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => window.location.assign("/login")}
                className="font-semibold text-primary hover:underline"
              >
                Iniciar sesión
              </button>
            </p>

            {createdUser ? (
              <Button
                type="button"
                size="lg"
                onClick={() => onRegisterSuccess(createdUser)}
                className="sm:min-w-64"
              >
                Continuar a mi cuenta
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                disabled={!isFormComplete}
                className="sm:min-w-64"
              >
                {isSubmitting ? "Creando cuenta" : "Crear cuenta y guardar perfil"}
              </Button>
            )}
          </footer>
        </form>
      </div>
    </main>
  );
};

export default Register;
