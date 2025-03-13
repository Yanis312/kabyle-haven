import { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const navigate = useNavigate();

  console.log("AuthProvider initializing, current state:", { 
    hasSession: !!session, 
    hasUser: !!user, 
    hasProfile: !!profile,
    loading,
    isSigningOut
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData.session ? "Active session found" : "No session found");
        
        setSession(sessionData.session);
        setUser(sessionData.session?.user ?? null);
        
        if (sessionData.session?.user) {
          console.log("User found in session, fetching profile for:", sessionData.session.user.id);
          await fetchProfile(sessionData.session.user.id);
        } else {
          console.log("No user in session, setting loading to false");
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, newSession ? "Session exists" : "No session");
            
            if (event === 'SIGNED_OUT') {
              console.log("SIGNED_OUT event - clearing state and redirecting");
              setSession(null);
              setUser(null);
              setProfile(null);
              setLoading(false);
              setIsSigningOut(false);
              
              // Force redirect to auth page on sign out
              navigate("/auth", { replace: true });
              return;
            }
            
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              console.log("Auth state change - user exists, fetching profile");
              await fetchProfile(newSession.user.id);
            } else {
              console.log("Auth state change - no user, clearing profile");
              setProfile(null);
              setLoading(false);
            }
          }
        );
        
        authSubscriptionRef.current = subscription;
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup
    return () => {
      console.log("Cleaning up auth subscription");
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
    };
  }, [navigate]);

  // Check session status when window gets focus or visibility changes
  useEffect(() => {
    const checkSession = async () => {
      console.log("Window focused or visibility changed - checking session...");
      if (isSigningOut) {
        console.log("Skipping session check - currently signing out");
        return;
      }
      
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Session check result:", data.session ? "Session exists" : "No session");
        
        const sessionChanged = !!session !== !!data.session;
        const userChanged = session?.user?.id !== data.session?.user?.id;
        
        if (sessionChanged || userChanged) {
          console.log("Session state changed - updating...");
          
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          if (data.session?.user) {
            console.log("User exists after tab switch, fetching profile");
            await fetchProfile(data.session.user.id);
          } else {
            console.log("No user after tab switch, clearing profile");
            setProfile(null);
            // Only navigate to auth page if there's no session
            if (!data.session) {
              navigate("/auth", { replace: true });
            }
          }
        } else {
          console.log("Session state unchanged after check");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    // Check on focus and visibility change
    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    });
    
    // Also check immediately on mount
    checkSession();
    
    return () => {
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', () => {});
    };
  }, [session, navigate, isSigningOut]);

  // Add a more frequent session check to ensure persistence
  useEffect(() => {
    // Check session every 30 seconds to ensure it's still valid
    const intervalId = setInterval(async () => {
      if (!isSigningOut && !loading) {
        console.log("Periodic session check...");
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log("Session still valid");
            
            // Update session state if there's any change
            if (JSON.stringify(session) !== JSON.stringify(data.session)) {
              console.log("Session updated from periodic check");
              setSession(data.session);
              setUser(data.session.user);
            }
          } else if (session) {
            console.log("Session expired, updating state");
            setSession(null);
            setUser(null);
            setProfile(null);
            navigate("/auth", { replace: true });
          }
        } catch (error) {
          console.error("Error in periodic session check:", error);
        }
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [session, isSigningOut, loading, navigate]);

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
        window.location.href = '/auth';
      }, 100);
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(`Erreur de déconnexion: ${error.message}`);
      
      // Reset signing out state to allow retrying
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
