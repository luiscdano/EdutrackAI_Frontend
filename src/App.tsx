import { useState } from "react";

import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import AcademicProfileRoute from "./pages/academic/AcademicProfileRoute";
import AcademicManagement from "./pages/admin/AcademicManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Activities from "./pages/activities/Activities";
import Dashboard from "./pages/dashboard/Dashboard";
import DesignSystem from "./pages/design-system/DesignSystem";
import Login from "./pages/login/Login";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";
import Progress from "./pages/progress/Progress";
import Recommendations from "./pages/recommendations/Recommendations";
import Register from "./pages/register/Register";
import Resources from "./pages/resources/Resources";
import Subjects from "./pages/subjects/Subjects";
import { clearAuthSession, getAuthenticatedUser } from "./services/auth.service";

const Restricted = ({ onBack }: { onBack: () => void }) => <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8"><Card padding="lg" className="max-w-lg text-center"><h1 className="text-2xl font-bold text-content">Acceso restringido</h1><p className="mt-3 text-muted">Esta sección está disponible únicamente para administradores.</p><Button className="mt-5" onClick={onBack}>Volver al dashboard</Button></Card></main>;

export default function App() {
  const [user, setUser] = useState(() => getAuthenticatedUser());
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
  if (path === "/design-system") return <DesignSystem />;
  if (!user) return path === "/register" ? <Register onRegisterSuccess={setUser} /> : <Login onLoginSuccess={setUser} />;
  const isAdmin = user.role.name.toLowerCase() === "admin";
  const goHome = () => window.location.assign("/");
  const logout = () => { clearAuthSession(); window.history.replaceState({}, "", "/"); setUser(null); };

  if (path === "/profile") return <Profile initialUser={user} onBack={goHome} />;
  if (path === "/subjects") return <Subjects onBack={goHome} />;
  if (path === "/progress") return <Progress onBack={goHome} />;
  if (path === "/resources") return <Resources onBack={goHome} />;
  if (path === "/recommendations") return <Recommendations userId={user.id} onBack={goHome} />;
  if (path === "/notifications") return <Notifications userId={user.id} onBack={goHome} />;
  if (path === "/admin") return isAdmin ? <AdminDashboard onBack={goHome} /> : <Restricted onBack={goHome} />;
  if (path === "/admin/academic-management") return isAdmin ? <AcademicManagement /> : <Restricted onBack={goHome} />;
  if (path === "/academic-setup") return <AcademicProfileRoute userId={user.id} />;
  if (path === "/study-sessions") return <Activities userId={user.id} onBack={goHome} />;

  return <Dashboard firstName={user.firstName} onOpenAccount={() => window.location.assign("/profile")} onOpenSubjects={() => window.location.assign("/subjects")} onOpenProgress={() => window.location.assign("/progress")} onOpenResources={() => window.location.assign("/resources")} onOpenRecommendations={() => window.location.assign("/recommendations")} onOpenNotifications={() => window.location.assign("/notifications")} onOpenAcademicProfile={() => window.location.assign("/academic-setup")} onOpenStudySessions={() => window.location.assign("/study-sessions")} onOpenAdminDashboard={isAdmin ? () => window.location.assign("/admin") : undefined} onOpenAdminAcademic={isAdmin ? () => window.location.assign("/admin/academic-management") : undefined} onLogout={logout} />;
}
