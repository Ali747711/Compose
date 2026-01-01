import { Router } from "express";
import { ProductInput } from "../libs/types/product";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
} from "../libs/enums/product.enum";
import ProductModel from "../schemas/product.schema";

const productRouter = Router();
productRouter.get("/", async (req, res) => {
  const input: ProductInput = {
    productStatus: ProductStatus.PROCESS, // assuming ProductStatus enum
    productCollection: ProductCollection.ADE, // assuming ProductCollection: "fruits" | "vegetables" | "juices" etc.
    productName: "Fresh Egyptian Oranges",
    productPrice: 25.99,
    productLeftCount: 150,
    productSize: ProductSize.LARGE, // assuming ProductSize: "small" | "medium" | "large"
    productVolume: undefined, // optional
    productDesc: "Sweet and juicy navel oranges, hand-picked daily.",
    productImages: [
      "https://example.com/images/products/orange1.jpg",
      "https://example.com/images/products/orange2.jpg",
    ],
    productViews: 342,
    productReviews: [],
    productRatings: [],
  };

  const product = await ProductModel.create(input);
  res.json({ product: product });
});
export default productRouter;
