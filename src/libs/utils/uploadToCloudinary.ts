import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ✅ Support both disk storage (dev) and memory storage (production)
export const uploader = async (file: Express.Multer.File, folder: string) => {
  return new Promise((resolve, reject) => {
    // ✅ Check if file has path (disk storage) or buffer (memory storage)
    if (file.path) {
      // Development: File on disk
      cloudinary.uploader.upload(
        file.path,
        { folder, resource_type: "image" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    } else if (file.buffer) {
      // Production: File in memory
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );

      // Convert buffer to stream
      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    } else {
      reject(new Error("No file data found"));
    }
  });
};
