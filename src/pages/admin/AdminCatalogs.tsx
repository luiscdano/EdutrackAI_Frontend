import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import {
  createCatalogNotification,
  createCatalogRecommendation,
  createCatalogResource,
  deleteCatalogNotification,
  deleteCatalogRecommendation,
  deleteCatalogResource,
  getAdminUsers,
  updateCatalogNotification,
  updateCatalogRecommendation,
  updateCatalogResource,
} from "../../services/admin.service";
import {
  getNotifications,
  getRecommendations,
  getResources,
  getSubjects,
} from "../../services/content.service";
import type {
  AdminUser,
  NotificationPayload,
  RecommendationPayload,
  ResourcePayload,
} from "../../types/admin.types";
import type {
  ContentSubject,
  EducationalResource,
  StudyRecommendation,
  UserNotification,
} from "../../types/content.types";

type Tab = "resources" | "recommendations" | "notifications";
type EditingItem = EducationalResource | StudyRecommendation | UserNotification | null;

const emptyResource: ResourcePayload = {
  subjectId: "",
  title: "",
  description: "",
  resourceType: "Enlace",
  url: "",
  difficulty: "Intermedio",
  topic: "",
  isActive: true,
};

const emptyRecommendation: RecommendationPayload = {
  userId: "",
  subjectId: "",
  resourceId: "",
  type: "Estudio",
  title: "",
  description: "",
  reason: "",
  priority: "Media",
  status: "Pendiente",
};

const emptyNotification: NotificationPayload = {
  userId: "",
  title: "",
  message: "",
  type: "Información",
  scheduleAt: "",
  isRead: false,
};

