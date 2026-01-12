import { Router } from "express";
import { ProductInput } from "../libs/types/product";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
  ProductVolume,
} from "../libs/enums/product.enum";
import ProductModel from "../schemas/product.schema";
import productController from "../controllers/product.controller";
import userController from "../controllers/user.controller";

const productRouter = Router();
productRouter.get("/products", productController.getProducts);
productRouter.get("/all-products", productController.getAllProducts);
productRouter.get(
  "/product/:id",
  userController.verifyAuth,
  productController.getProduct
);

productRouter.get("/create", productController.create);
export default productRouter;
