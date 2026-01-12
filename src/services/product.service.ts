import { Order } from "./../libs/types/order";
import { ProductStatus } from "../libs/enums/product.enum";
import { P } from "../libs/types/common";
import { Product, ProductInquiry } from "../libs/types/product";
import ProductModel from "../schemas/product.schema";
import { ObjectId } from "mongoose";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./view.service";
import { additionalProductsData, frappeData, productsData } from "../libs/data";

class ProductService {
  private readonly productModel;
  public viewService;
  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  public getProducts = async (inquiry: ProductInquiry): Promise<Product[]> => {
    console.log("Product service, [getProducts] incoming inquiry: ", inquiry);
    const match: P = { productStatus: ProductStatus.PROCESS };
    if (inquiry.productCollection) {
      match.productCollection = inquiry.productCollection;
    }
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") }; // Finds lowercase, UPPERCASE all
    }
    const sort: P =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();
    return result;
  };

  public getAllProducts = async (): Promise<Product[]> => {
    console.log("Product service, [getAllProducts] ----------");
    const result = await this.productModel.find({});
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  };

  public getProduct = async (
    userId: ObjectId | null,
    id: string
  ): Promise<Product> => {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    if (userId) {
      const input: ViewInput = {
        userId: userId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };

      const isExist = await this.viewService.checkViewExist(input);
      console.log("ISEXIST: ", isExist);
      if (!isExist) {
        const view = await this.viewService.insertViewExist(input);
        console.log("View: ", view);
        // increment product view
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: +1 } },
            { new: true }
          )
          .exec();
      }
    }
    return result;
  };

  public create = async (): Promise<Product[]> => {
    const result = await this.productModel.insertMany(frappeData);
    return result;
  };
}

export default ProductService;