const formatDate = (value: string) => new Date(value).toLocaleString("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const AdminCatalogs = () => {
  const [tab, setTab] = useState<Tab>("resources");
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [subjects, setSubjects] = useState<ContentSubject[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditingItem>(null);
  const [resourceForm, setResourceForm] = useState<ResourcePayload>(emptyResource);
  const [recommendationForm, setRecommendationForm] = useState<RecommendationPayload>(emptyRecommendation);
  const [notificationForm, setNotificationForm] = useState<NotificationPayload>(emptyNotification);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [resourceData, recommendationData, notificationData, subjectData, userData] = await Promise.all([
        getResources(),
        getRecommendations(),
        getNotifications(),
        getSubjects(),
        getAdminUsers({ page: 1, limit: 100 }),
      ]);
      setResources(resourceData);
      setRecommendations(recommendationData);
      setNotifications(notificationData);
      setSubjects(subjectData.filter((subject) => subject.isActive));
      setUsers(userData.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los catálogos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const filteredResources = useMemo(() => resources.filter((item) => `${item.title} ${item.topic} ${item.subject.name} ${item.resourceType}`.toLowerCase().includes(search.trim().toLowerCase())), [resources, search]);
  const filteredRecommendations = useMemo(() => recommendations.filter((item) => `${item.title} ${item.user.firstName} ${item.user.lastName} ${item.subject.name} ${item.status}`.toLowerCase().includes(search.trim().toLowerCase())), [recommendations, search]);
  const filteredNotifications = useMemo(() => notifications.filter((item) => `${item.title} ${item.message} ${item.user.firstName} ${item.user.lastName} ${item.type}`.toLowerCase().includes(search.trim().toLowerCase())), [notifications, search]);

  const openCreate = () => {
    setEditing(null);
    setResourceForm({ ...emptyResource, subjectId: subjects[0]?.id ?? "" });
    setRecommendationForm({
      ...emptyRecommendation,
      userId: users[0]?.id ?? "",
      subjectId: subjects[0]?.id ?? "",
      resourceId: resources[0]?.id ?? "",
    });
    setNotificationForm({ ...emptyNotification, userId: users[0]?.id ?? "" });
    setModalOpen(true);
  };

  const openResource = (item: EducationalResource) => {
    setEditing(item);
    setResourceForm({
      subjectId: item.subject.id,
      title: item.title,
      description: item.description,
      resourceType: item.resourceType,
      url: item.url,
      difficulty: item.difficulty,
      topic: item.topic,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const openRecommendation = (item: StudyRecommendation) => {
    setEditing(item);
    setRecommendationForm({
      userId: item.user.id,
      subjectId: item.subject.id,
      resourceId: item.resource.id,
      type: item.type,
      title: item.title,
      description: item.description,
      reason: item.reason,
      priority: item.priority,
      status: item.status,
    });
    setModalOpen(true);
  };

  const openNotification = (item: UserNotification) => {
    setEditing(item);
    setNotificationForm({
      userId: item.user.id,
      title: item.title,
      message: item.message,
      type: item.type,
      scheduleAt: item.scheduleAt ? new Date(item.scheduleAt).toISOString().slice(0, 16) : "",
      isRead: item.isRead,
    });
    setModalOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (tab === "resources") {
        const current = editing as EducationalResource | null;
        const result = current
          ? await updateCatalogResource(current.id, {
              title: resourceForm.title,
              description: resourceForm.description,
              resourceType: resourceForm.resourceType,
              url: resourceForm.url,
              difficulty: resourceForm.difficulty,
              topic: resourceForm.topic,
              isActive: resourceForm.isActive,
            })
          : await createCatalogResource(resourceForm);
        setResources((items) => current ? items.map((item) => item.id === result.id ? result : item) : [result, ...items]);
      } else if (tab === "recommendations") {
        const current = editing as StudyRecommendation | null;
        const result = current
          ? await updateCatalogRecommendation(current.id, {
              type: recommendationForm.type,
              title: recommendationForm.title,
              description: recommendationForm.description,
              reason: recommendationForm.reason,
              priority: recommendationForm.priority,
              status: recommendationForm.status,
            })
          : await createCatalogRecommendation(recommendationForm);
        setRecommendations((items) => current ? items.map((item) => item.id === result.id ? result : item) : [result, ...items]);
      } else {
        const current = editing as UserNotification | null;
        const payload = {
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          scheduleAt: notificationForm.scheduleAt ? new Date(notificationForm.scheduleAt).toISOString() : undefined,
          isRead: notificationForm.isRead,
        };
        const result = current
          ? await updateCatalogNotification(current.id, payload)
          : await createCatalogNotification({ ...notificationForm, ...payload });
        setNotifications((items) => current ? items.map((item) => item.id === result.id ? result : item) : [result, ...items]);
      }

      setModalOpen(false);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: EditingItem) => {
    if (!item || !window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;

    try {
      if (tab === "resources") {
        await deleteCatalogResource(item.id);
        setResources((items) => items.filter((entry) => entry.id !== item.id));
      } else if (tab === "recommendations") {
        await deleteCatalogRecommendation(item.id);
        setRecommendations((items) => items.filter((entry) => entry.id !== item.id));
      } else {
        await deleteCatalogNotification(item.id);
        setNotifications((items) => items.filter((entry) => entry.id !== item.id));
      }
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible eliminar el registro.");
    }
  };

  const tabLabel = tab === "resources" ? "recurso" : tab === "recommendations" ? "recomendación" : "notificación";

  return (
    <ContentShell title="Catálogos de contenido" description="Administra recursos educativos, recomendaciones y notificaciones utilizando relaciones reales del sistema." loading={loading} error={error} onRetry={() => void load()} actions={<Button onClick={openCreate}>Nuevo {tabLabel}</Button>}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Catálogos disponibles">
        <Button size="sm" variant={tab === "resources" ? "primary" : "outline"} onClick={() => { setTab("resources"); setSearch(""); }}>Recursos ({resources.length})</Button>
        <Button size="sm" variant={tab === "recommendations" ? "primary" : "outline"} onClick={() => { setTab("recommendations"); setSearch(""); }}>Recomendaciones ({recommendations.length})</Button>
        <Button size="sm" variant={tab === "notifications" ? "primary" : "outline"} onClick={() => { setTab("notifications"); setSearch(""); }}>Notificaciones ({notifications.length})</Button>
      </div>

      <Card padding="md">
        <label className="block space-y-2 text-sm text-muted">
          <span>Buscar en el catálogo actual</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, usuario, materia, tema o estado" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" />
        </label>
      </Card>

      {tab === "resources" && (
        filteredResources.length === 0 ? <EmptyState /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredResources.map((item) => <Card key={item.id} padding="md" className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-primary">{item.subject.name}</p><h3 className="mt-1 text-xl font-bold text-content">{item.title}</h3></div><span className={item.isActive ? "text-xs font-semibold text-success" : "text-xs font-semibold text-muted"}>{item.isActive ? "Activo" : "Inactivo"}</span></div><p className="mt-3 line-clamp-3 text-sm text-muted">{item.description}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted">Tipo</dt><dd className="font-semibold text-content">{item.resourceType}</dd></div><div><dt className="text-muted">Dificultad</dt><dd className="font-semibold text-content">{item.difficulty}</dd></div><div className="col-span-2"><dt className="text-muted">Tema</dt><dd className="font-semibold text-content">{item.topic}</dd></div></dl><div className="mt-auto flex flex-wrap gap-2 pt-5"><Button size="sm" variant="secondary" onClick={() => openResource(item)}>Editar</Button><Button size="sm" variant="danger" onClick={() => void remove(item)}>Eliminar</Button><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-control border border-primary px-3 text-sm font-semibold text-primary hover:bg-primary/10">Abrir</a></div></Card>)}</div>
      )}

      {tab === "recommendations" && (
        filteredRecommendations.length === 0 ? <EmptyState /> : <div className="grid gap-5 md:grid-cols-2">{filteredRecommendations.map((item) => <Card key={item.id} padding="md"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.type}</span><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{item.priority}</span><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{item.status}</span></div><h3 className="mt-4 text-xl font-bold text-content">{item.title}</h3><p className="mt-2 text-sm text-muted">{item.description}</p><div className="mt-4 rounded-control border border-border p-3 text-sm text-muted"><p><span className="text-content">Estudiante:</span> {item.user.firstName} {item.user.lastName}</p><p className="mt-1"><span className="text-content">Materia:</span> {item.subject.name}</p><p className="mt-1"><span className="text-content">Recurso:</span> {item.resource.title}</p></div><div className="mt-5 flex gap-2"><Button size="sm" variant="secondary" onClick={() => openRecommendation(item)}>Editar</Button><Button size="sm" variant="danger" onClick={() => void remove(item)}>Eliminar</Button></div></Card>)}</div>
      )}

      {tab === "notifications" && (
        filteredNotifications.length === 0 ? <EmptyState /> : <div className="space-y-4">{filteredNotifications.map((item) => <Card key={item.id} padding="md"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.type}</span><span className={item.isRead ? "text-xs font-semibold text-muted" : "text-xs font-semibold text-success"}>{item.isRead ? "Leída" : "Pendiente"}</span></div><h3 className="mt-3 text-lg font-bold text-content">{item.title}</h3><p className="mt-2 text-muted">{item.message}</p><p className="mt-3 text-sm text-muted">Para {item.user.firstName} {item.user.lastName} · Programada: {formatDate(item.scheduleAt)}</p></div><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => openNotification(item)}>Editar</Button><Button size="sm" variant="danger" onClick={() => void remove(item)}>Eliminar</Button></div></div></Card>)}</div>
      )}

      <Modal isOpen={modalOpen} title={`${editing ? "Editar" : "Nuevo"} ${tabLabel}`} size="lg" onClose={() => setModalOpen(false)} footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" form="catalog-form" loading={saving}>Guardar</Button></>}>
        <form id="catalog-form" onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2">
          {tab === "resources" && <ResourceForm value={resourceForm} setValue={setResourceForm} subjects={subjects} editing={Boolean(editing)} />}
          {tab === "recommendations" && <RecommendationForm value={recommendationForm} setValue={setRecommendationForm} users={users} subjects={subjects} resources={resources} editing={Boolean(editing)} />}
          {tab === "notifications" && <NotificationForm value={notificationForm} setValue={setNotificationForm} users={users} editing={Boolean(editing)} />}
        </form>
      </Modal>
    </ContentShell>
  );
};

const EmptyState = () => <Card padding="lg" className="text-center"><h3 className="text-xl font-bold text-content">No hay registros para mostrar</h3><p className="mt-2 text-muted">Cambia la búsqueda o crea un nuevo elemento.</p></Card>;

const inputClass = "w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary disabled:opacity-60";

const ResourceForm = ({ value, setValue, subjects, editing }: { value: ResourcePayload; setValue: React.Dispatch<React.SetStateAction<ResourcePayload>>; subjects: ContentSubject[]; editing: boolean }) => <><Field label="Materia"><select required disabled={editing} value={value.subjectId} onChange={(event) => setValue((current) => ({ ...current, subjectId: event.target.value }))} className={inputClass}><option value="">Seleccionar</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Tipo"><input required value={value.resourceType} onChange={(event) => setValue((current) => ({ ...current, resourceType: event.target.value }))} className={inputClass} /></Field><Field label="Título" wide><input required value={value.title} onChange={(event) => setValue((current) => ({ ...current, title: event.target.value }))} className={inputClass} /></Field><Field label="Descripción" wide><textarea required rows={3} value={value.description} onChange={(event) => setValue((current) => ({ ...current, description: event.target.value }))} className={inputClass} /></Field><Field label="URL" wide><input required type="url" value={value.url} onChange={(event) => setValue((current) => ({ ...current, url: event.target.value }))} className={inputClass} /></Field><Field label="Dificultad"><input required value={value.difficulty} onChange={(event) => setValue((current) => ({ ...current, difficulty: event.target.value }))} className={inputClass} /></Field><Field label="Tema"><input required value={value.topic} onChange={(event) => setValue((current) => ({ ...current, topic: event.target.value }))} className={inputClass} /></Field><label className="flex min-h-11 items-center gap-3 text-sm text-content sm:col-span-2"><input type="checkbox" checked={Boolean(value.isActive)} onChange={(event) => setValue((current) => ({ ...current, isActive: event.target.checked }))} className="h-5 w-5" />Recurso activo</label></>;

const RecommendationForm = ({ value, setValue, users, subjects, resources, editing }: { value: RecommendationPayload; setValue: React.Dispatch<React.SetStateAction<RecommendationPayload>>; users: AdminUser[]; subjects: ContentSubject[]; resources: EducationalResource[]; editing: boolean }) => <><Field label="Estudiante"><select required disabled={editing} value={value.userId} onChange={(event) => setValue((current) => ({ ...current, userId: event.target.value }))} className={inputClass}><option value="">Seleccionar</option>{users.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName} — {item.email}</option>)}</select></Field><Field label="Materia"><select required disabled={editing} value={value.subjectId} onChange={(event) => setValue((current) => ({ ...current, subjectId: event.target.value }))} className={inputClass}><option value="">Seleccionar</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Recurso" wide><select required disabled={editing} value={value.resourceId} onChange={(event) => setValue((current) => ({ ...current, resourceId: event.target.value }))} className={inputClass}><option value="">Seleccionar</option>{resources.map((item) => <option key={item.id} value={item.id}>{item.title} — {item.subject.name}</option>)}</select></Field><Field label="Tipo"><input required value={value.type} onChange={(event) => setValue((current) => ({ ...current, type: event.target.value }))} className={inputClass} /></Field><Field label="Prioridad"><input required value={value.priority} onChange={(event) => setValue((current) => ({ ...current, priority: event.target.value }))} className={inputClass} /></Field><Field label="Título" wide><input required value={value.title} onChange={(event) => setValue((current) => ({ ...current, title: event.target.value }))} className={inputClass} /></Field><Field label="Descripción" wide><textarea required rows={3} value={value.description} onChange={(event) => setValue((current) => ({ ...current, description: event.target.value }))} className={inputClass} /></Field><Field label="Motivo" wide><textarea required rows={3} value={value.reason} onChange={(event) => setValue((current) => ({ ...current, reason: event.target.value }))} className={inputClass} /></Field><Field label="Estado" wide><input required value={value.status} onChange={(event) => setValue((current) => ({ ...current, status: event.target.value }))} className={inputClass} /></Field></>;

const NotificationForm = ({ value, setValue, users, editing }: { value: NotificationPayload; setValue: React.Dispatch<React.SetStateAction<NotificationPayload>>; users: AdminUser[]; editing: boolean }) => <><Field label="Usuario" wide><select required disabled={editing} value={value.userId} onChange={(event) => setValue((current) => ({ ...current, userId: event.target.value }))} className={inputClass}><option value="">Seleccionar</option>{users.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName} — {item.email}</option>)}</select></Field><Field label="Título" wide><input required value={value.title} onChange={(event) => setValue((current) => ({ ...current, title: event.target.value }))} className={inputClass} /></Field><Field label="Mensaje" wide><textarea required rows={4} value={value.message} onChange={(event) => setValue((current) => ({ ...current, message: event.target.value }))} className={inputClass} /></Field><Field label="Tipo"><input required value={value.type} onChange={(event) => setValue((current) => ({ ...current, type: event.target.value }))} className={inputClass} /></Field><Field label="Programar para"><input type="datetime-local" value={value.scheduleAt ?? ""} onChange={(event) => setValue((current) => ({ ...current, scheduleAt: event.target.value }))} className={inputClass} /></Field><label className="flex min-h-11 items-center gap-3 text-sm text-content sm:col-span-2"><input type="checkbox" checked={Boolean(value.isRead)} onChange={(event) => setValue((current) => ({ ...current, isRead: event.target.checked }))} className="h-5 w-5" />Marcar como leída</label></>;

const Field = ({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) => <label className={`space-y-2 text-sm text-muted ${wide ? "sm:col-span-2" : ""}`}><span>{label}</span>{children}</label>;

export default AdminCatalogs;
