import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});
