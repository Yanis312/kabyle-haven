
import { useState } from "react";
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
  Search
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import HostDialog from "@/components/HostDialog";

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
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/my-bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mes réservations
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
