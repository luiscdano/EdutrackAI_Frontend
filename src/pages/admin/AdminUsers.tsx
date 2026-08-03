import { useCallback, useEffect, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import {
  getAdminRoles,
  getAdminUsers,
  setAdminUserActive,
  setAdminUserRole,
} from "../../services/admin.service";
import type { AdminRole, AdminUser, Pagination } from "../../types/admin.types";

const formatDate = (value: string | null) => value ? new Date(value).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }) : "Nunca";

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [userData, roleData] = await Promise.all([
        getAdminUsers({
          page: pagination.page,
          limit: pagination.limit,
          search,
          role: role || undefined,
          isActive: status === "" ? undefined : status === "active",
        }),
        roles.length ? Promise.resolve(roles) : getAdminRoles(),
      ]);
      setUsers(userData.data);
      setPagination(userData.pagination);
      setRoles(roleData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, role, roles, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const openUser = (user: AdminUser) => {
    setSelected(user);
    setSelectedRoleId(user.role.id);
    setReason("");
  };

  const updateRole = async () => {
    if (!selected || selected.role.id === selectedRoleId) return;
    setSaving(true);

    try {
      const updated = await setAdminUserRole(selected.id, selectedRoleId, reason || undefined);
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
      setSelected(updated);
      setReason("");
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible cambiar el rol.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    const next = !user.isActive;
    if (!window.confirm(`¿Deseas ${next ? "activar" : "desactivar"} la cuenta de ${user.firstName} ${user.lastName}?`)) return;

    try {
      const updated = await setAdminUserActive(user.id, next, "Cambio desde el panel administrativo");
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (selected?.id === updated.id) setSelected(updated);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible cambiar el estado.");
    }
  };

  const applySearch = () => {
    setPagination((current) => ({ ...current, page: 1 }));
    setSearch(searchDraft.trim());
  };

  return (
    <ContentShell title="Usuarios y roles" description="Busca cuentas, consulta detalles, cambia roles y controla el acceso al sistema." loading={loading} error={error} onRetry={() => void load()}>
      <Card padding="md">
        <form onSubmit={(event) => { event.preventDefault(); applySearch(); }} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
          <label className="space-y-2 text-sm text-muted"><span>Buscar</span><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Nombre, correo o matrícula" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Rol</span><select value={role} onChange={(event) => { setRole(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="">Todos</option>{roles.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
          <label className="space-y-2 text-sm text-muted"><span>Estado</span><select value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPagination((current) => ({ ...current, page: 1 })); }} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label>
          <Button type="submit" className="self-end">Buscar</Button>
        </form>
      </Card>

      <div className="grid gap-4 md:hidden">
        {users.map((user) => <Card key={user.id} padding="md"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-content">{user.firstName} {user.lastName}</h3><p className="mt-1 text-sm text-muted">{user.email}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{user.isActive ? "Activo" : "Inactivo"}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted">Rol</dt><dd className="font-semibold text-content">{user.role.name}</dd></div><div><dt className="text-muted">Matrícula</dt><dd className="font-semibold text-content">{user.studentCode}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => openUser(user)}>Ver detalle</Button><Button size="sm" variant={user.isActive ? "danger" : "secondary"} onClick={() => void toggleActive(user)}>{user.isActive ? "Desactivar" : "Activar"}</Button></div></Card>)}
      </div>

      <Card padding="none" className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-surface-muted text-muted"><tr><th className="px-5 py-4 font-semibold">Usuario</th><th className="px-5 py-4 font-semibold">Matrícula</th><th className="px-5 py-4 font-semibold">Carrera</th><th className="px-5 py-4 font-semibold">Rol</th><th className="px-5 py-4 font-semibold">Estado</th><th className="px-5 py-4 font-semibold">Último acceso</th><th className="px-5 py-4 font-semibold">Acciones</th></tr></thead><tbody className="divide-y divide-border">{users.map((user) => <tr key={user.id} className="hover:bg-white/[0.03]"><td className="px-5 py-4"><p className="font-semibold text-content">{user.firstName} {user.lastName}</p><p className="text-muted">{user.email}</p></td><td className="px-5 py-4 text-muted">{user.studentCode}</td><td className="px-5 py-4 text-muted">{user.career}</td><td className="px-5 py-4"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{user.role.name}</span></td><td className="px-5 py-4"><span className={user.isActive ? "text-success" : "text-danger"}>{user.isActive ? "Activo" : "Inactivo"}</span></td><td className="px-5 py-4 text-muted">{formatDate(user.lastLogin)}</td><td className="px-5 py-4"><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => openUser(user)}>Detalle</Button><Button size="sm" variant={user.isActive ? "danger" : "secondary"} onClick={() => void toggleActive(user)}>{user.isActive ? "Desactivar" : "Activar"}</Button></div></td></tr>)}</tbody></table></div>
      </Card>

      {users.length === 0 && <Card padding="lg" className="text-center"><h3 className="text-xl font-bold text-content">No se encontraron usuarios</h3><p className="mt-2 text-muted">Prueba con otros filtros.</p></Card>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted">Página {pagination.page} de {Math.max(1, pagination.totalPages)} · {pagination.total} usuario(s)</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Anterior</Button><Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Siguiente</Button></div></div>

      <Modal isOpen={Boolean(selected)} title="Detalle del usuario" size="lg" onClose={() => setSelected(null)} footer={<><Button variant="outline" onClick={() => setSelected(null)}>Cerrar</Button><Button loading={saving} disabled={!selected || selected.role.id === selectedRoleId} onClick={() => void updateRole()}>Guardar rol</Button></>}>
        {selected && <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-muted">Nombre</p><p className="font-semibold text-content">{selected.firstName} {selected.lastName}</p></div><div><p className="text-sm text-muted">Correo</p><p className="break-all font-semibold text-content">{selected.email}</p></div><div><p className="text-sm text-muted">Matrícula</p><p className="font-semibold text-content">{selected.studentCode}</p></div><div><p className="text-sm text-muted">Carrera</p><p className="font-semibold text-content">{selected.career}</p></div><div><p className="text-sm text-muted">Creada</p><p className="font-semibold text-content">{formatDate(selected.createdAt)}</p></div><div><p className="text-sm text-muted">Correo verificado</p><p className="font-semibold text-content">{selected.emailVerified ? "Sí" : "No"}</p></div></div><div className="border-t border-border pt-5"><label className="block space-y-2 text-sm text-muted"><span>Rol</span><select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content">{roles.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.description ?? "Sin descripción"}</option>)}</select></label><label className="mt-4 block space-y-2 text-sm text-muted"><span>Motivo opcional</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="w-full resize-y rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" placeholder="Ej. Asignación temporal de administración" /></label></div></div>}
      </Modal>
    </ContentShell>
  );
};

export default AdminUsers;
