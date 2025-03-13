
import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Link to="/culture" className="font-medium hover:text-kabyle-terracotta transition-colors">
            Culture
          </Link>
          <Link to="/host" className="font-medium hover:text-kabyle-terracotta transition-colors">
            Héberger
          </Link>
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="rounded-full">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
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
        isMenuOpen ? "max-h-64 border-b" : "max-h-0 overflow-hidden"
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link to="/" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Accueil
          </Link>
          <Link to="/properties" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Logements
          </Link>
          <Link to="/culture" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Culture
          </Link>
          <Link to="/host" className="font-medium py-2 hover:text-kabyle-terracotta transition-colors">
            Héberger
          </Link>
          <Button variant="outline" size="sm" className="w-full justify-start rounded-full">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
