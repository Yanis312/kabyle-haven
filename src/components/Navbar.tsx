
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
  Moon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { useTheme } from "next-themes";

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
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link to="/" className="hidden font-bold sm:block">
          <span className="text-2xl">
            ⵣ<span>StayZen</span>
          </span>
        </Link>
        <div className="w-full flex-1 sm:w-auto">
          <Command className="rounded-lg border shadow-sm">
            <CommandInput placeholder="Rechercher un logement..." />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Logement 1</CommandItem>
                <CommandItem>Logement 2</CommandItem>
                <CommandItem>Logement 3</CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Aide">
                <CommandItem>
                  Rechercher un logement par ville, région...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <div className="flex items-center space-x-2">
          <ModeToggle />
          
          {/* Update the menu items in the dropdown */}
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
                  
                  {/* Add booking links based on user role */}
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
                      <DropdownMenuItem asChild>
                        <Link to="/host">
                          <CirclePlus className="mr-2 h-4 w-4" />
                          Devenir hôte
                        </Link>
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
    </header>
  );
}
