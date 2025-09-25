import { supabase } from '@/lib/supabase-client';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    console.log('🚀 Starting profile image upload...');
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    console.log('👤 User ID:', userId);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      };
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size, 'bytes');
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 5MB.'
      };
    }
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;
    
    console.log('📁 Uploading to path:', filePath);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }
    
    console.log('📤 Upload data:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media-files')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    console.log('✅ Upload successful:', publicUrl);
    
    return {
      success: true,
      url: publicUrl
    };
    
  } catch (error) {
    console.error('❌ Unexpected error during upload:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload.'
    };
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting profile image:', imageUrl);
    
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketName = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1];
    const filePath = `profile-images/${fileName}`;
    
    console.log('📁 Deleting from path:', filePath);
    
    const { error } = await supabase.storage
      .from('media-files')
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
    
    console.log('✅ Image deleted successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during deletion:', error);
    return false;
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.'
    };
  }
  
  return { valid: true };
}
