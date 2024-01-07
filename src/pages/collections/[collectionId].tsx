import type { GetServerSidePropsContext } from "next";

import type { FC } from "react";

import Breadcrumbs from "~/components/core/category/breadcrumbs";

import NoResults from "~/components/core/ui/no-results";
import ProductCard from "~/components/core/ui/product-card";
import PageLoader from "~/components/ui/page-loader";
import StorefrontLayout from "~/layouts/StorefrontLayout";

import { api } from "~/utils/api";

type ICollectionPageProps = {
  collectionId: string;
};
const CollectionPage: FC<ICollectionPageProps> = ({ collectionId }) => {
  const { data: collection, isLoading: isCollectionLoading } =
    api.collections.getCollection.useQuery({ collectionId });

  const pathway = [
    {
      name: "Collections",
      link: "/collections",
    },
    {
      name: collection?.name ?? "",
    },
  ];
  return (
    <StorefrontLayout>
      <Breadcrumbs pathway={pathway} />
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        {isCollectionLoading ? (
          <PageLoader />
        ) : (
          <div className="mt-6 lg:col-span-4 lg:mt-0">
            {collection?.products.length === 0 && <NoResults />}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {collection?.products.map((item) => (
                <ProductCard key={item.id} data={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default CollectionPage;

export const getServerSideProps = (ctx: GetServerSidePropsContext) => {
  const { collectionId } = ctx.query;

  return {
    props: {
      collectionId,
    },
  };
};
