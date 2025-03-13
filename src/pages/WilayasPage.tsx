
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

interface Wilaya {
  id: number;
  name: string;
  name_ar: string | null;
  name_en: string | null;
}

const WilayasPage = () => {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("wilayas")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        
        console.log("Wilayas loaded:", data);
        setWilayas(data || []);
      } catch (err: any) {
        console.error("Error loading wilayas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWilayas();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Wilayas en Kabylie</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-kabyle-blue" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">
              Une erreur est survenue lors du chargement des wilayas: {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wilayas.map((wilaya) => (
              <Link key={wilaya.id} to={`/wilaya/${wilaya.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold">{wilaya.name}</h2>
                    <p className="text-gray-500 mt-2">
                      Découvrez les communes et logements disponibles à {wilaya.name}
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

export default WilayasPage;
