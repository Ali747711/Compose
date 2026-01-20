import { Response } from "express";
import { AdminRequest } from "../libs/types/admin";
import AdminService from "../services/admin.service";
import { UserStatus } from "../libs/enums/user.enum";
import { OrderStatus } from "../libs/enums/order.enum";
import {
  ProductStatus,
  ProductCollection,
  ProductSize,
  ProductVolume,
} from "../libs/enums/product.enum";
import { uploader } from "../libs/utils/uploadToCloudinary";

const adminService = new AdminService();

interface AdminController {
  [key: string]: any;
}

const adminController: AdminController = {};

// ============ LOGIN/LOGOUT ============
adminController.getLoginPage = async (req: AdminRequest, res: Response) => {
  const error = req.query.error as string;
  const success = req.query.success as string;
  const adminExists = await adminService.checkAdminExists();
  res.render("admin/login", {
    error,
    success,
    title: "Admin Login",
    adminExists,
  });
};

adminController.getSignupPage = async (req: AdminRequest, res: Response) => {
  const adminExists = await adminService.checkAdminExists();
  if (adminExists) {
    return res.redirect("/admin/login?error=admin_exists");
  }
  const error = req.query.error as string;
  res.render("admin/signup", { error, title: "Create Admin Account" });
};

adminController.processSignup = async (req: AdminRequest, res: Response) => {
  try {
    console.log("Admin controller, [processSignup] --------");
    const input = req.body;

    // Handle image upload
    if (req.file) {
      const result: any = await uploader(req.file, "users");
      input.userImage = result.secure_url;
    } else {
      input.userImage =
        "https://res.cloudinary.com/dmenptrzv/image/upload/v1767322700/users/akw9yyu4atuaunmchip8.png";
    }

    await adminService.adminSignup(input);

    // Redirect to login page after successful signup
    res.redirect("/admin/login?success=account_created");
  } catch (error: any) {
    console.log("Admin controller, [processSignup] Error:", error);
    res.redirect("/admin/signup?error=signup_failed");
  }
};

adminController.processLogin = async (req: AdminRequest, res: Response) => {
  try {
    console.log("Admin controller, [processLogin] --------");
    const { userNick, userPassword } = req.body;
    console.log("Login attempt for user:", userNick);

    const user = await adminService.adminLogin({ userNick, userPassword });
    console.log("Admin User Data: ", user);
    console.log("Admin service returned user:", user.userNick);

    // Set session
    req.session.user = {
      _id: user._id.toString(),
      userType: user.userType,
      userStatus: user.userStatus,
      userNick: user.userNick,
      userPhone: user.userPhone,
      userEmail: user.userEmail,
      userImage: user.userImage,
      userPoints: user.userPoints,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    req.session.isAdmin = true;

    // Save session before redirect to ensure it's stored
    req.session.save(() => {
      // if (err) {
      //   console.log("Session save error:", err);
      //   return res.redirect("/admin/login?error=session_error");
      // }
      console.log("Session saved successfully, redirecting to dashboard");
      console.log("SESSION DATA: ", req.session);
      res.redirect("/admin/dashboard");
    });
  } catch (error: any) {
    console.log(
      "Admin controller, [processLogin] Error:",
      error.message || error,
    );
    res.redirect("/admin/login?error=invalid_credentials");
  }
};

adminController.logout = (req: AdminRequest, res: Response) => {
  req.session.destroy((err) => {
    if (err) console.error("Session destroy error:", err);
    res.redirect("/admin/login");
  });
};

// ============ DASHBOARD ============
adminController.getDashboard = async (req: AdminRequest, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.render("admin/dashboard", {
      title: "Dashboard",
      user: req.session.user,
      stats,
      activePage: "dashboard",
      error: null,
    });
  } catch (error) {
    console.log("Admin controller, [getDashboard] Error:", error);
    res.render("admin/dashboard", {
      title: "Dashboard",
      user: req.session.user,
      stats: null,
      error: "Failed to load dashboard stats",
      activePage: "dashboard",
    });
  }
};

