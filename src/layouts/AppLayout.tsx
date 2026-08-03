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
  | "logout"
  | "sun"
  | "moon";

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
    sun: "M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M18.36 5.64l-1.42 1.42M7.06 16.94l-1.42 1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    moon: "M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z",
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
    items: [{ label: "Mi cuenta", to: "/profile", icon: "profile" }],
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
  const savedTheme = window.localStorage.getItem("edutrack-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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
    () => (user ? `${user.firstName} ${user.lastName}` : "Usuario"),
    [user],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("edutrack-theme", theme);
  }, [theme]);

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

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const renderSidebar = (mobile = false) => {
    const compact = !mobile && collapsed;
    const closeMobile = () => {
      if (mobile) setMobileOpen(false);
    };

    return (
      <div className="flex h-full flex-col bg-surface text-content">
        <div className="flex min-h-[74px] items-center justify-between border-b border-border px-4">
          <NavLink
            to={isAdmin ? "/admin" : "/"}
            onClick={closeMobile}
            className={`flex min-w-0 items-center gap-3 ${compact ? "justify-center" : ""}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-extrabold text-surface">
              ET
            </span>
            {!compact && (
              <span className="min-w-0">
                <strong className="block truncate text-[15px] text-content">
                  EduTrack AI
                </strong>
                <small className="block truncate text-[10px] font-medium text-muted">
                  Aprendizaje con propósito
                </small>
              </span>
            )}
          </NavLink>

          {mobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="grid min-h-10 min-w-10 place-items-center rounded-control text-xl text-muted hover:bg-surface-muted hover:text-content"
              aria-label="Cerrar menú"
            >
              ×
            </button>
          )}
        </div>

        <nav
          aria-label="Navegación principal"
          className="prototype-scrollbar flex-1 overflow-y-auto px-3 py-4"
        >
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              {!compact && (
                <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  {group.label}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      [
                        "flex min-h-10 items-center gap-3 rounded-[10px] px-2.5 text-[13px] font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:bg-surface-muted hover:text-content",
                        compact ? "justify-center" : "",
                      ].join(" ")
                    }
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

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex min-h-10 w-full items-center gap-3 rounded-[10px] px-2.5 text-[13px] font-semibold text-muted transition hover:bg-surface-muted hover:text-content ${compact ? "justify-center" : ""}`}
            title={compact ? "Cerrar sesión" : undefined}
          >
            <Icon name="logout" />
            {!compact && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    );
  };

  const themeLabel =
    theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  return (
    <div className="min-h-screen overflow-x-hidden bg-app-bg text-content">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(284px,86vw)] border-r border-border bg-surface shadow-xl transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebar(true)}
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-surface transition-[width] lg:block ${
          collapsed ? "w-[72px]" : "w-[236px]"
        }`}
      >
        {renderSidebar()}
      </aside>

      <div
        className={`min-h-screen transition-[padding] ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[236px]"
        }`}
      >
        <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex min-h-[74px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid min-h-10 min-w-10 place-items-center rounded-control border border-border text-content hover:bg-surface-muted lg:hidden"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
              >
                ☰
              </button>

              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="hidden min-h-10 min-w-10 place-items-center rounded-control border border-border text-content hover:bg-surface-muted lg:grid"
                aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
              >
                ☰
              </button>

              <div className="min-w-0">
                <p className="prototype-eyebrow truncate">{page.kicker}</p>
                <h1 className="truncate text-xl font-bold tracking-[-0.02em] text-content sm:text-2xl">
                  {page.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="grid min-h-10 min-w-10 place-items-center rounded-control border border-border bg-surface text-muted transition hover:bg-surface-muted hover:text-content"
                aria-label={themeLabel}
                title={themeLabel}
                aria-pressed={theme === "dark"}
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} />
              </button>

              <NavLink
                to="/notifications"
                className="grid min-h-10 min-w-10 place-items-center rounded-control border border-border bg-surface text-muted hover:bg-surface-muted hover:text-content"
                aria-label="Abrir notificaciones"
              >
                <Icon name="bell" />
              </NavLink>

              <NavLink
                to="/profile"
                className="flex min-h-10 items-center gap-2 rounded-control border border-border bg-surface px-2 pr-3 hover:bg-surface-muted"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                  </span>
                )}
                <span className="hidden max-w-40 truncate text-sm font-semibold text-content sm:block">
                  {accountLabel}
                </span>
              </NavLink>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1600px] bg-app-bg px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
