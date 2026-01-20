import bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import { UserType, UserStatus } from "../libs/enums/user.enum";
import { OrderStatus } from "../libs/enums/order.enum";
import {
  ProductStatus,
  ProductCollection,
} from "../libs/enums/product.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { User, UserInput, UserLoginInput } from "../libs/types/user";
import { Product, ProductInput, ProductUpdateInput } from "../libs/types/product";
import { Order } from "../libs/types/order";
import {
  DashboardStats,
  AdminProductInquiry,
  AdminOrderInquiry,
  AdminUserInquiry,
  PaginatedResult,
} from "../libs/types/admin";
import UserModel from "../schemas/user.schema";
import ProductModel from "../schemas/product.schema";
import OrderModel from "../schemas/order.schema";
import OrderItemModel from "../schemas/orderItem.schema";

class AdminService {
  private readonly userModel;
  private readonly productModel;
  private readonly orderModel;
  private readonly orderItemModel;

  constructor() {
    this.userModel = UserModel;
    this.productModel = ProductModel;
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
  }

  // ============ AUTHENTICATION ============
  public async checkAdminExists(): Promise<boolean> {
    const count = await this.userModel.countDocuments({
      userType: UserType.ADMIN,
      userStatus: { $ne: UserStatus.DELETE },
    });
    return count > 0;
  }

  public async adminSignup(input: UserInput): Promise<User> {
    console.log("Admin service, [adminSignup] -----");

    // Check if admin already exists
    const adminExists = await this.checkAdminExists();
    if (adminExists) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }

    // Password hashing
    const salt = await bcrypt.genSalt();
    input.userPassword = await bcrypt.hash(input.userPassword, salt);
    input.userType = UserType.ADMIN;

