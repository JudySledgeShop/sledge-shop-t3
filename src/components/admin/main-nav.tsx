"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

import { cn } from "~/utils/styles";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const router = useRouter();

  if (!router?.query?.storeId) return null;
  const routes = [
    {
      href: `/admin/${router?.query?.storeId.toString()}`,
      label: "Overview",
      active: pathname === `/admin/${router?.query?.storeId.toString()}`,
    },
    {
      href: `/admin/${router?.query?.storeId.toString()}/billboards`,
      label: "Billboards",
      active:
        pathname === `/admin/${router?.query?.storeId.toString()}/billboards`,
    },
    {
      href: `/admin/${router?.query?.storeId.toString()}/categories`,
      label: "Categories",
      active:
        pathname === `/admin/${router?.query?.storeId.toString()}/categories`,
    },
    {
      href: `/admin/${router?.query?.storeId.toString()}/collections`,
      label: "Collections",
      active:
        pathname === `/admin/${router?.query?.storeId.toString()}/categories`,
    },

    {
      href: `/admin/${router?.query?.storeId.toString()}/products`,
      label: "Products",
      active:
        pathname === `/admin/${router?.query?.storeId.toString()}/products`,
    },
    {
      href: `/admin/${router?.query?.storeId.toString()}/shipping`,
      label: "Shipping",
      active:
        pathname === `/admin/${router?.query?.storeId.toString()}/shipping`,
    },
    {
      href: `/admin/${router?.query?.storeId.toString()}/orders`,
      label: "Orders",
      active: pathname === `/admin/${router?.query?.storeId.toString()}/orders`,
    },
    {
      href: `/admin/${router?.query?.storeId.toString()}/settings`,
      label: "Settings",
      active:
        pathname === `/admin/${router?.query?.storeId.toString()}/settings`,
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
