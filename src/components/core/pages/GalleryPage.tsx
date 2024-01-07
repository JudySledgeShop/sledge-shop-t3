import GalleryCard from "~/components/core/ui/gallery-card";

import StorefrontLayout from "~/layouts/StorefrontLayout";
import { api } from "~/utils/api";

const GalleryPage = () => {
  const { data: products } = api.products.getAllProducts.useQuery({});

  const items = products?.map((product) => product.images[0]?.url) ?? [];

  return (
    <StorefrontLayout>
      <div className="space-y-10 py-10">
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold">Gallery</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, idx) => (
                <GalleryCard key={idx} data={item!} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default GalleryPage;
