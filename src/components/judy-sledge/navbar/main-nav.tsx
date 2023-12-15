import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import type { Category, Collection, DetailedCollection } from "~/types";
import { cn } from "~/utils/styles";

interface MainNavProps {
  data: DetailedCollection[];
  collections: Partial<Collection>[];
}

const MainNav: React.FC<MainNavProps> = ({ data, collections }) => {
  const pathname = usePathname();

  const routes = data.map((route) => ({
    href: `/collections/${route.id}`,
    label: route.name,
    active: pathname === `/collections/${route.id}`,
  }));

  return (
    <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
      <Link
        href={"/collections/all-products"}
        className={cn(
          "text-sm font-medium transition-colors hover:text-black",
          pathname === `/collections/all-products`
            ? "text-black"
            : "text-neutral-500"
        )}
      >
        All
      </Link>

      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-black",
            route.active ? "text-black" : "text-neutral-500"
          )}
        >
          {route.label}
        </Link>
      ))}

      {collections?.length > 0 && (
        <HoverCard>
          <HoverCardTrigger>
            <Link
              href={"/collections/all-products"}
              className={cn(
                "text-sm font-medium transition-colors hover:text-black",
                pathname === "/collections/all-products"
                  ? "text-black"
                  : "text-neutral-500"
              )}
            >
              Shop by Collection
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-96">
            <div className="space-y-1">
              <h4 className="text-lg font-semibold">Collections</h4>

              <div className="flex  flex-wrap items-center gap-5 pt-2">
                {collections?.length &&
                  collections.map((collection) => (
                    <Link
                      href={`/collections/${collection.id}`}
                      key={collection.id}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-black",
                        pathname === `/collections/${collection.id}`
                          ? "text-black"
                          : "text-neutral-500"
                      )}
                    >
                      {collection.name}
                    </Link>
                  ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </nav>
  );
};

export default MainNav;
