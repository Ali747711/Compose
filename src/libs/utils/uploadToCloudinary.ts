import { v2 as cloudinary } from "cloudinary";

export const uploader = async (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { folder: `${folder}`, resource_type: "image" },
      (err, result) => {
        if (err) return reject(err);
        else resolve(result);
      }
    );
  });
};
// export const uploader = async (file, folder) => {
//   return new Promise((reject, resolve) => {
//     if (process.env.NODE_ENV === "production") {
//       const stream = cloudinary.uploader.upload_stream({
//         folder: `${folder}`,
//         resource_type: "image",
//       });
//       (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       };
//     } else {
//       // Disk storage: upload from file path
//       cloudinary.uploader.upload(
//         file.path,
//         {
//           folder: "uploads/users",
//           resource_type: "image",
//         },
//         (err, result) => {
//           if (err) return reject(err);
//           else {
//             resolve(result);
//           }
//         }
//       );
//     }
//   });
// };
