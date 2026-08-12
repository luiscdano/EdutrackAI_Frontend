import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type IconName = "home" | "practice" | "book" | "chart" | "plus" | "bell" | "profile" | "users" | "settings" | "quiz" | "resource" | "audit" | "logout" | "sun" | "moon" | "collapse";
type Theme = "light" | "dark";

interface NavItem {
  label: string;
  to: string;
  icon: IconName;
  end?: boolean;
}

const Icon = ({ name }: { name: IconName }) => {
  const paths: Record<IconName, string> = {
    home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z",
    practice: "M8 4h8l2 4v8l-4 4h-4l-4-4V8l2-4Zm1 6h6m-3-3v6m-2 4h4",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z",
    chart: "M4 19V9m6 10V5m6 14v-7m4 7H2",
    plus: "M12 5v14M5 12h14",
    bell: "M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
    profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87",
    settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-13 1 2.2 2.4.5 1.8-1.6 2.2 2.2-1.6 1.8.5 2.4 2.2 1-1 3-1 2.2 2.2 2.2 1.8-1.6 2.4.5 1 2.2",
    quiz: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 6a3 3 0 1 1 4.8 2.4c-.9.65-1.8 1.1-1.8 2.1m0 3.5h.01",
    resource: "M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm13 4h2v12a2 2 0 0 1-2 2H8",
    audit: "M9 4h6m-7 4h8m-8 4h5m-7-9h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
    logout: "M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5m4-3 4-4-4-4m4 4H9",
    sun: "M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    moon: "M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z",
    collapse: "m15 18-6-6 6-6",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[19px] w-[19px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
};

const studentNav: NavItem[] = [
  { label: "Inicio", to: "/", icon: "home", end: true },
  { label: "Practicar", to: "/practice", icon: "practice" },
  { label: "Materias", to: "/subjects", icon: "book" },
  { label: "Progreso", to: "/progress", icon: "chart" },
];

const adminNav: NavItem[] = [
  { label: "Resumen", to: "/admin", icon: "home", end: true },
  { label: "Usuarios", to: "/admin/users", icon: "users" },
  { label: "Gestión académica", to: "/admin/academic-management", icon: "book" },
  { label: "Quizzes", to: "/admin/quizzes", icon: "quiz" },
  { label: "Catálogos", to: "/admin/catalogs", icon: "resource" },
  { label: "Auditoría", to: "/admin/audit", icon: "audit" },
];

const routeTitle = (path: string) => {
  const routes: Array<[string, string]> = [
    ["/admin/academic-management", "Gestión académica"],
    ["/admin/users", "Usuarios y roles"],
    ["/admin/quizzes", "Quizzes"],
    ["/admin/catalogs", "Catálogos"],
    ["/admin/audit", "Auditoría"],
    ["/admin", "Administración"],
    ["/quizzes/attempts", "Práctica"],
    ["/practice", "Practicar"],
    ["/capture", "Añadir"],
    ["/subjects", "Materias"],
    ["/progress", "Progreso"],
    ["/resources", "Recursos"],
    ["/notifications", "Notificaciones"],
    ["/profile", "Mi cuenta"],
    ["/", "Inicio"],
  ];
  return routes.find(([prefix]) => path === prefix || (prefix !== "/" && path.startsWith(prefix)))?.[1] ?? "EduTrack AI";
};

const initialTheme = (): Theme => {
  const saved = window.localStorage.getItem("edutrack-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const AppLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem("edutrack-sidebar-collapsed") === "true",
  );
  const nav = isAdmin ? adminNav : studentNav;
  const initials = `${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`.toUpperCase();
  const fullName = useMemo(() => user ? `${user.firstName} ${user.lastName}` : "Usuario", [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("edutrack-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("edutrack-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderNavLink = (item: NavItem, mobile = false) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      title={!mobile && sidebarCollapsed ? item.label : undefined}
      className={({ isActive }) => [
        mobile
          ? "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold"
          : `flex min-h-11 items-center rounded-xl text-sm font-semibold transition ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"}`,
        isActive ? "text-primary" : "text-muted hover:text-content",
        !mobile && isActive ? "bg-primary/10" : "",
        !mobile && !isActive ? "hover:bg-surface-muted" : "",
      ].join(" ")}
    >
      <Icon name={item.icon} />
      <span className={mobile ? "truncate" : sidebarCollapsed ? "sr-only" : "truncate"}>{item.label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-app-bg text-content">
      <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex ${sidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className={`flex h-[72px] items-center border-b border-border ${sidebarCollapsed ? "justify-center px-2" : "justify-between gap-2 px-4"}`}>
          <NavLink to={isAdmin ? "/admin" : "/"} className="flex min-w-0 items-center gap-3" title="EduTrack AI">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-sm font-extrabold text-white">ET</span>
            {!sidebarCollapsed && (
              <span className="min-w-0">
                <strong className="block truncate text-sm text-content">EduTrack AI</strong>
                <small className="block truncate text-[10px] text-muted">Tu copiloto académico</small>
              </span>
            )}
          </NavLink>
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-content"
              aria-label="Contraer barra lateral"
              title="Contraer barra lateral"
            >
              <Icon name="collapse" />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="mx-auto mt-3 grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-content"
            aria-label="Expandir barra lateral"
            title="Expandir barra lateral"
          >
            <span className="rotate-180"><Icon name="collapse" /></span>
          </button>
        )}

        <nav className={`flex-1 space-y-1 py-5 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
          {!sidebarCollapsed && (
            <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">{isAdmin ? "Administración" : "Tu espacio"}</p>
          )}
          {nav.map((item) => renderNavLink(item))}
        </nav>

        <div className={`border-t border-border ${sidebarCollapsed ? "p-2" : "p-3"}`}>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            title={sidebarCollapsed ? fullName : undefined}
            className={`flex w-full items-center rounded-xl text-left transition hover:bg-surface-muted ${sidebarCollapsed ? "justify-center p-2" : "gap-3 p-2"}`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-xs font-bold text-primary">{initials}</span>
            {!sidebarCollapsed && (
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs text-content">{fullName}</strong>
                <small className="block truncate text-[10px] text-muted">{isAdmin ? "Administrador" : "Estudiante"}</small>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={signOut}
            title={sidebarCollapsed ? "Cerrar sesión" : undefined}
            className={`mt-1 flex min-h-10 w-full items-center rounded-xl text-xs font-semibold text-muted transition hover:bg-surface-muted hover:text-content ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-3"}`}
          >
            <Icon name="logout" /> {!sidebarCollapsed && "Cerrar sesión"}
          </button>
        </div>
      </aside>

      <div className={`transition-[padding] duration-200 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between gap-3 border-b border-border bg-app-bg/95 px-4 backdrop-blur sm:px-6 lg:h-[72px]">
          <div className="flex min-w-0 items-center gap-3">
            <NavLink to={isAdmin ? "/admin" : "/"} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-xs font-extrabold text-white lg:hidden">ET</NavLink>
            <div className="min-w-0">
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.14em] text-muted sm:block">{isAdmin ? "EduTrack Admin" : "EduTrack"}</span>
              <h1 className="truncate text-sm font-bold text-content sm:text-base">{routeTitle(location.pathname)}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isAdmin && (
              <button type="button" onClick={() => navigate("/capture")} className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary-hover" aria-label="Añadir nota, fecha o material">
                <Icon name="plus" /> <span className="hidden sm:inline">Añadir</span>
              </button>
            )}
            <button type="button" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-content" aria-label="Cambiar tema">
              <Icon name={theme === "light" ? "moon" : "sun"} />
            </button>
            {!isAdmin && (
              <button type="button" onClick={() => navigate("/notifications")} className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-surface-muted hover:text-content" aria-label="Notificaciones">
                <Icon name="bell" />
              </button>
            )}
            <button type="button" onClick={() => navigate("/profile")} className="grid h-10 w-10 place-items-center rounded-xl bg-primary/12 text-xs font-bold text-primary" aria-label="Mi cuenta">{initials}</button>
          </div>
        </header>

        {isAdmin && (
          <nav className="prototype-scrollbar flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 lg:hidden">
            {adminNav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${isActive ? "bg-primary/10 text-primary" : "text-muted"}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <main className={`px-4 py-5 sm:px-6 lg:px-8 lg:py-6 ${!isAdmin ? "pb-24 lg:pb-8" : ""}`}>
          <Outlet />
        </main>
      </div>

      {!isAdmin && (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-surface/95 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          {studentNav.map((item) => renderNavLink(item, true))}
        </nav>
      )}
    </div>
  );
};

export default AppLayout;
