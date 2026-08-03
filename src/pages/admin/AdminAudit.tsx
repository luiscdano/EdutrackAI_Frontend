import { useCallback, useEffect, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { getAdminAuditLogs } from "../../services/admin.service";
import type { AuditLogRecord, Pagination } from "../../types/admin.types";

const formatDate = (value: string) => new Date(value).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "medium" });
const formatValues = (value: unknown) => value ? JSON.stringify(value, null, 2) : "Sin información";

const AdminAudit = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityName, setEntityName] = useState("");
  const [selected, setSelected] = useState<AuditLogRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        search,
        action,
        entityName,
      });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [action, entityName, pagination.limit, pagination.page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const applySearch = () => {
    setPagination((current) => ({ ...current, page: 1 }));
    setSearch(searchDraft.trim());
  };

  return (
    <ContentShell title="Historial de actividad" description="Consulta acciones administrativas, cambios registrados y contexto técnico de auditoría." loading={loading} error={error} onRetry={() => void load()}>
      <Card padding="md">
        <form onSubmit={(event) => { event.preventDefault(); applySearch(); }} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <label className="space-y-2 text-sm text-muted"><span>Buscar</span><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Acción, entidad, usuario o ID" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Acción</span><input value={action} onChange={(event) => { setAction(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} placeholder="Ej. CHANGE_USER_ROLE" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Entidad</span><input value={entityName} onChange={(event) => { setEntityName(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} placeholder="Ej. User" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /></label>
          <Button type="submit" className="self-end">Buscar</Button>
        </form>
      </Card>

      {logs.length === 0 ? <Card padding="lg" className="text-center"><h3 className="text-xl font-bold text-content">No hay eventos registrados</h3><p className="mt-2 text-muted">No se encontraron resultados para los filtros seleccionados.</p></Card> : (
        <div className="space-y-4">
          {logs.map((log) => <Card key={log.id} padding="md"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{log.action}</span><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{log.entityName}</span></div><p className="mt-3 truncate font-semibold text-content">{log.user ? `${log.user.firstName} ${log.user.lastName} · ${log.user.email}` : "Sistema"}</p><p className="mt-1 text-sm text-muted">{formatDate(log.createdAt)}{log.entityId ? ` · ID ${log.entityId}` : ""}</p></div><Button size="sm" variant="outline" onClick={() => setSelected(log)}>Ver cambios</Button></div></Card>)}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted">Página {pagination.page} de {Math.max(1, pagination.totalPages)} · {pagination.total} evento(s)</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Anterior</Button><Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Siguiente</Button></div></div>

      <Modal isOpen={Boolean(selected)} title="Detalle de auditoría" size="xl" onClose={() => setSelected(null)} footer={<Button variant="outline" onClick={() => setSelected(null)}>Cerrar</Button>}>
        {selected && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><div><p className="text-sm text-muted">Acción</p><p className="font-semibold text-content">{selected.action}</p></div><div><p className="text-sm text-muted">Entidad</p><p className="font-semibold text-content">{selected.entityName}</p></div><div><p className="text-sm text-muted">Fecha</p><p className="font-semibold text-content">{formatDate(selected.createdAt)}</p></div><div><p className="text-sm text-muted">Usuario</p><p className="font-semibold text-content">{selected.user?.email ?? "Sistema"}</p></div><div><p className="text-sm text-muted">Dirección IP</p><p className="font-semibold text-content">{selected.ipAddress ?? "No registrada"}</p></div><div><p className="text-sm text-muted">ID entidad</p><p className="break-all font-semibold text-content">{selected.entityId ?? "No aplica"}</p></div></div><div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-sm font-semibold text-content">Valores anteriores</p><pre className="max-h-80 overflow-auto rounded-control border border-border bg-app-bg p-4 text-xs text-muted">{formatValues(selected.oldValues)}</pre></div><div><p className="mb-2 text-sm font-semibold text-content">Valores nuevos</p><pre className="max-h-80 overflow-auto rounded-control border border-border bg-app-bg p-4 text-xs text-muted">{formatValues(selected.newValues)}</pre></div></div>{selected.userAgent && <div><p className="text-sm font-semibold text-content">Agente de usuario</p><p className="mt-2 break-all text-sm text-muted">{selected.userAgent}</p></div>}</div>}
      </Modal>
    </ContentShell>
  );
};

export default AdminAudit;
