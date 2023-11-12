const cloudinary = require("../config/cloudinary.config")
class ImageUploadService {

  /**
   * 
   * @param {File} image Image will be file.
   * @param {String} folder Enter the folder name.
   * @returns {{publicId:String, url:String} | {error:Boolean, message:String}}
   */
    async upload(image, folder) {

        try {
          const result = await cloudinary.uploader.upload(image.filepath, {
            folder,
          });
          if (!result)
            return {
              error: true,
              message: "Failed to upload image, please try again",
            };
          return {
            publicId: result.public_id,
            url: result.url,
          };
        } catch (error) {
          console.log(error);
          throw new Error(error.message);
        }
      }

      /**
       * 
       * @param {String} publicId Enter the publicId
       * @returns {{error:Boolean, message:String}}
       */
      async remove(publicId){
        try {
          const image = await cloudinary.uploader.destroy(publicId)
          if(!image) return {error:true, message:"Error to delete image"}
          return {
            error:false,
            message:"Image deleted successfully"
          }
        } catch (error) {
          throw new Error(error.message)
        }
      }
}

module.exports = new ImageUploadService()