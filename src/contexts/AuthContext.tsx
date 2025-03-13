
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
  isSigningOut: boolean;
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  console.log("AuthProvider initializing, current state:", { 
    hasSession: !!session, 
    hasUser: !!user, 
    hasProfile: !!profile,
    loading,
    isSigningOut
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Active session found" : "No session found");
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("User found in session, fetching profile for:", session.user.id);
        fetchProfile(session.user.id);
      } else {
        console.log("No user in session, setting loading to false");
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
          console.log("Auth state change - user exists, fetching profile");
          await fetchProfile(session.user.id);
        } else {
          console.log("Auth state change - no user, clearing profile");
          setProfile(null);
          setLoading(false);
          
          // If user is logged out, redirect to auth page
          if (event === 'SIGNED_OUT') {
            console.log("SIGNED_OUT event - redirecting to auth page");
            navigate("/auth", { replace: true });
          }
        }
      }
    );

    return () => {
      console.log("Cleaning up auth subscription");
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
        console.log("Current session state:", !!session);
        console.log("New session state:", !!data.session);
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          console.log("Session exists after tab switch, fetching profile");
          await fetchProfile(data.session.user.id);
        } else {
          console.log("No session after tab switch, clearing profile");
          setProfile(null);
          // Redirect to auth page if session is gone
          navigate("/auth", { replace: true });
        }
      } else {
        console.log("Session state unchanged after focus");
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
      console.log("Updating profile for user:", user.id, profileData);
      
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
      console.log("Signing up with email:", email);
      
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
        console.log("User registered successfully:", data.user.id);
        
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
      console.log("Signing in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("Sign in successful:", data);

      // Redirect based on role
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        console.log("User profile data:", profileData);

        if (profileData?.role === "proprietaire") {
          console.log("Redirecting to host page (proprietaire)");
          navigate("/host", { replace: true });
        } else {
          console.log("Redirecting to home page (client)");
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
    console.log("signOut called, current state:", { isSigningOut });
    
    if (isSigningOut) {
      console.log("Already signing out, ignoring duplicate request");
      return;
    }
    
    try {
      setIsSigningOut(true);
      console.log("Starting sign out process");
      
      // Clear local state immediately for a more responsive UI
      console.log("Clearing local state");
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Sign out from Supabase (all sessions)
      console.log("Calling Supabase signOut with scope:global");
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all devices
      });
      
      if (error) {
        console.error("Supabase signOut returned error:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      toast.success("Déconnexion réussie!");
      
      // Navigate to auth page
      console.log("Navigating to auth page");
      navigate("/auth", { replace: true });
      
      // Force a page reload as last resort
      console.log("Forcing page reload");
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Erreur de déconnexion: ${error.message}`);
      
      // Try to restore session if there was an error
      console.log("Attempting to restore session after error");
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Restored session:", data.session ? "Session exists" : "No session");
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        }
      } catch (restoreError) {
        console.error("Failed to restore session:", restoreError);
      }
    } finally {
      console.log("Sign out process completed");
      setLoading(false);
      setIsSigningOut(false);
    }
  };

  console.log("AuthProvider rendering with state:", { 
    hasSession: !!session, 
    hasUser: !!user, 
    hasProfile: !!profile,
    loading,
    isSigningOut
  });

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
        isSigningOut,
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
