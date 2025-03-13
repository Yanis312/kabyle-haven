
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import Regions from "./pages/Regions";
import Host from "./pages/Host";
import UserProfile from "./pages/UserProfile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import WilayasPage from "./pages/WilayasPage";
import CommunePage from "./pages/CommunePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyManagement from "./pages/PropertyManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/wilaya" element={<WilayasPage />} />
            <Route path="/wilaya/:id" element={<CommunePage />} />
            <Route path="/commune/:id" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            
            {/* Protected routes for any authenticated user */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* Protected routes for proprietaire only */}
            <Route path="/host" element={
              <ProtectedRoute allowedRoles={["proprietaire"]}>
                <Host />
              </ProtectedRoute>
            } />
            <Route path="/property-management" element={
              <ProtectedRoute allowedRoles={["proprietaire"]}>
                <PropertyManagement />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