// ============ PRODUCTS ============
adminController.getProducts = async (req: AdminRequest, res: Response) => {
  try {
    const { status, collection, search, page = 1 } = req.query;
    const products = await adminService.getAllProductsAdmin({
      status: status as string,
      collection: collection as string,
      search: search as string,
      page: Number(page),
      limit: 20,
    });

    res.render("admin/products/index", {
      title: "Products",
      user: req.session.user,
      products,
      filters: { status, collection, search },
      collections: Object.values(ProductCollection),
      statuses: Object.values(ProductStatus),
      activePage: "products",
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.log("Admin controller, [getProducts] Error:", error);
    res.render("admin/products/index", {
      title: "Products",
      user: req.session.user,
      products: { data: [], total: 0, pages: 0, currentPage: 1 },
      filters: {},
      collections: Object.values(ProductCollection),
      statuses: Object.values(ProductStatus),
      error: "Failed to load products",
      activePage: "products",
    });
  }
};

adminController.getCreateProduct = (req: AdminRequest, res: Response) => {
  res.render("admin/products/create", {
    title: "Create Product",
    user: req.session.user,
    collections: Object.values(ProductCollection),
    sizes: Object.values(ProductSize),
    volumes: Object.values(ProductVolume),
    activePage: "products",
    error: req.query.error,
  });
};

adminController.createProduct = async (req: AdminRequest, res: Response) => {
  try {
    const input = req.body;

    // Parse numeric fields
    input.productPrice = Number(input.productPrice);
    input.productLeftCount = Number(input.productLeftCount);
    if (input.productVolume) {
      input.productVolume = Number(input.productVolume);
    }

    // Handle image uploads to Cloudinary
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const result: any = await uploader(file, "products");
          return result.secure_url;
        }),
      );
      input.productImages = imageUrls;
    }

    await adminService.createProduct(input);
    res.redirect("/admin/products?success=created");
  } catch (error) {
    console.log("Admin controller, [createProduct] Error:", error);
    res.redirect("/admin/products/create?error=create_failed");
  }
};

adminController.getEditProduct = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await adminService.getProductById(id);

    res.render("admin/products/edit", {
      title: "Edit Product",
      user: req.session.user,
      product,
      collections: Object.values(ProductCollection),
      sizes: Object.values(ProductSize),
      volumes: Object.values(ProductVolume),
      statuses: Object.values(ProductStatus),
      activePage: "products",
      error: req.query.error,
    });
  } catch (error) {
    console.log("Admin controller, [getEditProduct] Error:", error);
    res.redirect("/admin/products?error=not_found");
  }
};

adminController.updateProduct = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const input: any = { ...req.body, _id: id };

    // Parse numeric fields
    input.productPrice = Number(input.productPrice);
    input.productLeftCount = Number(input.productLeftCount);
    if (input.productVolume) {
      input.productVolume = Number(input.productVolume);
    }

    // Handle new image uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const result: any = await uploader(file, "products");
          return result.secure_url;
        }),
      );
      // Append new images to existing ones
      const existingImages = input.existingImages
        ? Array.isArray(input.existingImages)
          ? input.existingImages
          : [input.existingImages]
        : [];
      input.productImages = [...existingImages, ...imageUrls];
    } else if (input.existingImages) {
      input.productImages = Array.isArray(input.existingImages)
        ? input.existingImages
        : [input.existingImages];
    }

    delete input.existingImages;

    await adminService.updateProduct(input);
    res.redirect("/admin/products?success=updated");
  } catch (error) {
    console.log("Admin controller, [updateProduct] Error:", error);
    res.redirect(`/admin/products/${req.params.id}/edit?error=update_failed`);
  }
};