    try {
      const user = await this.userModel.create(input);
      return user.toJSON();
    } catch (error: any) {
      console.error("Admin service, [adminSignup] Error:", error);
      if (error.code === 11000) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
      }
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async adminLogin(input: UserLoginInput): Promise<User> {
    console.log("Admin service, [adminLogin] -----");

    const user = await this.userModel
      .findOne(
        {
          userNick: input.userNick,
          userType: UserType.ADMIN,
          userStatus: { $ne: UserStatus.DELETE },
        },
        {
          userNick: 1,
          userPassword: 1,
          userStatus: 1,
          userType: 1,
          userEmail: 1,
          userPhone: 1,
          userImage: 1,
          userPoints: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      )
      .exec();

    if (!user) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
    if (user.userStatus === UserStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    const isMatch = await bcrypt.compare(input.userPassword, user.userPassword);
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    return user.toJSON() as User;
  }

  // ============ DASHBOARD ============
  public async getDashboardStats(): Promise<DashboardStats> {
    console.log("Admin service, [getDashboardStats] -----");

    const [
      totalOrders,
      totalRevenueResult,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatusResult,
      topProducts,
      revenueByMonthResult,
    ] = await Promise.all([
      // Total orders (excluding DELETE)
      this.orderModel.countDocuments({
        orderStatus: { $ne: OrderStatus.DELETE },
      }),

      // Total revenue
      this.orderModel.aggregate([
        { $match: { orderStatus: { $ne: OrderStatus.DELETE } } },
        { $group: { _id: null, total: { $sum: "$orderTotal" } } },
      ]),

      // Total users (excluding DELETE)
      this.userModel.countDocuments({
        userStatus: { $ne: UserStatus.DELETE },
        userType: UserType.USER,
      }),

      // Total products (excluding DELETE)
      this.productModel.countDocuments({
        productStatus: { $ne: ProductStatus.DELETE },
      }),

      // Recent 5 orders with user info
      this.orderModel.aggregate([
        { $match: { orderStatus: { $ne: OrderStatus.DELETE } } },
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),

      // Orders by status
      this.orderModel.aggregate([
        { $match: { orderStatus: { $ne: OrderStatus.DELETE } } },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),

      // Top 5 products by views
      this.productModel
        .find({ productStatus: ProductStatus.PROCESS })
        .sort({ productViews: -1 })
        .limit(5),

      // Revenue by month (last 6 months)
      this.orderModel.aggregate([
        { $match: { orderStatus: { $ne: OrderStatus.DELETE } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$orderTotal" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]),
    ]);

    // Format orders by status
    const statusCounts = {
      pause: 0,
      process: 0,
      finish: 0,
    };
    ordersByStatusResult.forEach((item: any) => {
      if (item._id === OrderStatus.PAUSE) statusCounts.pause = item.count;
      if (item._id === OrderStatus.PROCESS) statusCounts.process = item.count;
      if (item._id === OrderStatus.FINISH) statusCounts.finish = item.count;
    });

    // Format revenue by month
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedRevenueByMonth = revenueByMonthResult
      .map((item: any) => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
      }))
      .reverse();

    return {
      totalOrders,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatus: statusCounts,
      topProducts,
      revenueByMonth: formattedRevenueByMonth,
    };
  }

  // ============ PRODUCTS ============
  public async getAllProductsAdmin(
    params: AdminProductInquiry
  ): Promise<PaginatedResult<Product>> {
    const { status, collection, search, page, limit } = params;
    const match: any = { productStatus: { $ne: ProductStatus.DELETE } };

    if (status) match.productStatus = status;
    if (collection) match.productCollection = collection;
    if (search) match.productName = { $regex: new RegExp(search, "i") };

    const [products, total] = await Promise.all([
      this.productModel
        .find(match)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.productModel.countDocuments(match),
    ]);

    return {
      data: products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  public async getProductById(id: string): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    const product = await this.productModel.findById(productId);
    if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return product;
  }

  public async createProduct(input: ProductInput): Promise<Product> {
    console.log("Admin service, [createProduct] -----");
    const product = await this.productModel.create(input);
    return product;
  }

  public async updateProduct(input: ProductUpdateInput): Promise<Product> {
    console.log("Admin service, [updateProduct] -----");
    const productId = shapeIntoMongooseObjectId(input._id);
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      input,
      { new: true }
    );
    if (!product)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return product;
  }

  public async deleteProduct(id: string): Promise<Product> {
    console.log("Admin service, [deleteProduct] -----");
    const productId = shapeIntoMongooseObjectId(id);
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { productStatus: ProductStatus.DELETE },
      { new: true }
    );
    if (!product)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.DELETE_FAILED);
    return product;
  }

  public async updateProductStatus(
    id: string,
    status: ProductStatus
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { productStatus: status },
      { new: true }
    );
    if (!product)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return product;
  }

  // ============ ORDERS ============
  public async getAllOrders(
    params: AdminOrderInquiry
  ): Promise<PaginatedResult<Order>> {
    const { status, page, limit } = params;
    const match: any = { orderStatus: { $ne: OrderStatus.DELETE } };

    if (status) match.orderStatus = status;

    const [orders, total] = await Promise.all([
      this.orderModel.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
      ]),
      this.orderModel.countDocuments(match),
    ]);

    return {
      data: orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  public async getOrderDetail(id: string): Promise<Order> {
    const orderId = shapeIntoMongooseObjectId(id);
    const result = await this.orderModel.aggregate([
      { $match: { _id: orderId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "addresses",
          localField: "orderAddress",
          foreignField: "_id",
          as: "orderAddress",
        },
      },
      { $unwind: { path: "$orderAddress", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "payments",
          localField: "orderPayment",
          foreignField: "_id",
          as: "orderPayment",
        },
      },
      { $unwind: { path: "$orderPayment", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result[0];
  }

  public async updateOrderStatus(
    id: string,
    status: OrderStatus
  ): Promise<Order> {
    const orderId = shapeIntoMongooseObjectId(id);
    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    );
    if (!order) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return order;
  }

  // ============ USERS ============
  public async getAllUsers(
    params: AdminUserInquiry
  ): Promise<PaginatedResult<User>> {
    const { status, search, page, limit } = params;
    const match: any = {
      userStatus: { $ne: UserStatus.DELETE },
      userType: UserType.USER,
    };

    if (status) match.userStatus = status;
    if (search) {
      match.$or = [
        { userNick: { $regex: new RegExp(search, "i") } },
        { userEmail: { $regex: new RegExp(search, "i") } },
        { userPhone: { $regex: new RegExp(search, "i") } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.userModel.countDocuments(match),
    ]);

    return {
      data: users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  public async getUserDetail(id: string): Promise<User> {
    const userId = shapeIntoMongooseObjectId(id);
    const result = await this.userModel.aggregate([
      { $match: { _id: userId, userStatus: { $ne: UserStatus.DELETE } } },
      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "userId",
          as: "userAddresses",
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "userId",
          as: "userPayments",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "userOrders",
        },
      },
    ]);

    if (!result || result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result[0];
  }

  public async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const userId = shapeIntoMongooseObjectId(id);
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { userStatus: status },
      { new: true }
    );
    if (!user) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return user;
  }
}

export default AdminService;
