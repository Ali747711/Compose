import { Router } from "express";
import adminController from "../controllers/admin.controller";
import {
  verifyAdmin,
  redirectIfAuthenticated,
} from "../middlewares/admin.middleware";
import { upload } from "../libs/utils/multer";

const adminRouter = Router();

// ============ PUBLIC ROUTES (No Auth) ============
adminRouter.get(
  "/login",
  redirectIfAuthenticated,
  adminController.getLoginPage,
);
adminRouter.post("/login", adminController.processLogin);
adminRouter.get("/signup", adminController.getSignupPage);
adminRouter.post(
  "/signup",
  upload.single("userImage"),
  adminController.processSignup,
);
adminRouter.get("/logout", adminController.logout);

// ============ PROTECTED ROUTES (Admin Auth Required) ============
// Dashboard
adminRouter.get("/", verifyAdmin, adminController.getDashboard);
adminRouter.get("/dashboard", verifyAdmin, adminController.getDashboard);

// Products
adminRouter.get("/products", verifyAdmin, adminController.getProducts);
adminRouter.get(
  "/products/create",
  verifyAdmin,
  adminController.getCreateProduct,
);
adminRouter.post(
  "/products/create",
  verifyAdmin,
  upload.array("productImages", 5),
  adminController.createProduct,
);
adminRouter.get(
  "/products/:id/edit",
  verifyAdmin,
  adminController.getEditProduct,
);
adminRouter.post(
  "/products/:id/update",
  verifyAdmin,
  upload.array("productImages", 5),
  adminController.updateProduct,
);
adminRouter.post(
  "/products/:id/delete",
  verifyAdmin,
  adminController.deleteProduct,
);
adminRouter.post(
  "/products/:id/status",
  verifyAdmin,
  adminController.updateProductStatus,
);

// Orders
adminRouter.get("/orders", verifyAdmin, adminController.getOrders);
adminRouter.get("/orders/:id", verifyAdmin, adminController.getOrderDetail);
adminRouter.post(
  "/orders/:id/status",
  verifyAdmin,
  adminController.updateOrderStatus,
);

// Users
adminRouter.get("/users", verifyAdmin, adminController.getUsers);
adminRouter.get("/users/:id", verifyAdmin, adminController.getUserDetail);
adminRouter.post(
  "/users/:id/status",
  verifyAdmin,
  adminController.updateUserStatus,
);

// Messages
adminRouter.get("/messages", verifyAdmin, adminController.getMessages);
adminRouter.get("/messages/:id", verifyAdmin, adminController.getMessageDetail);
adminRouter.post("/messages/send", verifyAdmin, adminController.sendMessage);
adminRouter.post("/messages/:id/status", verifyAdmin, adminController.updateConversationStatus);

// API endpoints for AJAX calls
adminRouter.get("/api/stats", verifyAdmin, adminController.getStats);

export default adminRouter;
