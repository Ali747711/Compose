import { Types } from "mongoose";

export interface Address {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  label: string;
  city: string;
  street: string;
  state: string;
  zipcode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressInput {
  userId: Types.ObjectId;
  label: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  isDefault?: boolean;
}

export interface AddressUpdateInput {
  _id: Types.ObjectId;
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  isDefault?: boolean;
}