adminController.deleteProduct = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    await adminService.deleteProduct(id);
    res.redirect("/admin/products?success=deleted");
  } catch (error) {
    console.log("Admin controller, [deleteProduct] Error:", error);
    res.redirect("/admin/products?error=delete_failed");
  }
};

adminController.updateProductStatus = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await adminService.updateProductStatus(id, status as ProductStatus);

    // If AJAX request, return JSON
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.json({ success: true });
    }
    res.redirect("/admin/products");
  } catch (error) {
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(500).json({ success: false, error: "Update failed" });
    }
    res.redirect("/admin/products?error=status_update_failed");
  }
};

// ============ ORDERS ============
adminController.getOrders = async (req: AdminRequest, res: Response) => {
  try {
    const { status, page = 1 } = req.query;
    const orders = await adminService.getAllOrders({
      status: status as string,
      page: Number(page),
      limit: 20,
    });

    res.render("admin/orders/index", {
      title: "Orders",
      user: req.session.user,
      orders,
      filters: { status },
      statuses: Object.values(OrderStatus),
      activePage: "orders",
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.log("Admin controller, [getOrders] Error:", error);
    res.render("admin/orders/index", {
      title: "Orders",
      user: req.session.user,
      orders: { data: [], total: 0, pages: 0, currentPage: 1 },
      filters: {},
      statuses: Object.values(OrderStatus),
      error: "Failed to load orders",
      activePage: "orders",
    });
  }
};

adminController.getOrderDetail = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await adminService.getOrderDetail(id);

    res.render("admin/orders/detail", {
      title: `Order #${id.slice(-6).toUpperCase()}`,
      user: req.session.user,
      order,
      statuses: Object.values(OrderStatus),
      activePage: "orders",
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.log("Admin controller, [getOrderDetail] Error:", error);
    res.redirect("/admin/orders?error=not_found");
  }
};

adminController.updateOrderStatus = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await adminService.updateOrderStatus(id, status as OrderStatus);

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.json({ success: true });
    }
    res.redirect(`/admin/orders/${id}?success=updated`);
  } catch (error) {
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(500).json({ success: false, error: "Update failed" });
    }
    res.redirect(`/admin/orders/${req.params.id}?error=status_update_failed`);
  }
};

// ============ USERS ============
adminController.getUsers = async (req: AdminRequest, res: Response) => {
  try {
    const { status, search, page = 1 } = req.query;
    const users = await adminService.getAllUsers({
      status: status as string,
      search: search as string,
      page: Number(page),
      limit: 20,
    });

    res.render("admin/users/index", {
      title: "Users",
      user: req.session.user,
      users,
      filters: { status, search },
      statuses: Object.values(UserStatus),
      activePage: "users",
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.log("Admin controller, [getUsers] Error:", error);
    res.render("admin/users/index", {
      title: "Users",
      user: req.session.user,
      users: { data: [], total: 0, pages: 0, currentPage: 1 },
      filters: {},
      statuses: Object.values(UserStatus),
      error: "Failed to load users",
      activePage: "users",
    });
  }
};

adminController.getUserDetail = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userData = await adminService.getUserDetail(id);

    res.render("admin/users/detail", {
      title: `User: ${userData.userNick}`,
      user: req.session.user,
      userData,
      statuses: Object.values(UserStatus),
      activePage: "users",
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.log("Admin controller, [getUserDetail] Error:", error);
    res.redirect("/admin/users?error=not_found");
  }
};

adminController.updateUserStatus = async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await adminService.updateUserStatus(id, status as UserStatus);

    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.json({ success: true });
    }
    res.redirect(`/admin/users/${id}?success=updated`);
  } catch (error) {
    if (req.xhr || req.headers.accept?.includes("application/json")) {
      return res.status(500).json({ success: false, error: "Update failed" });
    }
    res.redirect(`/admin/users/${req.params.id}?error=status_update_failed`);
  }
};

// ============ API ENDPOINTS ============
adminController.getStats = async (req: AdminRequest, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export default adminController;
