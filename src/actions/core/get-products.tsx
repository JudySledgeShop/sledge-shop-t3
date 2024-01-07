import qs from "query-string";

import type { DetailedProductFull } from "~/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/products`;

interface Query {
  categoryId?: string;
  sizeId?: string;
  collectionId?: string;
  isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<DetailedProductFull[]> => {
  const url = qs.stringifyUrl({
    url: URL,
    query: {
      sizeId: query.sizeId,
      categoryId: query.categoryId,
      isFeatured: query.isFeatured,
      collectionId: query.collectionId,
    },
  });

  const res = await fetch(url);

  return res.json();
};

export default getProducts;
