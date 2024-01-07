import Breadcrumbs from "~/components/core/category/breadcrumbs";
import { CollectionCard } from "~/components/core/category/collection-card";

import NoResults from "~/components/core/ui/no-results";

import PageLoader from "~/components/ui/page-loader";
import StorefrontLayout from "~/layouts/StorefrontLayout";
import type { DetailedCollection } from "~/types";
import { api } from "~/utils/api";

const CollectionPage = () => {
  const { data: collections, isLoading } =
    api.collections.getAllCollections.useQuery({});

  const pathway = [
    {
      name: "Collections",
    },
  ];

  return (
    <StorefrontLayout>
      <Breadcrumbs pathway={pathway} />
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="mt-6 lg:col-span-4 lg:mt-0">
            {collections?.length === 0 && <NoResults />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {collections?.map((item: DetailedCollection) => (
                <CollectionCard
                  key={item.id}
                  collection={item}
                  // aspectRatio="square"
                  // width={150}
                  // height={150}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default CollectionPage;
