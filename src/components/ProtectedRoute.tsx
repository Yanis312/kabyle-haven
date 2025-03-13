
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("client" | "proprietaire")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kabyle-blue"></div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to auth page
  if (!user) {
    console.log("User not authenticated, redirecting to auth page");
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  
  // If specific roles are required, check user role
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    console.log(`Access denied: User role ${profile.role} not in allowed roles:`, allowedRoles);
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
