import Button from "../ui/Button";

interface DashboardHeaderProps {
  firstName: string;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

const DashboardHeader = ({ firstName, unreadNotifications, onOpenNotifications, onOpenProfile, onLogout }: DashboardHeaderProps) => (
  <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div><p className="text-sm font-semibold uppercase tracking-wider text-primary">Panel del estudiante</p><h1 className="mt-2 text-3xl font-bold text-content">Bienvenida, {firstName}</h1><p className="mt-2 text-muted">Consulta tu progreso académico y tus actividades recientes.</p></div>
    <div className="flex flex-col gap-3 sm:flex-row"><Button variant="outline" onClick={onOpenNotifications}>Notificaciones{unreadNotifications > 0 ? ` (${unreadNotifications})` : ""}</Button><Button variant="outline" onClick={onOpenProfile}>Perfil académico</Button><Button variant="ghost" onClick={onLogout}>Cerrar sesión</Button></div>
  </header>
);

export default DashboardHeader;
