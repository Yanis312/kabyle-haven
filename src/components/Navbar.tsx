
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogIn,
  LogOut,
  UserPlus,
  User,
  UserCircle,
  Home,
  Calendar,
  CirclePlus,
  Sun,
  Moon,
  Search,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import HostDialog from "@/components/HostDialog";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";

// Create a simple ModeToggle component to replace the import
function ModeToggle() {
  const { setTheme, theme } = useTheme();
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Update the Navbar component to add booking links
export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [hostDialogOpen, setHostDialogOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?region=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      toast.error("Veuillez entrer un terme de recherche");
    }
  };

  // Fetch pending booking requests count for proprietaires
  useEffect(() => {
    if (user && profile?.role === 'proprietaire') {
      const fetchPendingRequests = async () => {
        try {
          const { data, error, count } = await supabase
            .from("booking_requests")
            .select("id", { count: 'exact' })
            .eq("owner_id", user.id)
            .eq("status", "pending");
          
          if (error) throw error;
          
          setPendingRequests(count || 0);
        } catch (err) {
          console.error("Error fetching pending requests:", err);
        }
      };
      
      fetchPendingRequests();
      
      // Set up realtime subscription for new booking requests
      const channel = supabase
        .channel('booking-requests-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_requests',
            filter: `owner_id=eq.${user.id}`
          },
          () => {
            fetchPendingRequests();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, profile]);

  // Fetch pending booking requests count for clients
  useEffect(() => {
    if (user && profile?.role === 'client') {
      const fetchMyBookings = async () => {
        try {
          // Check if there are any updates to the user's booking requests
          const { data, error, count } = await supabase
            .from("booking_requests")
            .select("id", { count: 'exact' })
            .eq("requester_id", user.id)
            .not("status", "eq", "pending");
          
          if (error) throw error;
          
          setPendingBookings(count || 0);
        } catch (err) {
          console.error("Error fetching client bookings:", err);
        }
      };
      
      fetchMyBookings();
      
      // Set up realtime subscription for booking request status changes
      const channel = supabase
        .channel('client-bookings-count')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'booking_requests',
            filter: `requester_id=eq.${user.id}`
          },
          () => {
            fetchMyBookings();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, profile]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="font-bold">
            <span className="text-2xl">
              ⵣ<span>StayZen</span>
            </span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input 
              type="search" 
              placeholder="Rechercher un logement..." 
              className="w-full pl-10 py-2 border rounded-full bg-background text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          <ModeToggle />
          
          {/* Notification bell for proprietaires */}
          {user && profile?.role === 'proprietaire' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/booking-management')}
            >
              <Bell className="h-5 w-5" />
              {pendingRequests > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 px-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-xs"
                  variant="destructive"
                >
                  {pendingRequests}
                </Badge>
              )}
            </Button>
          )}
          
          {/* Notification bell for clients */}
          {user && profile?.role === 'client' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate('/my-bookings')}
            >
              <Calendar className="h-5 w-5" />
              {pendingBookings > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 px-1.5 h-5 min-w-5 flex items-center justify-center bg-amber-500 text-white text-xs"
                >
                  {pendingBookings}
                </Badge>
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  {user ? (
                    <>
                      <AvatarImage 
                        src="" 
                        alt={`${profile?.first_name || ''} ${profile?.last_name || ''}`} 
                      />
                      <AvatarFallback>
                        {profile?.first_name?.[0] || ''}
                        {profile?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="" alt="Avatar" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  
                  {profile?.role === 'proprietaire' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/property-management">
                          <Home className="mr-2 h-4 w-4" />
                          Mes logements
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/booking-management">
                          <Calendar className="mr-2 h-4 w-4" />
                          Demandes de réservation
                          {pendingRequests > 0 && (
                            <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-300">
                              {pendingRequests}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/my-bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mes réservations
                        {pendingBookings > 0 && (
                          <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                            {pendingBookings}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  {profile?.role !== 'proprietaire' && (
                    <>
                      <DropdownMenuItem onClick={() => setHostDialogOpen(true)}>
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Devenir hôte
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/auth?mode=login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Connexion
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth?mode=signup">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Inscription
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Dialog pour devenir hôte */}
      <HostDialog open={hostDialogOpen} onOpenChange={setHostDialogOpen} />
    </header>
  );
}
