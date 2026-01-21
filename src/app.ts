import express, { urlencoded } from "express";
import morgan, { format } from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import { MORGAN_FOMRAT } from "./libs/configs";
import userRouter from "./routes/user.route";
import orderRouter from "./routes/order.route";
import productRouter from "./routes/product.route";
import viewRouter from "./routes/view.route";
import addressRouter from "./routes/address.route";
import paymentRouter from "./routes/payment.route";
import userController from "./controllers/user.controller";
import healthRouter from "./routes/health.route";
import adminRouter from "./routes/admin.route";

// PORT and APP declaration
const app = express();

// Allow multiple origins
const allowedOrigins = [
  "http://localhost:3003",
  "https://compose-3wf7.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://compose-client.vercel.app",
  "https://compose-client-alis-projects-1ef90113.vercel.app",
];
// Middlewares

app.use(express.json());
// CORS with detailed logging
app.use(
  cors({
    origin: function (origin, callback) {
      // ✅ Log every request for debugging
      console.log("=================================");
      console.log("📨 Incoming request from origin:", origin || "NO ORIGIN");
      console.log("✅ Allowed origins:", allowedOrigins);

      // Allow requests with no origin (like mobile apps, Postman, or curl)
      if (!origin) {
        console.log("✅ ALLOWED: No origin (Postman/curl/mobile)");
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        console.log("❌ BLOCKED: Origin not in allowed list");
        console.log("❌ Blocked origin:", origin);
        console.log("❌ Did you mean one of these?");
        allowedOrigins.forEach((allowed) => {
          console.log(`   - ${allowed}`);
        });
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }

      console.log("✅ ALLOWED: Origin matches");
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"], // ✅ Allow frontend to see Set-Cookie header
  }),
);
app.use(urlencoded({ extended: true }));
app.use(morgan(MORGAN_FOMRAT));
// app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static("public"));
app.use(cookieParser());

// Rate limiter settings
app.use(userController.rateLimiter);

// Session configuration for admin panel
const MongoDBSessionStore = MongoDBStore(session);
const sessionStore = new MongoDBSessionStore({
  uri: process.env.DB_URI as string,
  collection: "sessions",
});

sessionStore.on("error", (error) => {
  console.log("Session store error:", error);
});

console.log("Product status: ", process.env.NODE_ENV);

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      // secure: true,
      // sameSite: "none",
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

// EJS setting
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/user", userRouter);
app.use("/order", orderRouter);
app.use("/product", productRouter);
app.use("/view", viewRouter);
app.use("/address", addressRouter);
app.use("/payment", paymentRouter);
app.use("/health", healthRouter);

// Admin panel routes (SSR)
app.use("/admin", adminRouter);

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Error handling
app.use((req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found!" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});
// Export App
export default app;
