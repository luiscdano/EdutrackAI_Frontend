import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type IconName =
  | "home"
  | "book"
  | "chart"
  | "clock"
  | "quiz"
  | "resource"
  | "idea"
  | "bell"
  | "profile"
  | "users"
  | "settings"
  | "audit";

interface NavigationItem {
  label: string;
  to: string;
  icon: IconName;
  end?: boolean;
}

const Icon = ({ name }: { name: IconName }) => {
  const paths: Record<IconName, string> = {
    home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z",
    chart: "M4 19V9m6 10V5m6 14v-7m4 7H2",
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2",
    quiz: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 6a3 3 0 1 1 4.8 2.4c-.9.65-1.8 1.1-1.8 2.1m0 3.5h.01",
    resource: "M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm13 4h2v12a2 2 0 0 1-2 2H8",
    idea: "M9 18h6m-5 3h4m-2-19a7 7 0 0 0-4 12.74V16h8v-1.26A7 7 0 0 0 12 2Z",
    bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
    profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-12a4 4 0 0 1 0 7.75",
    settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-13 1 2.2 2.4.5 1.8-1.6 2.2 2.2-1.6 1.8.5 2.4 2.2 1-1 3 1 2.2-2.2 2.2-1.8-1.6-2.4.5-1 2.2h-3l-1-2.2-2.4-.5-1.8 1.6-2.2-2.2 1.6-1.8-.5-2.4-2.2-1 1-3-1-2.2 2.2-2.2 1.8 1.6 2.4-.5 1-2.2h3Z",
    audit: "M9 4h6m-7 4h8m-8 4h5m-7-9h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
};

const studentNavigation: NavigationItem[] = [
  { label: "Dashboard", to: "/", icon: "home", end: true },
  { label: "Materias", to: "/subjects", icon: "book" },
  { label: "Progreso", to: "/progress", icon: "chart" },
  { label: "Sesiones de estudio", to: "/study-sessions", icon: "clock" },
  { label: "Prácticas y quizzes", to: "/practices", icon: "quiz" },
  { label: "Recursos", to: "/resources", icon: "resource" },
  { label: "Recomendaciones", to: "/recommendations", icon: "idea" },
  { label: "Notificaciones", to: "/notifications", icon: "bell" },
  { label: "Perfil académico", to: "/academic-setup", icon: "settings" },
  { label: "Mi cuenta", to: "/profile", icon: "profile" },
];

const adminNavigation: NavigationItem[] = [
  { label: "Dashboard admin", to: "/admin", icon: "home", end: true },
  { label: "Usuarios y roles", to: "/admin/users", icon: "users" },
  { label: "Gestión académica", to: "/admin/academic-management", icon: "book" },
  { label: "Quizzes", to: "/admin/quizzes", icon: "quiz" },
  { label: "Catálogos", to: "/admin/catalogs", icon: "resource" },
  { label: "Auditoría", to: "/admin/audit", icon: "audit" },
  { label: "Mi cuenta", to: "/profile", icon: "profile" },
];

const titleForPath = (path: string) => {
  const titles: Array<[string, string]> = [
    ["/admin/academic-management", "Gestión académica"],
    ["/admin/users", "Usuarios y roles"],
    ["/admin/quizzes", "Gestión de quizzes"],
    ["/admin/catalogs", "Catálogos de contenido"],
    ["/admin/audit", "Historial de actividad"],
    ["/admin", "Dashboard administrativo"],
    ["/quizzes/attempts", "Realizar quiz"],
    ["/practices", "Prácticas académicas"],
    ["/study-sessions", "Sesiones de estudio"],
    ["/academic-setup", "Perfil académico"],
    ["/recommendations", "Sugerencias de estudio"],
    ["/notifications", "Notificaciones"],
    ["/resources", "Recursos educativos"],
    ["/progress", "Progreso académico"],
    ["/subjects", "Materias"],
    ["/profile", "Mi cuenta"],
    ["/", "Dashboard"],
  ];

  return titles.find(([prefix]) => path === prefix || (prefix !== "/" && path.startsWith(prefix)))?.[1] ?? "EduTrack AI";
};

const AppLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigation = isAdmin ? adminNavigation : studentNavigation;
  const title = titleForPath(location.pathname);
  const initials = `${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const accountLabel = useMemo(
    () => user ? `${user.firstName} ${user.lastName}` : "Usuario",
    [user],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMobile = () => setMobileOpen(false);
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex min-h-20 items-center justify-between border-b border-border px-4">
        <NavLink to={isAdmin ? "/admin" : "/"} onClick={closeMobile} className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-bold text-white">EA</span>
          {!collapsed && <span className="truncate text-lg font-bold text-content">EduTrack AI</span>}
        </NavLink>
        <button type="button" onClick={() => setMobileOpen(false)} className="grid min-h-11 min-w-11 place-items-center rounded-control text-muted hover:bg-white/10 hover:text-content lg:hidden" aria-label="Cerrar menú">×</button>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={closeMobile}
            className={({ isActive }) => [
              "flex min-h-12 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive ? "bg-primary text-white" : "text-muted hover:bg-white/10 hover:text-content",
              collapsed ? "justify-center" : "",
            ].join(" ")}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button type="button" onClick={handleLogout} className="flex min-h-12 w-full items-center justify-center rounded-control border border-border px-3 text-sm font-semibold text-content hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {collapsed ? "Salir" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-app-bg text-content">
      {mobileOpen && <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={closeMobile} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface shadow-2xl transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-surface transition-[width] lg:block ${collapsed ? "w-20" : "w-72"}`}>
        {sidebar}
      </aside>

      <div className={`min-h-screen transition-[padding] ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-20 border-b border-border bg-app-bg/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="grid min-h-11 min-w-11 place-items-center rounded-control border border-border text-content hover:bg-white/10 lg:hidden" aria-label="Abrir menú" aria-expanded={mobileOpen}>☰</button>
              <button type="button" onClick={() => setCollapsed((value) => !value)} className="hidden min-h-11 min-w-11 place-items-center rounded-control border border-border text-content hover:bg-white/10 lg:grid" aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}>☰</button>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{isAdmin ? "Administración" : "Estudiante"}</p>
                <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink to="/notifications" className="grid min-h-11 min-w-11 place-items-center rounded-control border border-border text-muted hover:bg-white/10 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Abrir notificaciones"><Icon name="bell" /></NavLink>
              <NavLink to="/profile" className="flex min-h-11 items-center gap-3 rounded-control border border-border px-2 pr-3 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">{initials}</span>}
                <span className="hidden max-w-40 truncate text-sm font-semibold sm:block">{accountLabel}</span>
              </NavLink>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
