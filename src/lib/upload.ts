
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
    const uploadPromises = files.map(async (file) => {
      // Create a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;
      
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    });
    
    // Wait for all uploads to complete
    return await Promise.all(uploadPromises);
    
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
    
    // Remove files
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);
    
    if (error) {
      console.error('Error removing files:', error);
      throw error;
    }
    
    return data?.map(d => d.name) || [];
    
  } catch (error) {
    console.error('Error in removeFiles:', error);
    throw error;
  }
};
