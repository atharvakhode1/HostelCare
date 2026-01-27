const cloudinary = require('./cloudinary');

const uploadToCloudinary = async (fileBuffer, folder = 'hostel-tracker') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto' // Automatically detect file type
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // Return the URL
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

module.exports = uploadToCloudinary;