import { Response, Request } from "express";
import { P } from "../libs/types/common";
import ProductService from "../services/product.service";
import Errors, { HttpCode } from "../libs/Errors";
import { ProductInquiry } from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enum";
import { ExtendedRequest } from "../libs/types/user";

const productService = new ProductService();
const productController: P = {};

productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("Product controller, [getProducts] ------");
    const { page, order, limit, productCollection, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }
    if (search) {
      inquiry.search = String(search);
    }

    const result = await productService.getProducts(inquiry);
    console.log("Product controller, [getProducts] result: ", result);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Product controller, [getProducts] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};
productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Product controller, [getProduct] ------");
    const userId = req.user._id;
    const { id } = req.params;

    const result = await productService.getProduct(userId, id);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Product controller, [getProduct] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default productController;
