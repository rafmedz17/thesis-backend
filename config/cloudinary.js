const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thesis-pdfs', // Folder name in Cloudinary
    format: async (req, file) => 'pdf', // Force PDF format
    public_id: (req, file) => {
      // Generate unique filename (include .pdf extension)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `thesis-${uniqueSuffix}`;
    },
    resource_type: 'raw', // For non-image files like PDFs
    access_mode: 'public', // Allow public access to uploaded files
  },
});

module.exports = { cloudinary, storage };
