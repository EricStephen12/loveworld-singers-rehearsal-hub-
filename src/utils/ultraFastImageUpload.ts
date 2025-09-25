import { supabase } from '@/lib/supabase-client';

export interface UltraFastUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  uploadTime?: number;
}

export interface UploadProgress {
  stage: 'compressing' | 'uploading' | 'processing' | 'complete';
  progress: number;
  message: string;
}

// Ultra-fast image compression using Canvas API
function compressImage(file: File, quality: number = 0.8, maxWidth: number = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        'image/webp', // Use WebP for better compression
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
}

// Generate optimized filename
function generateOptimizedFilename(userId: string, originalFile: File): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${userId}-${timestamp}-${randomId}.webp`;
}

// Ultra-fast upload with progress tracking
export async function ultraFastUploadProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UltraFastUploadResult> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting ULTRA-FAST profile image upload...');
    console.log('📁 Original file:', { name: file.name, size: file.size, type: file.type });
    
    // Stage 1: Quick validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      };
    }
    
    const maxSize = 10 * 1024 * 1024; // Increased to 10MB for better quality
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 10MB.'
      };
    }
    
    // Stage 2: Smart compression (only if file is large)
    let processedFile: Blob = file;
    if (file.size > 2 * 1024 * 1024) { // Only compress if > 2MB
      onProgress?.({
        stage: 'compressing',
        progress: 20,
        message: 'Optimizing image...'
      });
      
      console.log('🗜️ Compressing large image...');
      processedFile = await compressImage(file, 0.85, 1200); // Higher quality, larger size
      console.log('✅ Compression complete:', { 
        original: file.size, 
        compressed: processedFile.size,
        reduction: `${Math.round((1 - processedFile.size / file.size) * 100)}%`
      });
    }
    
    // Stage 3: Generate optimized path
    const fileName = generateOptimizedFilename(userId, file);
    const filePath = `profile-images/${fileName}`;
    
    onProgress?.({
      stage: 'uploading',
      progress: 50,
      message: 'Uploading to cloud...'
    });
    
    console.log('📤 Uploading to:', filePath);
    
    // Stage 4: Ultra-fast upload with optimized settings
    const { data, error } = await supabase.storage
      .from('media-files')
      .upload(filePath, processedFile, {
        cacheControl: '31536000', // 1 year cache
        upsert: true, // Allow overwrite for faster retries
        contentType: 'image/webp' // Explicit content type
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      };
    }
    
    onProgress?.({
      stage: 'processing',
      progress: 80,
      message: 'Processing image...'
    });
    
    // Stage 5: Get public URL with CDN optimization
    const { data: urlData } = supabase.storage
      .from('media-files')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    const uploadTime = Date.now() - startTime;
    
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Upload complete!'
    });
    
    console.log('✅ ULTRA-FAST upload successful!', {
      url: publicUrl,
      uploadTime: `${uploadTime}ms`,
      originalSize: file.size,
      finalSize: processedFile.size
    });
    
    return {
      success: true,
      url: publicUrl,
      uploadTime
    };
    
  } catch (error) {
    console.error('❌ Unexpected error during ultra-fast upload:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload.'
    };
  }
}

// Batch upload for multiple images (future use)
export async function batchUploadImages(
  files: File[],
  userId: string,
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UltraFastUploadResult[]> {
  const uploadPromises = files.map(async (file, index) => {
    return ultraFastUploadProfileImage(file, userId, (progress) => {
      onProgress?.(index, progress);
    });
  });
  
  return Promise.all(uploadPromises);
}

// Preload image for instant preview
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to preload image'));
    img.src = url;
  });
}

// Delete with ultra-fast cleanup
export async function ultraFastDeleteImage(imageUrl: string): Promise<boolean> {
  try {
    console.log('🗑️ Ultra-fast image deletion...');
    
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
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
