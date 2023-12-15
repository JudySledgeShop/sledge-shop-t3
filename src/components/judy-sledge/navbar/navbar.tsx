import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import getCategories from "~/actions/core/get-categories";
import getCollections from "~/actions/core/get-collections";
import MainNav from "~/components/core/main-nav";
import NavbarActions from "~/components/core/navbar-actions";
import Container from "~/components/core/ui/container";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const Navbar = () => {
  const { data: categories } = api.collections.getAllCollections.useQuery({
    isFeatured: true,
  });

  const { data: collections } = api.collections.getAllCollections.useQuery({
    storeId: env.NEXT_PUBLIC_STORE_ID,
  });

  return (
    <div className="border-b">
      <Container>
        <div className="relative flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="ml-4 flex gap-x-2 lg:ml-0">
            <Image
              src="/judy-sledge/sledge_logo.png"
              alt="hero"
              width={75}
              height={60}
              className="rounded"
            />
          </Link>
          {categories && collections && (
            <MainNav data={categories} collections={collections} />
          )}
          <NavbarActions />
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
