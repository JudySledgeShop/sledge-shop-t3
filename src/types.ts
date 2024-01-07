import type { Prisma, Product } from "@prisma/client";

// export interface Product {
//   id: string;
//   category: Category;
//   name: string;
//   price: Prisma.Decimal | number | string;
//   isFeatured: boolean;
//   size?: Size;
//   color?: Color;
//   images: Image[];
//   variants: Variation[];
// }

export interface Image {
  id: string;
  url: string;
}

export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  billboard: Billboard;
  attributes: Attribute[];
}

export interface Size {
  id: string;
  name: string;
  value: string;
}

// export interface Color {
//   id: string;
//   name: string;
//   value: string;
// }

export interface Variation {
  id: string;
  names: string;
  values: string;
  quantity: number;
  price: number;
  productId: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: string;
  quantity?: number;
}

export interface CartItem {
  product: DetailedProductFull;
  variant: Variation | null;
  quantity: number;
}

export interface Collection {
  id: string;
  name: string;
  products: Product[] | Partial<Product>[];
  billboard: Billboard;
}

export type DetailedProduct = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: {
      include: {
        billboard: true;
      };
    };
  };
}>;

export type DetailedProductFull = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    category: {
      include: {
        attributes: true;
      };
    };
  };
}>;

export type DetailedCategory = Prisma.CategoryGetPayload<{
  include: {
    billboard: true;
    attributes: true;
  };
}>;

export type DetailedCollection = Prisma.CollectionGetPayload<{
  include: {
    products: true;
    billboard: true;
  };
}>;

export type Popup = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export type DetailedOrder = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        variant: true;
        product: true;
      };
    };
    shippingLabel: true;
  };
}>;
