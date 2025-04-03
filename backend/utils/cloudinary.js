const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const { response } = require('express');
const fs = require('fs')


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


 const uploadOnCloudinary = async (filePath) => {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(filePath, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url); // Return the secure URL of the uploaded image
      });
    });
  };
module.exports = {uploadOnCloudinary}