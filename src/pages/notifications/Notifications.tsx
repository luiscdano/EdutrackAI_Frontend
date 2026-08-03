import { useCallback, useEffect, useMemo, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../../services/content.service";
import type { UserNotification } from "../../types/content.types";

interface Props { onBack: () => void; userId: string }
const formatDate = (value: string) => new Date(value).toLocaleString("es-DO");

const Notifications = ({ onBack, userId }: Props) => {
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems((await getNotifications()).filter((item) => item.user.id === userId)); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las notificaciones."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const filtered = useMemo(() => items.filter((item) => filter === "all" || (filter === "read" ? item.isRead : !item.isRead)), [filter, items]);
  const unread = items.filter((item) => !item.isRead).length;

  const readOne = async (id: string) => {
    try { const updated = await markNotificationRead(id); setItems((current) => current.map((item) => item.id === id ? updated : item)); }
    catch (operationError) { window.alert(operationError instanceof Error ? operationError.message : "No fue posible actualizar la notificación."); }
  };
  const readAll = async () => {
    setUpdating(true);
    try { await markAllNotificationsRead(); setItems((current) => current.map((item) => ({ ...item, isRead: true }))); }
    catch (operationError) { window.alert(operationError instanceof Error ? operationError.message : "No fue posible actualizar las notificaciones."); }
    finally { setUpdating(false); }
  };

  return <ContentShell title="Centro de notificaciones" description="Revisa tus avisos y mantén actualizado su estado de lectura." onBack={onBack} loading={loading} error={error} onRetry={() => void load()} actions={<Button loading={updating} disabled={unread === 0} onClick={() => void readAll()}>Marcar todas como leídas ({unread})</Button>}>
    <Card padding="md"><div className="flex flex-wrap gap-2">{(["all", "unread", "read"] as const).map((value) => <Button key={value} size="sm" variant={filter === value ? "primary" : "outline"} onClick={() => setFilter(value)}>{value === "all" ? "Todas" : value === "unread" ? "No leídas" : "Leídas"}</Button>)}</div></Card>
    {filtered.length === 0 ? <Card padding="lg" className="text-center"><h2 className="text-xl font-bold text-content">No hay notificaciones</h2><p className="mt-2 text-muted">No existen avisos para el filtro seleccionado.</p></Card> : <div className="space-y-4">{filtered.map((item) => <Card key={item.id} padding="md" className={item.isRead ? "opacity-75" : "border-primary"}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-primary">{item.type}</span>{!item.isRead && <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Nueva</span>}</div><h2 className="mt-2 text-lg font-bold text-content">{item.title}</h2><p className="mt-2 text-muted">{item.message}</p><p className="mt-3 text-xs text-muted">{formatDate(item.createdAt)}</p></div>{!item.isRead && <Button size="sm" variant="outline" onClick={() => void readOne(item.id)}>Marcar como leída</Button>}</div></Card>)}</div>}
  </ContentShell>;
};

export default Notifications;
