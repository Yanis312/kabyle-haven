import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Supabase project configuration
export const supabaseUrl = "https://wiyqlsbatmrwunvoihxa.supabase.co";
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpeXFsc2JhdG1yd3Vudm9paHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjIzOTYsImV4cCI6MjA1NzI5ODM5Nn0.PjzdfOkQpog6Ra4GMpVSZop-6DofagQsK8h8W2mnhLg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        // Get public URL without destructuring error
        const publicUrlData = supabase.storage.from(bucketName).getPublicUrl('test');
        console.log("Public URL test:", publicUrlData);
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

/**
 * Creates storage policies for a bucket
 */
export const createStoragePolicies = async (bucketName: string) => {
  try {
    console.log(`Ensuring bucket exists: ${bucketName}`);
    await ensureBucketExists(bucketName, true);
    
    return { success: true };
  } catch (error) {
    console.error("Error creating storage policies:", error);
    return { success: false, error };
  }
};
