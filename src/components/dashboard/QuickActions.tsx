import Button from "../ui/Button";
import Card from "../ui/Card";

interface Props {
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onRefresh: () => void;
}

const QuickActions = ({ onOpenAcademicProfile, onOpenStudySessions, onRefresh }: Props) => (
  <Card padding="md">
    <h2 className="text-xl font-bold text-content">Accesos rápidos</h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Button fullWidth onClick={onOpenStudySessions}>Registrar actividad</Button>
      <Button fullWidth variant="secondary" onClick={onOpenAcademicProfile}>
        Perfil académico
      </Button>
      <Button fullWidth variant="outline" onClick={onRefresh}>Actualizar progreso</Button>
    </div>
  </Card>
);

export default QuickActions;
