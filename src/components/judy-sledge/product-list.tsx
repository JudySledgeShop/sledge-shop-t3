import type { FC } from "react";
import NoResults from "~/components/core/ui/no-results";
import ProductCard from "~/components/core/ui/product-card";
import type { DetailedProductFull } from "~/types";

interface ProductListProps {
  title: string;
  subtitle: string;
  items: DetailedProductFull[];
}

const ProductList: FC<ProductListProps> = ({ title, subtitle, items }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-extrabold tracking-tight text-sledge-primary  ">
          {subtitle}
        </h3>
        <h2 className="text-default1 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          {title}
        </h2>
      </div>
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
