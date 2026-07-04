import Card from "../ui/Card";

const NotificationsCard = () => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className="h-full"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">
        Notificaciones
      </h2>

      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-slate-400">
          Las notificaciones aparecerán aquí cuando estén disponibles.
        </p>
      </div>
    </Card>
  );
};

export default NotificationsCard;