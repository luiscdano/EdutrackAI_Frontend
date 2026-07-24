import {
  useState,
  type FormEvent,
} from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";

import type { ChangePasswordData } from "../../services/account.service";
import type { AuthenticatedUser } from "../../types/auth.types";

interface Props {
  user: AuthenticatedUser;
  onChangePassword: (data: ChangePasswordData) => Promise<void>;
}

const initialPasswordData: ChangePasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const EditableFields = ({
  user,
  onChangePassword,
}: Props) => {
  const [passwordData, setPasswordData] =
    useState<ChangePasswordData>(initialPasswordData);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const updateField = (
    field: keyof ChangePasswordData,
    value: string,
  ) => {
    setPasswordData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!passwordData.currentPassword) {
      setFeedback({
        type: "error",
        message: "Introduce tu contraseña actual.",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setFeedback({
        type: "error",
        message: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmNewPassword
    ) {
      setFeedback({
        type: "error",
        message: "La confirmación no coincide con la nueva contraseña.",
      });
      return;
    }

    setSaving(true);

    try {
      await onChangePassword(passwordData);
      setPasswordData(initialPasswordData);
      setFeedback({
        type: "success",
        message: "Contraseña actualizada correctamente.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No fue posible actualizar la contraseña.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card padding="lg">
      <h2 className="text-xl font-bold text-content">
        Configuración de la cuenta
      </h2>
      <p className="mt-2 text-sm text-muted">
        Los datos personales se muestran desde la API. La edición general
        permanecerá bloqueada hasta disponer de un endpoint seguro para
        actualizar el perfil propio.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-content">
          Nombre
          <input
            value={`${user.firstName} ${user.lastName}`.trim()}
            disabled
            className="mt-2 w-full rounded-control border border-border bg-surface-muted px-4 py-3 text-muted disabled:cursor-not-allowed"
          />
        </label>
        <label className="text-sm font-medium text-content">
          Correo
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-2 w-full rounded-control border border-border bg-surface-muted px-4 py-3 text-muted disabled:cursor-not-allowed"
          />
        </label>
      </div>

      <form className="mt-8 space-y-4" onSubmit={submit}>
        <div>
          <h3 className="font-bold text-content">
            Cambiar contraseña
          </h3>
          <p className="mt-1 text-sm text-muted">
            Usa al menos 8 caracteres para la nueva contraseña.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-content">
            Contraseña actual
            <input
              type="password"
              autoComplete="current-password"
              value={passwordData.currentPassword}
              onChange={(event) =>
                updateField("currentPassword", event.target.value)
              }
              className="mt-2 w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="text-sm font-medium text-content">
            Nueva contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={passwordData.newPassword}
              onChange={(event) =>
                updateField("newPassword", event.target.value)
              }
              className="mt-2 w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="text-sm font-medium text-content">
            Confirmar contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={passwordData.confirmNewPassword}
              onChange={(event) =>
                updateField("confirmNewPassword", event.target.value)
              }
              className="mt-2 w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>

        {feedback && (
          <p
            role="status"
            className={
              feedback.type === "success"
                ? "text-sm font-medium text-success"
                : "text-sm font-medium text-danger"
            }
          >
            {feedback.message}
          </p>
        )}

        <Button type="submit" loading={saving}>
          Actualizar contraseña
        </Button>
      </form>
    </Card>
  );
};

export default EditableFields;
