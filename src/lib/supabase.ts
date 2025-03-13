
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
