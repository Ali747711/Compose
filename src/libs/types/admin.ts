import { Request } from "express";
import { Session } from "express-session";
import { SessionUser } from "./user";
import { Product } from "./product";
import { Order } from "./order";

// Extend express-session types
declare module "express-session" {
  interface SessionData {
    user: SessionUser;
    isAdmin: boolean;
  }
}

export interface AdminRequest extends Request {
  admin?: SessionUser;
  session: Session & {
    user?: SessionUser;
    isAdmin?: boolean;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Order[];
  ordersByStatus: {
    pause: number;
    process: number;
    finish: number;
  };
  topProducts: Product[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface AdminProductInquiry {
  status?: string;
  collection?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface AdminOrderInquiry {
  status?: string;
  page: number;
  limit: number;
}

export interface AdminUserInquiry {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}
