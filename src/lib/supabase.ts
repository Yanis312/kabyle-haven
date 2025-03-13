
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates storage policies for a bucket to make it accessible
 * @param bucketName The name of the bucket to set policies for
 */
export const createStoragePolicies = async (bucketName: string): Promise<void> => {
  try {
    // First check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw bucketsError;
    }
    
    const bucketExists = buckets.some(b => b.name === bucketName);
    console.log("Bucket exists?", bucketExists);
    
    if (!bucketExists) {
      console.log("Attempting to create bucket:", bucketName);
      
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        throw createError;
      }
      
      console.log("Bucket creation response:", data);

      // Create RLS policies for the new bucket
      await setupBucketPolicies(bucketName);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
      
      // Update bucket to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (updateError) {
        console.error("Error updating bucket:", updateError);
        throw updateError;
      }
      
      console.log(`Bucket ${bucketName} updated to be public`);
    }
    
    return;
  } catch (error) {
    console.error('Error in createStoragePolicies:', error);
    throw error;
  }
};

/**
 * Sets up the RLS policies for a bucket using SQL
 * @param bucketName The name of the bucket to set policies for
 */
const setupBucketPolicies = async (bucketName: string): Promise<void> => {
  try {
    console.log(`Setting up RLS policies for bucket ${bucketName}`);

    // This function uses SQL to set up RLS policies - this will be handled by the SQL migration
    // If needed in the future, you can add SQL functions to update policies
    
    console.log("RLS policies should be set up via migration");
    
  } catch (error) {
    console.error('Error setting up bucket policies:', error);
    throw error;
  }
};
