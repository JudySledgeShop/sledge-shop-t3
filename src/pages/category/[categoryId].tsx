import type { GetServerSidePropsContext } from "next";
import type { ParsedUrlQuery } from "querystring";
import type { FC } from "react";
import type { Category, DetailedProductFull, Size, Variation } from "~/types";

import getCategory from "~/actions/core/get-category";

import getProducts from "~/actions/core/get-products";
import getSizes from "~/actions/core/get-sizes";

import AttributeFilter from "~/components/core/category/attribute-filter";

import { useParams, useSearchParams } from "next/navigation";
import MobileFilters from "~/components/core/category/mobile-filters";
import Billboard from "~/components/core/ui/billboard";
import NoResults from "~/components/core/ui/no-results";
import ProductCard from "~/components/core/ui/product-card";
import StorefrontLayout from "~/layouts/StorefrontLayout";
import { api } from "~/utils/api";

interface IProps {
  category: Category;
  products: DetailedProductFull[];
  sizes: Size[];
}

interface Params extends ParsedUrlQuery {
  sizeId: string;
  categoryId: string;
  sizeVariant: string;
}

const CategoryPage: FC<IProps> = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: category } = api.categories.getCategory.useQuery({
    categoryId: params.categoryId as string,
  });

  const { data: products } = api.products.getAllStoreProducts.useQuery({
    categoryId: params.categoryId as string,
    queryString: searchParams.toString(),
  });
  return (
    <StorefrontLayout>
      {category?.billboard && <Billboard data={category.billboard} />}
      {category && (
        <div className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
            <MobileFilters data={category?.attributes} />
            <div className="hidden lg:block">
              {category?.attributes?.map((attribute, idx) => (
                <AttributeFilter
                  key={idx}
                  valueKey={`${attribute.name.toLowerCase()}Variant`}
                  data={attribute}
                />
              ))}
            </div>
            <div className="mt-6 lg:col-span-4 lg:mt-0">
              {products?.length === 0 && <NoResults />}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {products?.map((item: DetailedProductFull) => (
                  <ProductCard key={item.id} data={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </StorefrontLayout>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { sizeId, categoryId } = ctx.query as Params;

  const products = await getProducts({
    categoryId,

    sizeId,
  });

  const sizes = await getSizes();

  const category = await getCategory(categoryId);

  const attributes = category.attributes.map((attribute) =>
    attribute.name.toLowerCase()
  );

  if (Object.keys(ctx.query).length === 1 && ctx.query?.categoryId) {
    return {
      props: {
        products,
        sizes,

        category,
      },
    };
  }

  const variants = products.flatMap((product) => product.variants);

  const filteredProductIds = variants
    .filter((variant) => {
      return attributes.every((attribute) => {
        if (ctx.query?.[`${attribute}Variant`] !== undefined)
          return variant.values.includes(
            ctx.query?.[`${attribute}Variant`] as string
          );
        return true;
      });
    })
    .map((variant: Variation) => variant?.productId);

  const variantProducts = products.filter((product) =>
    filteredProductIds.includes(product.id)
  );

  return {
    props: {
      products: variantProducts,
      sizes,

      category,
    },
  };
};
export default CategoryPage;
