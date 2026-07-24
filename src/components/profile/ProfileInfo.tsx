import Card from "../ui/Card";

import type { AuthenticatedUser } from "../../types/auth.types";

interface Props {
  user: AuthenticatedUser;
}

const formatDate = (value: string | null) => {
  if (!value) return "No disponible";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "No disponible"
    : new Intl.DateTimeFormat("es-DO", {
        dateStyle: "medium",
      }).format(date);
};

const ProfileInfo = ({ user }: Props) => {
  const fields = [
    {
      label: "Nombre completo",
      value: `${user.firstName} ${user.lastName}`.trim(),
    },
    { label: "Matrícula", value: user.studentCode },
    { label: "Carrera", value: user.career },
    { label: "Correo", value: user.email },
    { label: "Rol", value: user.role.name },
    {
      label: "Correo verificado",
      value: user.emailVerified ? "Sí" : "No",
    },
    {
      label: "Último acceso",
      value: formatDate(user.lastLogin),
    },
    {
      label: "Cuenta creada",
      value: formatDate(user.createdAt),
    },
  ];

  return (
    <Card padding="lg">
      <h2 className="text-xl font-bold text-content">
        Información de la cuenta
      </h2>

      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-control border border-border bg-surface-muted p-4"
          >
            <dt className="text-sm font-medium text-muted">
              {field.label}
            </dt>
            <dd className="mt-2 break-words font-semibold text-content">
              {field.value || "No disponible"}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};

export default ProfileInfo;
