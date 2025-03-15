import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Globe, LogIn, MapPin, User as UserIcon, MessageSquare, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import MessagesNotification from "@/components/messaging/MessagesNotification";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <Link to="/" className="flex items-center">
          <img src="/logo-airbnb-kabyle.png" alt="Logo Airbnb Kabyle" className="h-8" />
        </Link>

        <div className="md:flex items-center hidden">
          <Link to="/regions" className="mx-2 text-sm font-medium hover:text-kabyle-terracotta">
            Régions
          </Link>
          <Link to="/wilaya" className="mx-2 text-sm font-medium hover:text-kabyle-terracotta">
            Wilayas
          </Link>
        </div>

        <div className="flex items-center">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-4">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4">
                  <Link to="/regions" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                    <MapPin size={16} /> Régions
                  </Link>
                  <Link to="/wilaya" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                    <Globe size={16} /> Wilayas
                  </Link>
                  {/* Add messaging link in mobile menu */}
                  <Link to="/messaging" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                    <MessageSquare size={16} /> Messages
                    {user && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                  {user && user.role === "proprietaire" && (
                    <>
                      <Link to="/property-management" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                        <MapPin size={16} /> Mes logements
                      </Link>
                      <Link to="/booking-management" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                        <Globe size={16} /> Demandes de réservation
                      </Link>
                    </>
                  )}
                  {user && (
                    <Link to="/profile" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                      <UserIcon size={16} /> Mon Profil
                    </Link>
                  )}
                  {!user && (
                    <Link to="/auth" className="flex items-center gap-2 py-2 hover:text-kabyle-terracotta">
                      <LogIn size={16} /> Connexion
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <>
              {user && (
                <>
                  {/* Add messages notification to desktop navbar */}
                  <MessagesNotification />
                  {user.role === "proprietaire" && (
                    <>
                      <Link to="/property-management" className="mx-2 text-sm font-medium hover:text-kabyle-terracotta">
                        Mes logements
                      </Link>
                      <Link to="/booking-management" className="mx-2 text-sm font-medium hover:text-kabyle-terracotta">
                        Demandes de réservation
                      </Link>
                    </>
                  )}
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-2">
                    <User2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Mon Profil</span>
                        </Link>
                      </DropdownMenuItem>
                      {/* Add messaging link in dropdown */}
                      <DropdownMenuItem asChild>
                        <Link to="/messaging" className="cursor-pointer">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadCount}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <a href="https://github.com/sadmann7/skateshop-demo" target="_blank" rel="noreferrer" className="flex items-center w-full">
                            <Github className="mr-2 h-4 w-4" />
                            <span>GitHub</span>
                          </a>
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="#" className="cursor-pointer">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          <span>Aide</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="cursor-pointer">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Connexion</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
