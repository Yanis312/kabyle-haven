
import { Search, User, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [navigate]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSigningOut) return; // Prevent multiple clicks
    
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erreur lors de la déconnexion. Veuillez réessayer.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-kabyle-terracotta flex items-center justify-center">
            <span className="text-white font-bold">K</span>
          </div>
          <span className="font-playfair text-xl font-semibold bg-gradient-to-r from-kabyle-terracotta to-kabyle-blue bg-clip-text text-transparent">
            KabyleHaven
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-kabyle-terracotta transition-colors">
            Accueil
          </Link>
          <Link to="/properties" className="font-medium hover:text-kabyle-terracotta transition-colors">
            Logements
          </Link>
          <Link to="/regions" className="font-medium hover:text-kabyle-terracotta transition-colors">
            Régions
          </Link>
          {profile?.role === "proprietaire" ? (
            <Link to="/host" className="font-medium hover:text-kabyle-terracotta transition-colors">
              Mes logements
            </Link>
          ) : (
            <Link to="/host" className="font-medium hover:text-kabyle-terracotta transition-colors">
              Devenir hôte
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="rounded-full">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                {profile?.role === "proprietaire" && (
                  <DropdownMenuItem asChild>
                    <Link to="/host" className="cursor-pointer">
                      Gérer mes logements
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="cursor-pointer text-red-500"
                  disabled={isSigningOut || loading}
                >
                  <LogOut className="h-4 w-4 mr-2" /> 
                  {isSigningOut ? "Déconnexion..." : "Déconnexion"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Connexion
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute w-full bg-white shadow-md transition-all duration-300 ease-in-out",
        isMenuOpen ? "max-h-screen border-b" : "max-h-0 overflow-hidden"
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link to="/" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Accueil
          </Link>
          <Link to="/properties" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Logements
          </Link>
          <Link to="/regions" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Régions
          </Link>
          {profile?.role === "proprietaire" ? (
            <Link to="/host" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
              Mes logements
            </Link>
          ) : (
            <Link to="/host" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
              Devenir hôte
            </Link>
          )}
          <Button variant="outline" size="sm" className="w-full justify-start rounded-full">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          
          {user ? (
            <>
              <Link to="/profile" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
                Mon profil
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={isSigningOut || loading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? "Déconnexion..." : "Déconnexion"}
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Connexion / Inscription
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
