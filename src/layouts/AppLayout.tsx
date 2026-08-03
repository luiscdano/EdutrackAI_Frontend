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
  | "audit"
  | "logout";

type Theme = "light" | "dark";

interface NavigationItem {
  label: string;
  to: string;
  icon: IconName;
  end?: boolean;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
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
    logout: "M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5m4-3 4-4-4-4m4 4H9",
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
};

const studentGroups: NavigationGroup[] = [
  {
    label: "Aprendizaje",
    items: [
      { label: "Inicio", to: "/", icon: "home", end: true },
      { label: "Mi plan", to: "/practices", icon: "quiz" },
      { label: "Materias", to: "/subjects", icon: "book" },
      { label: "Biblioteca", to: "/resources", icon: "resource" },
      { label: "Progreso", to: "/progress", icon: "chart" },
      { label: "Recomendaciones", to: "/recommendations", icon: "idea" },
      { label: "Sesión de estudio", to: "/study-sessions", icon: "clock" },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Notificaciones", to: "/notifications", icon: "bell" },
      { label: "Perfil académico", to: "/academic-setup", icon: "settings" },
      { label: "Mi cuenta", to: "/profile", icon: "profile" },
    ],
  },
];

const adminGroups: NavigationGroup[] = [
  {
    label: "Operaciones",
    items: [
      { label: "Resumen", to: "/admin", icon: "home", end: true },
      { label: "Usuarios y roles", to: "/admin/users", icon: "users" },
      { label: "Gestión académica", to: "/admin/academic-management", icon: "book" },
      { label: "Quizzes", to: "/admin/quizzes", icon: "quiz" },
      { label: "Catálogos", to: "/admin/catalogs", icon: "resource" },
      { label: "Auditoría", to: "/admin/audit", icon: "audit" },
    ],
  },
  {
    label: "Personal",
    items: [
      { label: "Mi cuenta", to: "/profile", icon: "profile" },
    ],
  },
];

const routeInfo = (path: string) => {
  const routes: Array<[string, string, string]> = [
    ["/admin/academic-management", "Operaciones académicas", "Gestión académica"],
    ["/admin/users", "Administración", "Usuarios y roles"],
    ["/admin/quizzes", "Administración", "Gestión de quizzes"],
    ["/admin/catalogs", "Administración", "Catálogos de contenido"],
    ["/admin/audit", "Control", "Historial de actividad"],
    ["/admin", "Operaciones académicas", "Resumen administrativo"],
    ["/quizzes/attempts", "Práctica guiada", "Realizar quiz"],
    ["/practices", "Tu plan", "Prácticas académicas"],
    ["/study-sessions", "Enfoque", "Sesiones de estudio"],
    ["/academic-setup", "Configuración", "Perfil académico"],
    ["/recommendations", "Siguiente paso", "Recomendaciones"],
    ["/notifications", "Actividad", "Notificaciones"],
    ["/resources", "Aprendizaje", "Biblioteca"],
    ["/progress", "Rendimiento", "Progreso académico"],
    ["/subjects", "Aprendizaje", "Materias"],
    ["/profile", "Cuenta", "Mi perfil"],
    ["/", "Tu espacio de aprendizaje", "Inicio"],
  ];

  const result = routes.find(([prefix]) =>
    path === prefix || (prefix !== "/" && path.startsWith(prefix)),
  );

  return result
    ? { kicker: result[1], title: result[2] }
    : { kicker: "EduTrack AI", title: "Plataforma académica" };
};

