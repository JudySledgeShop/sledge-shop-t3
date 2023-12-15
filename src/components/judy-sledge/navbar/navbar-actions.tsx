import { ShoppingBag, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Currency from "~/components/core/ui/currency";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Separator } from "~/components/ui/separator";
import useCart from "~/hooks/core/use-cart";
const NavbarActions = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: sessionData } = useSession();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();
  const cart = useCart();

  const cartItems = cart.getQuantity();

  if (!isMounted) {
    return null;
  }

  return (
    <div className="ml-auto flex items-center gap-x-4">
      {!sessionData && (
        <Button variant={"ghost"} onClick={() => void signIn()}>
          Sign in
        </Button>
      )}
      {sessionData && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={sessionData?.user?.image ?? ""}
                  alt={`@${sessionData?.user?.name}`}
                />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {sessionData?.user?.name}
                  </p>
                </div>
                <p className="text-xs leading-none text-muted-foreground">
                  {sessionData?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <HoverCard>
        <HoverCardTrigger>
          {" "}
          <Button
            onClick={() => router.push("/cart")}
            className="flex items-center rounded-full bg-black px-4 py-2"
          >
            <ShoppingBag size={20} color="white" />
            <span className="ml-2 text-sm font-medium text-white">
              {cartItems}
            </span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-1">
            <h4 className="text-lg font-semibold">Cart ({cartItems}) items</h4>

            <Separator />

            {cartItems &&
              cart.cartItems.map((item, idx) => (
                <div
                  className="grid w-full  grid-cols-12 items-start gap-x-8 gap-y-8 border-b border-gray-200 py-2"
                  key={idx}
                >
                  <div className="col-span-3">
                    <div className="relative aspect-square w-20">
                      <Image
                        src={item.product?.images[0]?.url ?? ""}
                        layout="fill"
                        objectFit="cover"
                        alt="product"
                      />
                    </div>
                  </div>
                  <div className="col-span-5 ">
                    <h1 className="text-base font-bold text-gray-900">
                      {item.product.name}
                    </h1>
                    <div className="mt-3 flex items-end justify-between">
                      {/* <p className="text-sm text-gray-900"> */}
                      <Currency value={item.product?.price} />
                      {/* </p> */}
                    </div>
                  </div>
                </div>
              ))}

            <div className="flex w-full justify-between py-1 text-sm">
              <p>Subtotal:</p> <Currency value={0} />
            </div>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">
                Shipping and sales tax calculated at checkout
              </span>
            </div>

            <Button className="w-full rounded-full">
              View cart & check out
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default NavbarActions;
