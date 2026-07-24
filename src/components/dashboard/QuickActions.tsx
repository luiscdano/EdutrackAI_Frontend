import Button from "../ui/Button";
import Card from "../ui/Card";

interface Props {
  onOpenAccount: () => void;
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onOpenAdminAcademic?: () => void;
  onRefresh: () => void;
}

const QuickActions = ({
  onOpenAccount,
  onOpenAcademicProfile,
  onOpenStudySessions,
  onOpenAdminAcademic,
  onRefresh,
}: Props) => (
  <Card padding="md">
    <h2 className="text-xl font-bold text-content">
      Accesos rápidos
    </h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Button fullWidth onClick={onOpenStudySessions}>
        Registrar actividad
      </Button>
      <Button
        fullWidth
        variant="secondary"
        onClick={onOpenAcademicProfile}
      >
        Perfil académico
      </Button>
      <Button
        fullWidth
        variant="secondary"
        onClick={onOpenAccount}
      >
        Mi cuenta
      </Button>
      {onOpenAdminAcademic && (
        <Button
          fullWidth
          variant="secondary"
          onClick={onOpenAdminAcademic}
        >
          Gestión académica
        </Button>
      )}
      <Button fullWidth variant="outline" onClick={onRefresh}>
        Actualizar progreso
      </Button>
    </div>
  </Card>
);

export default QuickActions;
