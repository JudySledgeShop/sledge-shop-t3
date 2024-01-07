import type { DetailedProductFull } from "~/types";

import AttributeFilter from "~/components/core/category/attribute-filter";

import MobileFilters from "~/components/core/category/mobile-filters";

import NoResults from "~/components/core/ui/no-results";
import ProductCard from "~/components/core/ui/product-card";

import { useSearchParams } from "next/navigation";
import StorefrontLayout from "~/layouts/StorefrontLayout";
import { api } from "~/utils/api";

const AllProductsPage = () => {
  const searchParams = useSearchParams();

  const { data: products } = api.products.getAllStoreProducts.useQuery({
    queryString: searchParams.toString(),
  });

  const { data: attributes } =
    api.categories.getAllStoreCategoryAttributes.useQuery();

  return (
    <StorefrontLayout>
      {" "}
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-x-8">
          {attributes && <MobileFilters data={attributes} />}
          <div className="hidden lg:block">
            {" "}
            <div className="text-md max-w-xs py-8 font-bold sm:max-w-xl sm:text-xl lg:text-2xl">
              Filters
            </div>
            {attributes?.map((attribute, idx) => (
              <AttributeFilter
                key={idx}
                valueKey={`${attribute.name.toLowerCase()}Variant`}
                data={attribute}
              />
            ))}
          </div>
          <div className="mt-6 lg:col-span-4 lg:mt-0">
            <div className="max-w-xs py-8  text-3xl font-bold sm:max-w-xl sm:text-5xl lg:text-6xl">
              All Products
            </div>

            {products?.length === 0 && <NoResults />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {products?.map((item: DetailedProductFull) => (
                <ProductCard key={item.id} data={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default AllProductsPage;
