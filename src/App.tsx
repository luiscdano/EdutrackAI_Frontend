import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import AcademicProfileRoute from "./pages/academic/AcademicProfileRoute";
import AcademicManagement from "./pages/admin/AcademicManagement";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminCatalogs from "./pages/admin/AdminCatalogs";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminUsers from "./pages/admin/AdminUsers";
import Activities from "./pages/activities/Activities";
import Dashboard from "./pages/dashboard/Dashboard";
import DesignSystem from "./pages/design-system/DesignSystem";
import { ForbiddenPage, NotFoundPage, RouteErrorPage } from "./pages/errors/StatusPage";
import Login from "./pages/login/Login";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";
import Progress from "./pages/progress/Progress";
import QuizAttempt from "./pages/quizzes/QuizAttempt";
import QuizCatalog from "./pages/quizzes/QuizCatalog";
import Recommendations from "./pages/recommendations/Recommendations";
import Register from "./pages/register/Register";
import Resources from "./pages/resources/Resources";
import Subjects from "./pages/subjects/Subjects";
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from "./routes/RouteGuards";

const LoginRoute = () => {
  const { completeAuthentication } = useAuth();
  const navigate = useNavigate();

  return <Login onLoginSuccess={(user) => {
    completeAuthentication(user);
    navigate(user.role.name.toLowerCase() === "admin" ? "/admin" : "/", { replace: true });
  }} />;
};

const RegisterRoute = () => {
  const { completeAuthentication } = useAuth();
  const navigate = useNavigate();

  return <Register onRegisterSuccess={(user) => {
    completeAuthentication(user);
    navigate("/", { replace: true });
  }} />;
};

const StudentDashboardRoute = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <Dashboard
      firstName={user.firstName}
      onOpenAccount={() => navigate("/profile")}
      onOpenSubjects={() => navigate("/subjects")}
      onOpenProgress={() => navigate("/progress")}
      onOpenResources={() => navigate("/resources")}
      onOpenRecommendations={() => navigate("/recommendations")}
      onOpenNotifications={() => navigate("/notifications")}
      onOpenAcademicProfile={() => navigate("/academic-setup")}
      onOpenStudySessions={() => navigate("/study-sessions")}
      onOpenPractices={() => navigate("/practices")}
    />
  );
};

const ProfileRoute = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return <Profile initialUser={user} onBack={() => navigate(-1)} key={`${user.id}-${user.updateAt ?? user.createdAt}`} />;
};

const SubjectsRoute = () => {
  const navigate = useNavigate();
  return <Subjects onBack={() => navigate(-1)} />;
};

const ProgressRoute = () => {
  const navigate = useNavigate();
  return <Progress onBack={() => navigate(-1)} />;
};

const ResourcesRoute = () => {
  const navigate = useNavigate();
  return <Resources onBack={() => navigate(-1)} />;
};

const RecommendationsRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return user ? <Recommendations userId={user.id} onBack={() => navigate(-1)} /> : null;
};

const NotificationsRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return user ? <Notifications userId={user.id} onBack={() => navigate(-1)} /> : null;
};

const AcademicSetupRoute = () => {
  const { user } = useAuth();
  return user ? <AcademicProfileRoute userId={user.id} /> : null;
};

const StudySessionsRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return user ? <Activities userId={user.id} onBack={() => navigate(-1)} /> : null;
};

const AdminDashboardRoute = () => {
  const navigate = useNavigate();
  return <AdminDashboard onBack={() => navigate("/admin")} />;
};

export default function App() {
  return (
    <Routes>
      <Route errorElement={<RouteErrorPage />}>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
        </Route>

        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/403" element={<ForbiddenPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<StudentDashboardRoute />} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="subjects" element={<SubjectsRoute />} />
            <Route path="progress" element={<ProgressRoute />} />
            <Route path="study-sessions" element={<StudySessionsRoute />} />
            <Route path="practices" element={<QuizCatalog />} />
            <Route path="quizzes/attempts/:attemptId" element={<QuizAttempt />} />
            <Route path="resources" element={<ResourcesRoute />} />
            <Route path="recommendations" element={<RecommendationsRoute />} />
            <Route path="notifications" element={<NotificationsRoute />} />
            <Route path="academic-setup" element={<AcademicSetupRoute />} />

            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboardRoute />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/academic-management" element={<AcademicManagement />} />
              <Route path="admin/quizzes" element={<AdminQuizzes />} />
              <Route path="admin/catalogs" element={<AdminCatalogs />} />
              <Route path="admin/audit" element={<AdminAudit />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
