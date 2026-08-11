import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import Loader from "./components/ui/Loader";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import { ForbiddenPage, NotFoundPage, RouteErrorPage } from "./pages/errors/StatusPage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from "./routes/RouteGuards";

const AcademicProfileRoute = lazy(() => import("./pages/academic/AcademicProfileRoute"));
const AcademicManagement = lazy(() => import("./pages/admin/AcademicManagement"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminCatalogs = lazy(() => import("./pages/admin/AdminCatalogs"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminQuizzes = lazy(() => import("./pages/admin/AdminQuizzes"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const Activities = lazy(() => import("./pages/activities/Activities"));
const DesignSystem = lazy(() => import("./pages/design-system/DesignSystem"));
const FocusSession = lazy(() => import("./pages/focus/FocusSession"));
const StudentHome = lazy(() => import("./pages/home/StudentHome"));
const Notifications = lazy(() => import("./pages/notifications/Notifications"));
const StudentOnboarding = lazy(() => import("./pages/onboarding/StudentOnboarding"));
const PracticeHub = lazy(() => import("./pages/practice/PracticeHub"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Progress = lazy(() => import("./pages/progress/Progress"));
const QuizAttempt = lazy(() => import("./pages/quizzes/QuizAttempt"));
const Recommendations = lazy(() => import("./pages/recommendations/Recommendations"));
const Resources = lazy(() => import("./pages/resources/Resources"));
const Subjects = lazy(() => import("./pages/subjects/Subjects"));

const RouteLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader size="lg" showLabel label="Cargando..." />
  </div>
);

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
    navigate("/onboarding", { replace: true });
  }} />;
};

const StudentHomeRoute = () => {
  const { user, isAdmin } = useAuth();
  if (!user) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <StudentHome />;
};

const ProfileRoute = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return user ? <Profile initialUser={user} onBack={() => navigate(-1)} /> : null;
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
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route errorElement={<RouteErrorPage />}>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />
          </Route>

          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/403" element={<ForbiddenPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="onboarding" element={<StudentOnboarding />} />
            <Route path="focus/:activityId" element={<FocusSession />} />

            <Route element={<AppLayout />}>
              <Route index element={<StudentHomeRoute />} />
              <Route path="practice" element={<PracticeHub />} />
              <Route path="practices" element={<Navigate to="/practice" replace />} />
              <Route path="quizzes" element={<Navigate to="/practice" replace />} />
              <Route path="quizzes/attempts/:attemptId" element={<QuizAttempt />} />
              <Route path="subjects" element={<SubjectsRoute />} />
              <Route path="progress" element={<ProgressRoute />} />
              <Route path="resources" element={<ResourcesRoute />} />

              <Route path="profile" element={<ProfileRoute />} />
              <Route path="notifications" element={<NotificationsRoute />} />
              <Route path="recommendations" element={<RecommendationsRoute />} />
              <Route path="study-sessions" element={<StudySessionsRoute />} />
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
    </Suspense>
  );
}
