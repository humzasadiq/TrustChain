const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { DateTime } = require('luxon');
const path = require('path');

// Create a single supabase client for interacting with storage
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder path within the bucket
 * @param {string} newFileName - Optional custom filename, if not provided uses original name
 * @returns {Promise<Object>} - Upload result with file URL
 */
const uploadFile = async (file, bucket = 'car', folder = '', newFileName = null) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Handle file upload from multer 
    const fileBuffer = file.buffer;
    
    // Generate a unique filename if not provided
    const fileName = newFileName || `${DateTime.now().toFormat('yyyyMMddHHmmss')}_${file.originalname}`;
    
    // Build the full path
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype, 
        upsert: false
      });

    if (error) {
      throw new Error(`Error uploading file to Supabase: ${error.message}`);
    }

    // Get signed URL for the uploaded file with a long expiration (30 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days expiration

    if (signedUrlError) {
      throw new Error(`Error creating signed URL: ${signedUrlError.message}`);
    }

    return {
      success: true,
      filePath: filePath,
      publicUrl: signedUrlData.signedUrl,
      data
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - Path to the file in storage
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFile = async (filePath, bucket = 'car-images') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file from Supabase: ${error.message}`);
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('File deletion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadFile,
  deleteFile
}; 