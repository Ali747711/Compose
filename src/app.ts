import express, { urlencoded } from "express";
import morgan, { format } from "morgan";
import path from "path";
import cookieParser from "cookie-parser";
import { MORGAN_FOMRAT } from "./libs/configs";
import userRouter from "./routes/user.route";
import orderRouter from "./routes/order.route";
import productRouter from "./routes/product.route";
import viewRouter from "./routes/view.route";
import addressRouter from "./routes/address.route";
import paymentRouter from "./routes/payment.route";

// PORT and APP declaration
const app = express();

// Middlewares

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(morgan(MORGAN_FOMRAT));
// app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static("public"));
app.use(cookieParser());

// Session setting

// EJS setting
app.set("view engine", "EJS");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/user", userRouter);
app.use("/order", orderRouter);
app.use("/product", productRouter);
app.use("/view", viewRouter);
app.use("/address", addressRouter);
app.use("/payment", paymentRouter);
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
