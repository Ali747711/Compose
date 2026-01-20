import { Response, NextFunction } from "express";
import { AdminRequest } from "../libs/types/admin";
import { UserType } from "../libs/enums/user.enum";

export const verifyAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("Admin middleware, [verifyAdmin] --------");
    console.log("Admin IN SESSION: ", req.session);

    // Check if session exists and has admin user
    if (!req.session || !req.session.user) {
      return res.redirect("/admin/login");
    }

    // Verify user is admin
    if (req.session.user.userType !== UserType.ADMIN) {
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });
      return res.redirect("/admin/login?error=unauthorized");
    }

    next();
  } catch (error) {
    console.log("Admin middleware, [verifyAdmin] Error:", error);
    res.redirect("/admin/login?error=session_error");
  }
};

// Middleware to check if already logged in (for login page)
export const redirectIfAuthenticated = (
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.session && req.session.user && req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }
  next();
};
