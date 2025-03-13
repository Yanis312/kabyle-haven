
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: 'client' | 'proprietaire') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  loading: boolean;
};

type ProfileData = {
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  phone?: string;
  location?: string;
  role?: 'client' | 'proprietaire';
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Active session" : "No session");
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "Session exists" : "No session");
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
          
          // If user is logged out, redirect to auth page
          if (event === 'SIGNED_OUT') {
            navigate("/auth", { replace: true });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Check session status when window gets focus
  useEffect(() => {
    const handleFocus = async () => {
      console.log("Window focused - checking session...");
      const { data } = await supabase.auth.getSession();
      
      // If session state doesn't match what we have stored, update it
      if (!!session !== !!data.session) {
        console.log("Session state mismatch detected on focus - updating...");
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
          navigate("/auth", { replace: true });
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [session, navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (data) {
        console.log("Profile fetched successfully:", data);
        setProfile(data);
      } else {
        console.log("No profile found for user:", userId);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (
    userId: string,
    email: string,
    firstName: string,
    lastName: string,
    role: 'client' | 'proprietaire'
  ) => {
    try {
      console.log("Creating profile for user:", userId);
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: role
        });

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }

      console.log("Profile created successfully");
      return true;
    } catch (error) {
      console.error("Error creating profile:", error);
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<ProfileData>) => {
    if (!user) {
      toast.error("Vous devez être connecté pour mettre à jour votre profil");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await fetchProfile(user.id);
      
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: 'client' | 'proprietaire'
  ) => {
    try {
      setLoading(true);
      
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Create the profile with the same ID
        const profileCreated = await createProfile(
          data.user.id,
          email,
          firstName,
          lastName,
          role
        );

        if (!profileCreated) {
          throw new Error("Erreur lors de la création du profil");
        }

        toast.success("Inscription réussie! Vous pouvez maintenant vous connecter.");
        navigate("/auth", { replace: true });
      }
    } catch (error: any) {
      toast.error(`Erreur d'inscription: ${error.message}`);
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Redirect based on role
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileData?.role === "proprietaire") {
          navigate("/host", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        
        toast.success("Connexion réussie!");
      }
    } catch (error: any) {
      toast.error(`Erreur de connexion: ${error.message}`);
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out user...");
      
      // Important: Clear all local state first before making the signOut request
      // This ensures UI updates immediately, even if the request takes time
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Now perform the actual signOut
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures ALL devices are logged out
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Sign out successful");
      
      // Force navigate to auth page
      navigate("/auth", { replace: true });
      toast.success("Déconnexion réussie!");
    } catch (error: any) {
      // Restore session if there was an error
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      toast.error(`Erreur de déconnexion: ${error.message}`);
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        signUp,
        signIn,
        signOut,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
