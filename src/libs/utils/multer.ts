import multer, { diskStorage } from "multer";
import fs from "fs";
import path from "path";

export const upload = multer({
  storage: diskStorage({}),
});
// Ensure uploads folder exists in development
// const uploadDir = "uploads";
// if (process.env.NODE_ENV !== "production" && !fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage =
//   process.env.NODE_ENV === "production"
//     ? multer.memoryStorage() // Production: keep in memory → stream to Cloudinary
//     : diskStorage({
//         destination: (req, file, cb) => {
//           cb(null, uploadDir); // Save to local "uploads/" folder in dev
//         },
//         filename: (req, file, callback) => {
//           const uniqueName =
//             Date.now() +
//             "-" +
//             Math.round(Math.random() * 1e9) +
//             path.extname(file.originalname);
//           callback(null, uniqueName);
//         },
//       });

// export const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
//   fileFilter: (req, file, cb) => {
//     const allowed = /jpeg|jpg|png|webp|gif/;
//     if (allowed.test(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files allowed"));
//     }
//   },
// });
