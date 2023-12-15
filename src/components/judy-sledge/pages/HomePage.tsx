import type { FC } from "react";

import getProducts from "~/actions/core/get-products";

import { Product } from "@prisma/client";
import Image from "next/image";
import ProductList from "~/components/core/product/product-list";
import Billboard from "~/components/core/ui/billboard";
import Featured from "~/components/judy-sledge/homepage/featured";
import Hero from "~/components/judy-sledge/homepage/hero";
import StorefrontLayout from "~/layouts/judy-sledge/StorefrontLayout";
import { api } from "~/utils/api";

const HomePage = () => {
  const { data: products } = api.products.getAllProducts.useQuery({
    isFeatured: true,
  });
  const { data: collections } = api.collections.getAllCollections.useQuery({
    isFeatured: true,
  });
  return (
    <StorefrontLayout>
      <Hero />
      <div className="mx-auto flex w-full  justify-between gap-x-11 bg-primary/5 pb-48 pt-24">
        <div className=" mx-auto flex h-96 w-full max-w-6xl flex-col justify-center">
          <h2 className=" text-6xl font-bold text-primary">
            A Style For Every Occasion,{" "}
            <span className="text-accent">Express</span> Yourself.
          </h2>
          <h3 className="text-default my-3 py-5 text-2xl font-normal">
            Lorem excepteur enim enim eu minim amet. Dolor consectetur proident
            occaecat id sunt ex ex eu. Amet esse ipsum irure eu mollit dolor sit
            quis. Sit cupidatat quis et anim mollit sint. Anim duis dolore irure
            veniam culpa consequat cillum fugiat. Proident mollit dolor
            adipisicing nostrud dolore ullamco aliqua dolore.
          </h3>
          <button className="w-fit  border-b-2 border-transparent text-left text-2xl font-bold text-accent/75 transition ease-linear hover:border-b-accent">
            Check Out The Collections →
          </button>
        </div>
      </div>
      <Featured items={products ?? []} collections={collections ?? []} />
      <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-x-11 py-28">
        <div className="mb-10 flex flex-row items-center">
          <div className="flex w-2/5 flex-col">
            <h3 className="text-xl font-extrabold tracking-tight text-accent  ">
              About
            </h3>
            <h2 className="text-5xl font-extrabold tracking-tight text-primary sm:text-[5rem]">
              Nice to Meet You
            </h2>
          </div>
          <div className="w-3/5">
            <p className="py-5 text-lg text-primary">
              Lorem excepteur enim enim eu minim amet. Dolor consectetur
              proident occaecat id sunt ex ex eu. Amet esse ipsum irure eu
              mollit dolor sit quis. Sit cupidatat quis et anim mollit sint. Et
              veniam consectetur Lorem tempor tempor id reprehenderit irure
              adipisicing veniam irure eiusmod dolore.
            </p>
          </div>{" "}
        </div>
        <div className=" relative aspect-video w-full">
          <Image
            layout="fill"
            src="/judy-sledge/about_stock.png"
            alt="hero"
            objectFit="cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded"
          />
        </div>
      </div>{" "}
      <div className="mx-auto flex w-full max-w-6xl flex-row items-center  justify-between  gap-12 px-4 pb-16">
        <div className=" relative aspect-video w-2/6">
          <Image
            layout="fill"
            src="/judy-sledge/sledge_logo.png"
            alt="hero"
            objectFit="contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded"
          />
        </div>{" "}
        <div className="w-4/6">
          <p>
            Duis duis do nulla sunt dolore non aute esse pariatur commodo id.
            Amet duis aute cillum id eiusmod reprehenderit. Sunt voluptate
            proident cillum voluptate nisi sunt velit veniam mollit. In officia
            eiusmod laborum ea labore aute deserunt aliqua commodo deserunt
            laboris aliqua. Nostrud qui voluptate velit labore nostrud est esse
            Lorem velit magna. Sint nulla consequat enim excepteur excepteur
            aliquip culpa sit tempor fugiat aute cupidatat.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
        <ProductList title="Featured Products" items={products ?? []} />
      </div>
    </StorefrontLayout>
  );
};

export default HomePage;
