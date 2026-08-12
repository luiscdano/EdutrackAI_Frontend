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
  if (error.message === "Email is already registered") {
    return "Este correo electrónico ya está registrado.";
  }
  if (error.message === "Student code is already registered") {
    return "Esta matrícula ya está registrada.";
  }
  if (error.message === "Default student role is not configured") {
    return "El rol de estudiante no está configurado.";
  }
  return error.message;
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

const Register = ({ onRegisterSuccess }: RegisterProps) => {
  const [formData, setFormData] =
    useState<RegisterFormData>(initialFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdUser, setCreatedUser] =
    useState<AuthenticatedUser | null>(null);
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
      setErrorMessage(
        "Selecciona al menos una dificultad o área que quieras mejorar.",
      );
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

  const disabled = isSubmitting || Boolean(createdUser);
  const journeySteps = [
    ["1", "Entender", "Revisa cómo vas"],
    ["2", "Organizar", "Prepara tu semana"],
    ["3", "Estudiar", "Sigue una actividad"],
    ["4", "Mejorar", "Ajusta el plan"],
  ];

  return (
    <main className="login-shell grid min-h-screen bg-white lg:grid-cols-[48%_52%]">
      <section className="login-left-panel auth-identity-pattern hidden min-h-screen flex-col justify-between px-11 py-11 text-white lg:flex xl:px-14 xl:py-12">
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

        <div className="max-w-[650px]">
          <span className="login-journey-badge inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-white/90">
            <JourneyIcon />
            Del progreso a una acción clara
          </span>

          <h1 className="login-hero-title mt-7 max-w-[660px] text-[clamp(2.6rem,4.5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.045em]">
            No solo mires tus notas.
            <br />
            Entiende qué hacer después.
          </h1>

          <p className="login-hero-copy mt-5 max-w-[610px] text-[17px] leading-8 text-white/88">
            EduTrack reúne tus materias, resultados y hábitos de estudio para
            ayudarte a avanzar con una guía clara, realista y ajustable.
          </p>

          <div className="login-journey mt-9 rounded-[18px] border border-white/20 bg-white/[0.055] p-5">
            <div className="login-journey-heading mb-4 flex items-center justify-between gap-3 text-[13px]">
              <strong>Así funciona tu recorrido</strong>
              <span className="text-[11px] text-white/65">
                Sin presión y a tu ritmo
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {journeySteps.map(([number, title, detail], index) => (
                <div
                  key={number}
                  className={`login-journey-card min-h-[126px] rounded-[13px] border border-white/15 p-3.5 ${
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
                  <strong className="mt-3 block text-[12px]">{title}</strong>
                  <small className="mt-1.5 block text-[10px] leading-4 text-white/65">
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

      <section className="register-right-panel min-h-screen overflow-y-auto bg-[#fffefa] px-5 py-7 sm:px-8 lg:h-[100dvh] lg:min-h-0 lg:px-10 xl:px-14">
        <div className="mx-auto w-full max-w-[720px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
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
              onClick={() => window.location.assign("/login")}
              className="min-h-[48px] rounded-[11px] px-4 text-sm font-bold text-muted transition hover:bg-surface/70 hover:text-content"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className="min-h-[48px] rounded-[11px] bg-surface px-4 text-sm font-bold text-content shadow-sm"
              aria-current="page"
            >
              Crear perfil
            </button>
          </div>

          <div className="register-heading-block mt-5">
            <span className="prototype-eyebrow">Primer paso</span>
            <h1 className="register-heading mt-2 text-[clamp(1.8rem,3vw,2.35rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-content">
              Crea un perfil que represente tu realidad académica.
            </h1>
            <p className="register-description mt-3 max-w-[650px] text-sm leading-6 text-muted">
              Completa tus datos personales y académicos para preparar tu
              primera guía desde el inicio.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="register-form mt-6 space-y-6 pb-8"
          >
            {errorMessage && (
              <Alert
                variant={createdUser ? "warning" : "danger"}
                title={
                  createdUser
                    ? "Cuenta creada parcialmente"
                    : "No se pudo completar el registro"
                }
              >
                {errorMessage}
              </Alert>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
                <div>
                  <span className="prototype-eyebrow">Información personal</span>
                  <h2 className="mt-1 text-base font-bold text-content">
                    Datos de tu cuenta
                  </h2>
                </div>
                <span className="prototype-badge">Estudiante</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Nombre"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Escribe tu nombre"
                  autoComplete="given-name"
                  disabled={disabled}
                  required
                />
                <Input
                  label="Apellido"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Escribe tu apellido"
                  autoComplete="family-name"
                  disabled={disabled}
                  required
                />
                <Input
                  label="Matrícula"
                  name="studentCode"
                  value={formData.studentCode}
                  onChange={handleChange}
                  placeholder="Ejemplo: 20240196"
                  disabled={disabled}
                  required
                />
                <Input
                  label="Carrera"
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  placeholder="Desarrollo de Software"
                  disabled={disabled}
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
                  disabled={disabled}
                  required
                  containerClassName="sm:col-span-2"
                />
                <PasswordInput
                  label="Contraseña"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  helperText="Debe tener al menos 8 caracteres."
                  minLength={8}
                  disabled={disabled}
                  required
                />
                <PasswordInput
                  label="Confirmar contraseña"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  disabled={disabled}
                  required
                />
              </div>
            </section>

            <section>
              <div className="mb-3 border-b border-border pb-2">
                <span className="prototype-eyebrow">Perfil académico</span>
                <h2 className="mt-1 text-base font-bold text-content">
                  Cómo estudias actualmente
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Nivel académico"
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={disabled}
                  required
                />
              </div>
            </section>

            <section>
              <div className="mb-3 border-b border-border pb-2">
                <span className="prototype-eyebrow">Áreas a mejorar</span>
                <h2 className="mt-1 text-base font-bold text-content">
                  ¿Qué te resulta más difícil?
                </h2>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {difficultyOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`rounded-xl border px-3 py-2.5 transition ${
                      formData.difficulties.includes(option.value)
                        ? "border-primary bg-primary/5"
                        : "border-border bg-white"
                    }`}
                  >
                    <Checkbox
                      label={option.label}
                      checked={formData.difficulties.includes(option.value)}
                      onChange={() => toggleDifficulty(option.value)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-[30px_1fr] gap-3 rounded-[14px] bg-success/15 px-4 py-3">
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

            {createdUser ? (
              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={() => onRegisterSuccess(createdUser)}
                className="min-h-[50px]"
              >
                Continuar a mi cuenta
              </Button>
            ) : (
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                disabled={!isFormComplete || isSubmitting}
                className="min-h-[50px]"
              >
                {isSubmitting
                  ? "Creando cuenta"
                  : "Crear cuenta y guardar perfil"}
              </Button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
};

export default Register;
