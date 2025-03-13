
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

interface Commune {
  id: number;
  name: string;
  name_ar: string | null;
  name_en: string | null;
  wilaya_id: number | null;
}

interface Wilaya {
  id: number;
  name: string;
}

const CommunePage = () => {
  const { id } = useParams<{ id: string }>();
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [wilaya, setWilaya] = useState<Wilaya | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch wilaya info
        const { data: wilayaData, error: wilayaError } = await supabase
          .from("wilayas")
          .select("id, name")
          .eq("id", id)
          .single();
          
        if (wilayaError) throw wilayaError;
        setWilaya(wilayaData);
        
        // Fetch communes for the wilaya
        const { data: communesData, error: communesError } = await supabase
          .from("communes")
          .select("*")
          .eq("wilaya_id", id)
          .order("name", { ascending: true });
          
        if (communesError) throw communesError;
        
        console.log("Communes loaded:", communesData);
        setCommunes(communesData || []);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Link to="/wilaya">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {wilaya ? `Communes de ${wilaya.name}` : 'Chargement...'}
          </h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-kabyle-blue" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">
              Une erreur est survenue lors du chargement des communes: {error}
            </p>
          </div>
        ) : communes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              Aucune commune trouvée pour cette wilaya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communes.map((commune) => (
              <Link key={commune.id} to={`/commune/${commune.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">{commune.name}</h2>
                    <p className="text-gray-500 mt-2">
                      Découvrez les logements disponibles à {commune.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CommunePage;
