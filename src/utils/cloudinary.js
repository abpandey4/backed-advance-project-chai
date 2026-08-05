 import {v2 as cloudinary} from "cloudinary"
 import fs from "fs"                        // fs is file system 
  
 cloudinary.config({ 
        cloud_name: process.env.CLOUINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
 });

 const uploadOnCloudinary = async (localFilePath) => {

    try{
        if(!localFilePath) return null

            // upload file on cloudinary

            const response = await cloudinary.uploader.upload
            (loaclFilePath,{
                resource_type: "auto"
            })
            
             // file has been uploaded successfully

            console.log("file is uploaded on cloudinary", response.url)
            return response;
    }catch(error){
        fs.unlinkSync(localFilePath)    // remove the locally saved temp file as the upload operation failed
        return null 
    }
 }

 export default uploadOnCloudinary;