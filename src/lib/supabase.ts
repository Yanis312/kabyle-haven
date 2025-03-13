
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
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }
    }
    
    // Now the bucket should exist and have the proper policies from our SQL migration
    console.log(`Bucket ${bucketName} exists and should have the proper policies`);
    
    return;
  } catch (error) {
    console.error('Error in createStoragePolicies:', error);
    throw error;
  }
};
