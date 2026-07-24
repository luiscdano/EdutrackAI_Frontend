import Button from "../ui/Button";
import Card from "../ui/Card";

interface Props {
  onOpenAccount: () => void;
  onOpenSubjects: () => void;
  onOpenProgress: () => void;
  onOpenResources: () => void;
  onOpenRecommendations: () => void;
  onOpenNotifications: () => void;
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onOpenAdminDashboard?: () => void;
  onOpenAdminAcademic?: () => void;
  onRefresh: () => void;
}

const QuickActions = (props: Props) => (
  <Card padding="md"><h2 className="text-xl font-bold text-content">Accesos rápidos</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <Button fullWidth onClick={props.onOpenSubjects}>Materias</Button>
    <Button fullWidth onClick={props.onOpenProgress}>Progreso</Button>
    <Button fullWidth onClick={props.onOpenStudySessions}>Registrar actividad</Button>
    <Button fullWidth onClick={props.onOpenResources}>Recursos</Button>
    <Button fullWidth variant="secondary" onClick={props.onOpenRecommendations}>Sugerencias</Button>
    <Button fullWidth variant="secondary" onClick={props.onOpenNotifications}>Notificaciones</Button>
    <Button fullWidth variant="secondary" onClick={props.onOpenAcademicProfile}>Perfil académico</Button>
    <Button fullWidth variant="secondary" onClick={props.onOpenAccount}>Mi cuenta</Button>
    {props.onOpenAdminDashboard && <Button fullWidth variant="secondary" onClick={props.onOpenAdminDashboard}>Dashboard admin</Button>}
    {props.onOpenAdminAcademic && <Button fullWidth variant="secondary" onClick={props.onOpenAdminAcademic}>Gestión académica</Button>}
    <Button fullWidth variant="outline" onClick={props.onRefresh}>Actualizar progreso</Button>
  </div></Card>
);

export default QuickActions;
