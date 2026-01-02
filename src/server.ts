import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectCloudinary from "./libs/utils/cloudinary";

mongoose
  .connect(process.env.DB_URI as string)
  .then(() => {
    console.log("\nDB connceted successfully!\n");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`App is running on: http://localhost:${PORT}`);
      console.log(`Admin Dashboard is on: http://localhost:${PORT}/admin`);
    });
  })
  .catch((e) => {
    console.log("Error in DB connection: ", e);
  });

connectCloudinary()
  .then(() => {
    console.log("\n☁️ -Cloudinary connected successfully");
  })
  .catch((e) => {
    console.log("Error in Cloudinary connection!: ", e.message);
  });
