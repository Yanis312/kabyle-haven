
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1565689478170-6a0639f7f4fd?q=80&w=1470&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay with pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 kabyle-pattern mix-blend-multiply"></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 px-4 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6 drop-shadow-lg max-w-4xl">
          Découvrez la Beauté Authentique de la Kabylie
        </h1>
        <p className="text-xl text-white text-center mb-8 max-w-2xl drop-shadow-md">
          Séjournez dans des maisons traditionnelles et immergez-vous dans la culture berbère
        </p>
        
        {/* Search Bar */}
        <div className="w-full max-w-4xl mx-auto">
          <SearchBar />
        </div>
      </div>
    </div>
  );
};

export default Hero;
