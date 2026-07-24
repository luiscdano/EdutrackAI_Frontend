import Button from "../ui/Button";

interface Props {
  onBack: () => void;
}

const ProfileHeader = ({ onBack }: Props) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        Cuenta y preferencias
      </p>
      <h1 className="mt-2 text-3xl font-bold text-content">
        Mi perfil
      </h1>
      <p className="mt-2 text-muted">
        Consulta tu información y administra la seguridad de tu cuenta.
      </p>
    </div>

    <Button variant="outline" onClick={onBack}>
      Volver al dashboard
    </Button>
  </header>
);

export default ProfileHeader;
