
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

export const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anonymous Key");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

/**
 * Checks if a storage bucket exists, and creates it if it doesn't
 */
export const ensureBucketExists = async (bucketName: string, isPublic: boolean = false) => {
  try {
    // First check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
      });
      
      if (error) {
        throw error;
      }
      
      // If public, set bucket policy
      if (isPublic) {
        const { error: policyError } = await supabase.storage.from(bucketName).getPublicUrl('test');
        if (policyError) {
          console.error("Failed to set public policy", policyError);
        }
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    return false;
  }
};

/**
 * Set up initial profile for a user
 */
export const setupInitialProfile = async (userId: string, userData: {
  first_name: string;
  last_name: string;
  email: string;
  role: 'proprietaire' | 'client';
}) => {
  try {
    const { error } = await supabase.functions.invoke("create_profile", {
      body: { 
        user_id: userId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        role: userData.role
      }
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error setting up profile:", error);
    toast.error("Erreur lors de la création du profil");
    return { success: false, error };
  }
};
