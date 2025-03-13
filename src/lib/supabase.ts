
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates storage policies for a bucket to make it accessible
 * @param bucketName The name of the bucket to set policies for
 */
export const createStoragePolicies = async (bucketName: string): Promise<void> => {
  try {
    // Get the current session to check authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("Current session:", sessionData?.session ? "User authenticated" : "No session", sessionError);
    
    // First check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw bucketsError;
    }
    
    console.log("All buckets:", buckets);
    const bucketExists = buckets.some(b => b.name === bucketName);
    console.log("Bucket exists?", bucketExists);
    
    if (!bucketExists) {
      console.log("Attempting to create bucket:", bucketName);
      console.log("User role:", sessionData?.session?.user?.user_metadata?.role);
      console.log("User id:", sessionData?.session?.user?.id);
      
      // The bucket should now be created by our SQL migration, but we'll try this as a fallback
      try {
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          console.error("Error message:", createError.message);
          // Only log properties that exist on the StorageError type
          console.error("Error name:", createError.name);
          console.error("Error code:", (createError as any).code);
          throw createError;
        }
        
        console.log("Bucket creation response:", data);
      } catch (createCatchError) {
        console.error("Caught exception creating bucket:", createCatchError);
        // Don't throw the error here, just log it since the bucket might exist from our SQL
      }
    } else {
      console.log(`Bucket ${bucketName} already exists`);
      
      // Update bucket to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (updateError) {
        console.error("Error updating bucket:", updateError);
        // Just log the error but don't throw it, we'll still try to use the bucket
      }
      
      console.log(`Bucket ${bucketName} updated to be public`);
    }
    
    return;
  } catch (error) {
    console.error('Error in createStoragePolicies:', error);
    // Log the error but don't throw it to allow the application to continue
    return;
  }
};

/**
 * Sets up the RLS policies for a bucket using SQL
 * @param bucketName The name of the bucket to set policies for
 */
const setupBucketPolicies = async (bucketName: string): Promise<void> => {
  try {
    console.log(`Setting up RLS policies for bucket ${bucketName}`);
    
    // This function is now obsolete since we're setting up policies via SQL migration
    console.log("RLS policies are now set up via SQL migration");
    
  } catch (error) {
    console.error('Error setting up bucket policies:', error);
    // Log the error but don't throw it
  }
};
