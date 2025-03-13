
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads multiple files to Supabase Storage
 * @param files Array of files to upload
 * @param bucketName Name of the storage bucket
 * @param path Optional path within the bucket
 * @returns Array of public URLs for the uploaded files
 */
export const uploadFiles = async (
  files: File[],
  bucketName: string,
  path: string = ''
): Promise<string[]> => {
  if (!files.length) return [];
  
  try {
    console.log(`Starting upload of ${files.length} files to bucket: ${bucketName}`);
    
    // Check authentication status
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("Authentication status:", sessionData?.session ? "Authenticated" : "Not authenticated");
    console.log("User ID:", sessionData?.session?.user?.id);
    console.log("Session error:", sessionError);
    
    if (!sessionData?.session) {
      throw new Error("You must be authenticated to upload files");
    }
    
    // The bucket should already exist from our SQL migration
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error checking buckets:', bucketsError);
      throw bucketsError;
    }

    console.log("Available buckets:", buckets);
    
    // Check if the bucket exists
    const bucketExists = buckets.some(b => b.name === bucketName);
    console.log(`Bucket ${bucketName} exists:`, bucketExists);
    
    if (!bucketExists) {
      console.error(`Bucket ${bucketName} does not exist. Please create it first.`);
      throw new Error(`Bucket ${bucketName} does not exist`);
    }
    
    // Check bucket permissions
    console.log(`Checking bucket ${bucketName} permissions...`);
    try {
      const { data: listData, error: listError } = await supabase.storage.from(bucketName).list();
      console.log(`List result for ${bucketName}:`, listData);
      console.log(`List error for ${bucketName}:`, listError);
    } catch (listCatchError) {
      console.error(`Error listing files in bucket ${bucketName}:`, listCatchError);
    }
    
    const uploadPromises = files.map(async (file) => {
      // Create a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      console.log(`Uploading file: ${file.name} as ${filePath}`);
      console.log(`File size: ${file.size} bytes, type: ${file.type}`);
      
      // Upload file with improved error handling
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error('Error uploading file:', error);
          console.error("Error message:", error.message);
          console.error("Error name:", error.name);
          console.error("Error code:", (error as any).code);
          throw error;
        }
        
        console.log('File uploaded successfully:', data);
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        console.log('Public URL:', publicUrlData.publicUrl);
        
        return publicUrlData.publicUrl;
      } catch (uploadError) {
        console.error("Caught upload error:", uploadError);
        throw uploadError;
      }
    });
    
    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(uploadPromises);
    console.log("All files uploaded successfully, returning URLs:", uploadedUrls);
    return uploadedUrls;
    
  } catch (error) {
    console.error('Error in uploadFiles:', error);
    throw error;
  }
};

/**
 * Removes files from Supabase Storage
 * @param urls Array of public URLs to remove
 * @param bucketName Name of the storage bucket
 * @returns Array of removed file paths
 */
export const removeFiles = async (
  urls: string[],
  bucketName: string
): Promise<string[]> => {
  if (!urls.length) return [];
  
  try {
    console.log(`Removing ${urls.length} files from bucket: ${bucketName}`);
    
    // Check authentication status
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Authentication status for delete:", sessionData?.session ? "Authenticated" : "Not authenticated");
    console.log("User ID for delete:", sessionData?.session?.user?.id);
    
    if (!sessionData?.session) {
      throw new Error("You must be authenticated to delete files");
    }
    
    // Extract file paths from public URLs
    const filePaths = urls.map(url => {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // The file path is after the bucket name in the URL path
      const bucketIndex = pathParts.findIndex(part => part === bucketName);
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      return '';
    }).filter(Boolean);
    
    console.log('File paths to remove:', filePaths);
    
    // Remove files with improved error handling
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);
    
    if (error) {
      console.error('Error removing files:', error);
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      throw error;
    }
    
    console.log('Files removed successfully:', data);
    
    return data?.map(d => d.name) || [];
    
  } catch (error) {
    console.error('Error in removeFiles:', error);
    throw error;
  }
};