const getInitialTheme = (): Theme => {
  const stored = window.localStorage.getItem("edutrack-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const AppLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const groups = isAdmin ? adminGroups : studentGroups;
  const page = routeInfo(location.pathname);
  const initials = `${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const accountLabel = useMemo(
    () => user ? `${user.firstName} ${user.lastName}` : "Usuario",
    [user],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("edutrack-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderSidebar = (mobile = false) => {
    const compact = !mobile && collapsed;

    return (
      <div className="flex h-full flex-col bg-primary-hover text-white">
        <div className="flex min-h-[74px] items-center justify-between border-b border-white/10 px-4">
          <NavLink
            to={isAdmin ? "/admin" : "/"}
            className={`flex min-w-0 items-center gap-3 ${compact ? "justify-center" : ""}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-extrabold text-primary-hover shadow-sm">
              ET
            </span>
            {!compact && (
              <span className="min-w-0">
                <strong className="block truncate text-[15px]">EduTrack AI</strong>
                <small className="block truncate text-[10px] font-medium text-white/55">
                  Aprendizaje con propósito
                </small>
              </span>
            )}
          </NavLink>
          {mobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="grid min-h-10 min-w-10 place-items-center rounded-control text-xl text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
            >
              ×
            </button>
          )}
        </div>

        <nav aria-label="Navegación principal" className="prototype-scrollbar flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              {!compact && (
                <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/38">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => [
                      "flex min-h-10 items-center gap-3 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                      isActive
                        ? "bg-white text-primary-hover shadow-sm"
                        : "text-white/68 hover:bg-white/10 hover:text-white",
                      compact ? "justify-center" : "",
                    ].join(" ")}
                    title={compact ? item.label : undefined}
                  >
                    <Icon name={item.icon} />
                    {!compact && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {!compact && !isAdmin && (
          <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.07] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Tu próximo paso</p>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-white/85">
              Continúa una práctica corta y mantén tu progreso activo.
            </p>
            <NavLink to="/practices" className="mt-3 inline-flex text-[11px] font-bold text-white underline-offset-4 hover:underline">
              Ver mi plan
            </NavLink>
          </div>
        )}

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex min-h-10 w-full items-center gap-3 rounded-[10px] px-2.5 text-[13px] font-semibold text-white/65 transition hover:bg-white/10 hover:text-white ${compact ? "justify-center" : ""}`}
            title={compact ? "Cerrar sesión" : undefined}
          >
            <Icon name="logout" />
            {!compact && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-grid-background min-h-screen overflow-x-hidden text-content">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[278px] shadow-2xl transition-transform lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {renderSidebar(true)}
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-30 hidden overflow-hidden transition-[width] duration-200 lg:block ${collapsed ? "w-[76px]" : "w-[218px]"}`}>
        {renderSidebar()}
      </aside>

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[218px]"}`}>
        <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/95 backdrop-blur">
          <div className="flex min-h-[74px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid min-h-10 min-w-10 place-items-center rounded-control border border-border bg-surface text-content hover:bg-surface-muted lg:hidden"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
              >
                ☰
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="hidden min-h-10 min-w-10 place-items-center rounded-control border border-border bg-surface text-content hover:bg-surface-muted lg:grid"
                aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
              >
                ☰
              </button>
              <div className="min-w-0">
                <p className="prototype-eyebrow truncate">{page.kicker}</p>
                <h1 className="truncate text-[17px] font-bold tracking-[-0.01em] sm:text-xl">{page.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-surface-muted px-3 py-2 text-[11px] font-semibold text-muted md:inline-flex">
                Mayo–Agosto 2026
              </span>
              <button
                type="button"
                onClick={() => setTheme((value) => value === "light" ? "dark" : "light")}
                className="grid min-h-10 min-w-10 place-items-center rounded-control border border-border bg-surface text-base text-muted hover:bg-surface-muted hover:text-content"
                aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
                title={theme === "light" ? "Modo oscuro" : "Modo claro"}
              >
                {theme === "light" ? "◐" : "☀"}
              </button>
              <NavLink
                to="/notifications"
                className="relative grid min-h-10 min-w-10 place-items-center rounded-control border border-border bg-surface text-muted hover:bg-surface-muted hover:text-content"
                aria-label="Abrir notificaciones"
              >
                <Icon name="bell" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-warning" />
              </NavLink>
              <NavLink
                to="/profile"
                className="flex min-h-10 items-center gap-2 rounded-control border border-border bg-surface px-1.5 pr-2.5 hover:bg-surface-muted"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {initials}
                  </span>
                )}
                <span className="hidden max-w-36 truncate text-xs font-semibold sm:block">{accountLabel}</span>
              </NavLink>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-7 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
