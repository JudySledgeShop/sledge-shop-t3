/* eslint-disable @next/next/no-img-element */

import type { Product } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { FC } from "react";
import type Stripe from "stripe";
import ProductList from "~/components/judy-sledge/product-list";
import { DetailedCollection, DetailedProductFull } from "~/types";

interface IProps {
  items: DetailedProductFull[];
  collections: DetailedCollection[];
}
const Featured: FC<IProps> = ({ items, collections }) => {
  return (
    <div className="mx-auto flex w-full flex-col justify-between gap-x-11  ">
      <div className="mx-auto flex w-full max-w-6xl  flex-col justify-between gap-x-11 ">
        <div className="relative z-0 grid grid-flow-col grid-cols-3 grid-rows-2 gap-8">
          <div className="absolute left-1/3 top-1/2 z-10 w-full  translate-x-24 translate-y-4">
            <div className="z-0  w-1/2 rounded-lg bg-opacity-50 bg-gradient-to-r from-sledge-primary/75 from-60% to-transparent px-2 py-5">
              <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
                Products
              </h2>

              <button className="mt-2.5  border-b-2 border-transparent text-2xl font-bold text-white/75 transition ease-linear hover:border-b-white hover:text-white">
                View All →
              </button>
            </div>
          </div>
          <div className="-rotate-6 scale-110 transform">
            <img
              src={items[0]?.images[0]?.url ?? "/judy-sledge/stock_3.png"}
              alt=""
              loading="lazy"
              className="aspect-square rounded-xl object-cover shadow"
              sizes="100%"
            />
          </div>
          <div className="translate-y-15 z-10 col-start-3 translate-x-2 rotate-6 scale-75 transform">
            <img
              src={items[1]?.images[0]?.url ?? "/judy-sledge/stock_4.png"}
              alt=""
              loading="lazy"
              className="aspect-square rounded-xl object-cover shadow"
              sizes="100%"
            />
          </div>

          <div className="translate-y-11 scale-150 transform">
            <img
              src={items[2]?.images[0]?.url ?? "/judy-sledge/stock_5.png"}
              alt=""
              loading="lazy"
              className="aspect-video rounded-xl object-cover shadow"
              sizes="100%"
            />
          </div>

          <div className="translate-y-24 transform">
            <img
              src={items[3]?.images[0]?.url ?? "/judy-sledge/stock_7.png"}
              alt=""
              loading="lazy"
              className="aspect-square rounded-xl object-cover shadow"
              sizes="100%"
            />
          </div>
          <div className="col-span-2 col-start-2 row-start-1 translate-x-20 translate-y-4 transform">
            <img
              src={items[4]?.images[0]?.url ?? "/judy-sledge/stock_9.png"}
              alt=""
              loading="lazy"
              className="aspect-video rounded-xl object-cover shadow"
              sizes="100%"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-28 flex w-full  max-w-6xl flex-col justify-between gap-x-11">
        <div className="my-5 flex items-stretch gap-x-11">
          <ProductList title="Featured " items={items} subtitle="Products" />
        </div>
      </div>
      <div className="mx-auto  mt-28 flex w-full  max-w-6xl flex-col justify-between gap-x-11">
        <div className="flex  flex-col">
          <h3 className="text-xl font-extrabold tracking-tight text-accent  ">
            Collections
          </h3>
          <h2 className="text-default text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Featured Collections
          </h2>
        </div>

        <div className="my-5 grid grid-cols-2 gap-4">
          {" "}
          <div className="col-span-1 ">
            <div className="relative aspect-[9/12] ">
              <Image
                layout="fill"
                src={
                  collections[0]?.billboard?.imageUrl ??
                  "/judy-sledge/dress_stock.png"
                }
                alt="hero"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded"
              />
              <button className="absolute bottom-0 right-0 m-4 rounded-full border-4 border-white/80 bg-primary p-4  font-extrabold tracking-tight  transition ">
                <span className="sr-only">
                  Go to {collections[0]?.name ?? "Clothing"}
                </span>
                <ArrowUpRight className=" h-8 w-8 text-white" />
              </button>

              <h3 className="absolute left-0 top-0 p-4  text-6xl font-bold tracking-tight text-white">
                {collections[0]?.name ?? "Clothing"}
              </h3>
            </div>
          </div>{" "}
          <div className="col-span-1 grid grid-rows-2 gap-4 ">
            <div className="relative row-span-1 ">
              <Image
                layout="fill"
                src={
                  collections[1]?.billboard?.imageUrl ??
                  "/judy-sledge/art_stock.png"
                }
                alt="hero"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded"
              />
              <button className="absolute bottom-0 right-0 m-4 rounded-full border-4 border-white/80 bg-primary p-4  font-extrabold tracking-tight  transition">
                <span className="sr-only">
                  Go to {collections[1]?.name ?? "Art"}
                </span>
                <ArrowUpRight className="h-8 w-8 text-white" />
              </button>{" "}
              <h3 className="absolute bottom-0 left-0 p-4  text-6xl font-bold tracking-tight text-white">
                {collections[1]?.name ?? "Art"}
              </h3>
            </div>

            <div className="relative row-span-1 ">
              <Image
                layout="fill"
                src={
                  collections[2]?.billboard?.imageUrl ??
                  "/judy-sledge/stock_6.png"
                }
                alt="hero"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded"
              />
              <button className="absolute bottom-0 right-0 m-4 rounded-full border-4 border-white/80 bg-primary p-4  font-extrabold tracking-tight  transition">
                <span className="sr-only">
                  Go to {collections[2]?.name ?? "Home Decor"}
                </span>
                <ArrowUpRight className="h-8 w-8 text-white" />
              </button>{" "}
              <h3 className="right-left absolute bottom-0 p-4  text-6xl font-bold tracking-tight text-white">
                {collections[2]?.name ?? "Home Decor"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Featured;
