
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingRequestManagement from "@/components/BookingRequestManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function BookingManagementPage() {
  const { user, profile, loading } = useAuth();
  
  // If loading, show nothing yet
  if (loading) return null;
  
  // If user is not authenticated or not a proprietaire, redirect to home
  if (!user || profile?.role !== "proprietaire") {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <BookingRequestManagement />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
