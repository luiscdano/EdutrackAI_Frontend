import { Navigate, Outlet, useLocation } from "react-router-dom";

import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";

const FullPageLoader = () => (
  <main className="flex min-h-screen items-center justify-center bg-app-bg">
    <Loader size="lg" showLabel label="Restaurando sesión..." />
  </main>
);

export const PublicOnlyRoute = () => {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();

  if (isInitializing) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAdmin, isInitializing } = useAuth();

  if (isInitializing) return <FullPageLoader />;

  // A student can land on an old admin URL through browser history after
  // switching accounts. Returning home is safer and less confusing than
  // trapping a valid session on a 403 page.
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};
