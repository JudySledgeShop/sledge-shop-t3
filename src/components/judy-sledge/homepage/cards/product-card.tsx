import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FC } from "react";
import type Stripe from "stripe";

// import QuickAdd from "~/components/ecommerce/QuickAdd";
interface IProps {
  product: Stripe.Product;
  price: Stripe.Price;
}
const ProductCard: FC<IProps> = ({ product, price }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="relative flex aspect-[9/12] ">
        <Link href={`/products/${product?.id}`}>
          <Image
            layout="fill"
            src={product?.images[0] ?? ""}
            alt="hero"
            objectFit="cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded"
          />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute bottom-0 right-0 m-2 h-10 w-10 rounded-full bg-white  font-extrabold tracking-tight text-accent  transition hover:text-accent/75"
        >
          <span className="sr-only">Go to Product</span>
          <PlusCircle className="absolute left-0 top-0 h-10 w-10" />
        </button>
      </div>
      <div className="flex w-full items-center ">
        <div className="w-4/5">
          <h4 className="text-default relative text-2xl font-light capitalize tracking-tight">
            {product?.metadata?.category}
          </h4>
          <h4 className="text-default  relative text-3xl font-semibold capitalize tracking-tight ">
            {product?.name}
          </h4>
        </div>

        <p className="w-1/5 text-3xl font-bold text-accent">
          {/* {
            formatCurrencyString({
              value: price?.unit_amount ?? 0,
              currency: "USD",
            }).split(".")[0]
          } */}
        </p>
      </div>
      {/* <QuickAdd open={open} setOpen={setOpen} product={product} /> */}
    </div>
  );
};

export default ProductCard;
