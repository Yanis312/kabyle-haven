import { supabase } from "@/integrations/supabase/client";

/**
 * Creates storage policies for a bucket to make it accessible
 * @param bucketName The name of the bucket to set policies for
 */
export const createStoragePolicies = async (bucketName: string): Promise<void> => {
  try {
    console.log(`Setting up storage bucket: ${bucketName}`);
    
    // Get the current session to check authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("Current session:", sessionData?.session ? "User authenticated" : "No session", sessionError);
    
    // First check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw bucketsError;
    }
    
    console.log("All buckets:", buckets?.map(b => b.name) || []);
    const bucketExists = buckets?.some(b => b.name === bucketName);
    console.log("Bucket exists?", bucketExists);
    
    if (!bucketExists) {
      console.log("Attempting to create bucket:", bucketName);
      console.log("User role:", sessionData?.session?.user?.user_metadata?.role);
      console.log("User id:", sessionData?.session?.user?.id);
      
      // Create the bucket if it doesn't exist
      try {
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,  // Make bucket public
          fileSizeLimit: 10485760, // 10MB limit
        });
        
        if (createError) {
          console.error("Error creating bucket:", createError);
          console.error("Error message:", createError.message);
          throw createError;
        }
        
        console.log("Bucket creation response:", data);
      } catch (createCatchError) {
        console.error("Caught exception creating bucket:", createCatchError);
      }
    } else {
      console.log(`Bucket ${bucketName} already exists`);
      
      // Update bucket to ensure it's public
      try {
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        });
        
        if (updateError) {
          console.error("Error updating bucket:", updateError);
        } else {
          console.log(`Bucket ${bucketName} updated to be public`);
        }
      } catch (updateError) {
        console.error("Error updating bucket:", updateError);
      }
    }
    
    // Check bucket permissions by trying to list files
    try {
      console.log(`Checking bucket ${bucketName} permissions...`);
      const { data: listData, error: listError } = await supabase.storage.from(bucketName).list();
      console.log(`List result for ${bucketName}:`, listData || []);
      
      if (listError) {
        console.error(`List error for ${bucketName}:`, listError);
      }
    } catch (listCatchError) {
      console.error(`Error listing files in bucket ${bucketName}:`, listCatchError);
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
