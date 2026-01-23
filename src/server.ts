import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectCloudinary from "./libs/utils/cloudinary";
import { createServer } from "http";
import SocketServer from "./socket/socket.server";

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
let socketServer: SocketServer;

mongoose
  .connect(process.env.DB_URI as string)
  .then(() => {
    console.log("\nDB connected successfully!\n");

    const PORT = process.env.PORT || 3003;

    // Start HTTP server (instead of app.listen)
    httpServer.listen(PORT, () => {
      console.log(`App is running on: http://localhost:${PORT}`);
      console.log(`Admin Dashboard is on: http://localhost:${PORT}/admin`);

      // Initialize Socket server
      socketServer = new SocketServer(httpServer);
      console.log(`Socket.io server initialized`);
    });
  })
  .catch((e) => {
    console.log("Error in DB connection: ", e);
  });

connectCloudinary()
  .then(() => {
    console.log("\nCloudinary connected successfully");
  })
  .catch((e) => {
    console.log("Error in Cloudinary connection!: ", e.message);
  });

// Export for potential use
export { socketServer };
