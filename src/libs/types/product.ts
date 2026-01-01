import { Types } from "mongoose";
import {
  ProductCollection,
  ProductSize,
  ProductStatus,
  ProductVolume,
} from "../enums/product.enum";

export interface Product {
  _id: Types.ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize: ProductSize;
  productVolume: ProductVolume;
  productDesc: string;
  productImages: string[];
  productViews: number;
  productReviews: string[];
  productRatings: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productSize: ProductSize;
  productVolume?: ProductVolume;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
  productReviews?: string[];
  productRatings?: number[];
}

export interface ProductUpdateInput {
  _id: Types.ObjectId;
  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productSize?: ProductSize;
  productVolume?: ProductVolume;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
  productReviews?: string[];
  productRatings?: number[];
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  search?: string;
  productCollection?: ProductCollection;
}
