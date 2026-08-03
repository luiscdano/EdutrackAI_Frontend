import { useEffect, useState } from "react";

import AvatarCard from "../../components/profile/AvatarCard";
import EditableFields from "../../components/profile/EditableFields";
import ProfileInfo from "../../components/profile/ProfileInfo";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import {
  changeAccountPassword,
  getCurrentAccount,
  type ChangePasswordData,
} from "../../services/account.service";
import type { AuthenticatedUser } from "../../types/auth.types";

interface Props {
  initialUser: AuthenticatedUser;
  onBack: () => void;
}

const Profile = ({ initialUser, onBack }: Props) => {
  const [user, setUser] = useState<AuthenticatedUser>(initialUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const currentUser = await getCurrentAccount();
        if (active) setUser(currentUser);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "No fue posible actualizar los datos de la cuenta.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, []);

  const handleChangePassword = (data: ChangePasswordData) => changeAccountPassword(data);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader size="lg" showLabel label="Cargando cuenta..." /></div>;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Cuenta personal</p>
          <h2 className="mt-2 text-2xl font-bold text-content sm:text-3xl">Perfil y seguridad</h2>
          <p className="mt-2 text-muted">Consulta tus datos y cambia la contraseña mediante el endpoint seguro de tu propia cuenta.</p>
        </div>
        <Button variant="outline" onClick={onBack}>Volver</Button>
      </header>

      {error && <Card padding="md" className="border-danger"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-danger">{error} Se muestran los datos guardados en la sesión.</p><Button size="sm" variant="outline" onClick={() => window.location.reload()}>Reintentar</Button></div></Card>}

      <div className="grid gap-6 lg:grid-cols-3">
        <AvatarCard user={user} />
        <div className="space-y-6 lg:col-span-2">
          <ProfileInfo user={user} />
          <EditableFields user={user} onChangePassword={handleChangePassword} />
        </div>
      </div>
    </section>
  );
};

export default Profile;
