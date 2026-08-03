import PerformanceSection from "../../components/dashboard/PerformanceSection";
import StreakSection from "../../components/dashboard/StreakSection";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useDashboardData } from "../../hooks/useDashboardData";

interface Props {
  firstName: string;
  onOpenAccount: () => void;
  onOpenSubjects: () => void;
  onOpenProgress: () => void;
  onOpenResources: () => void;
  onOpenRecommendations: () => void;
  onOpenNotifications: () => void;
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onOpenPractices: () => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const Dashboard = (props: Props) => {
  const { data, loading, error, load } = useDashboardData();

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader size="lg" showLabel label="Cargando dashboard..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Card className="max-w-lg text-center">
          <h2 className="text-2xl font-bold text-content">No fue posible cargar el dashboard</h2>
          <p className="mt-3 text-muted">{error}</p>
          <Button className="mt-5" onClick={() => void load()}>Reintentar</Button>
        </Card>
      </div>
    );
  }

  const prioritySubject = [...data.performance]
    .filter((item) => item.grades.count > 0)
    .sort((a, b) => a.grades.average - b.grades.average)[0] ?? data.performance[0];

  const dateLabel = new Intl.DateTimeFormat("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const metricItems = [
    {
      label: "Materias activas",
      value: data.summary.enrolledSubjects,
      detail: "En tu período actual",
    },
    {
      label: "Tiempo esta semana",
      value: `${data.summary.totalStudyMinutesLast7Days} min`,
      detail: `${data.summary.studySessionsLast7Days} sesiones registradas`,
    },
    {
      label: "Promedio de quizzes",
      value: `${data.summary.averageQuizScore.toFixed(1)}%`,
      detail: `${data.summary.quizAttemptsLast7Days} intentos recientes`,
    },
    {
      label: "Racha actual",
      value: `${data.streak.currentStreak} días`,
      detail: `Mejor racha: ${data.streak.longestStreak} días`,
    },
  ];

  return (
    <div className="grid gap-4">
      <header>
        <span className="prototype-eyebrow capitalize">{dateLabel}</span>
        <h2 className="mt-1.5 max-w-4xl text-[clamp(1.55rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.03em] text-content">
          {getGreeting()}, {props.firstName}. Hoy puedes avanzar con calma.
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Revisa tu prioridad, continúa una actividad concreta y utiliza tus resultados para decidir el siguiente paso.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <section className="prototype-panel prototype-priority p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">Tu próximo paso</span>
              <h3 className="mt-1 text-lg font-bold text-content">Una actividad concreta para comenzar</h3>
            </div>
            <span className="prototype-badge prototype-badge-attention">Prioridad sugerida</span>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <span className="prototype-badge">
              {prioritySubject?.subject.level ?? "Plan académico"}
            </span>
            <h4 className="mt-3 max-w-3xl text-2xl font-bold leading-tight tracking-[-0.025em] text-content">
              {prioritySubject
                ? `Refuerza ${prioritySubject.subject.name} con una práctica corta.`
                : "Realiza una práctica para mantener activo tu progreso."}
            </h4>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {prioritySubject
                ? `Tu promedio registrado es ${prioritySubject.grades.average.toFixed(1)}. Una sesión enfocada te ayudará a detectar qué tema necesita más atención.`
                : "Aún no hay suficiente información para seleccionar una materia prioritaria. Comienza una práctica y construiremos una recomendación más precisa."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-lg bg-surface-muted px-2.5 py-2 text-[11px] font-medium text-muted">
                15–25 minutos
              </span>
              <span className="rounded-lg bg-surface-muted px-2.5 py-2 text-[11px] font-medium text-muted">
                Enfoque guiado
              </span>
              {prioritySubject && (
                <span className="rounded-lg bg-surface-muted px-2.5 py-2 text-[11px] font-medium text-muted">
                  {prioritySubject.grades.count} calificaciones
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={props.onOpenPractices}>Comenzar práctica</Button>
              <Button variant="secondary" onClick={props.onOpenRecommendations}>Ver recomendaciones</Button>
            </div>
          </div>
        </section>

        <aside className="prototype-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">Hoy</span>
              <h3 className="mt-1 text-lg font-bold text-content">Tu agenda académica</h3>
            </div>
            <span className="text-2xl font-bold text-primary">{data.summary.unreadNotifications}</span>
          </div>

          <div className="mt-4 grid gap-2.5">
            <button
              type="button"
              onClick={props.onOpenNotifications}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface-muted p-3 text-left transition hover:bg-primary/10"
            >
              <span>
                <strong className="block text-xs text-content">Notificaciones pendientes</strong>
                <small className="mt-1 block text-[10px] text-muted">Revisa cambios y recordatorios</small>
              </span>
              <span className="prototype-badge">{data.summary.unreadNotifications}</span>
            </button>

            <button
              type="button"
              onClick={props.onOpenStudySessions}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface-muted p-3 text-left transition hover:bg-primary/10"
            >
              <span>
                <strong className="block text-xs text-content">Sesión de estudio</strong>
                <small className="mt-1 block text-[10px] text-muted">Registra tiempo y productividad</small>
              </span>
              <span className="text-lg font-bold text-success">{data.summary.averageProductivity.toFixed(1)}</span>
            </button>

            <button
              type="button"
              onClick={props.onOpenProgress}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface-muted p-3 text-left transition hover:bg-primary/10"
            >
              <span>
                <strong className="block text-xs text-content">Actividad reciente</strong>
                <small className="mt-1 block text-[10px] text-muted">{data.streak.activeDaysLast30} días activos este mes</small>
              </span>
              <span className="text-lg font-bold text-primary">↗</span>
            </button>
          </div>
        </aside>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((item) => (
          <article key={item.label} className="prototype-panel p-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{item.label}</span>
            <strong className="mt-2 block text-2xl font-bold tracking-[-0.02em] text-content">{item.value}</strong>
            <small className="mt-1 block text-[10px] text-muted">{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <PerformanceSection items={data.performance} />
        <StreakSection streak={data.streak} />
      </section>
    </div>
  );
};

export default Dashboard;
