import { Expand, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { MouseEventHandler } from "react";

import Currency from "~/components/core/ui/currency";
import IconButton from "~/components/core/ui/icon-button";
import useCart from "~/hooks/core/use-cart";
import usePreviewModal from "~/hooks/core/use-preview-modal";
import type { DetailedProductFull } from "~/types";

interface ProductCard {
  data: DetailedProductFull;
}

const ProductCard: React.FC<ProductCard> = ({ data }) => {
  const previewModal = usePreviewModal();
  const cart = useCart();
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  };

  const onPreview: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    previewModal.onOpen(data);
  };

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();

    cart.addCartItem({
      product: data,
      quantity: 1,
      variant: null,
    });
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer space-y-4 rounded-xl border bg-white p-3"
    >
      {/* Image & actions */}
      <div className="relative aspect-square rounded-xl bg-gray-100">
        <Image
          src={data.images?.[0]?.url ?? ""}
          alt=""
          fill
          className="aspect-square rounded-md object-cover"
        />
        <div className="absolute bottom-5 w-full px-6 opacity-0 transition group-hover:opacity-100">
          <div className="flex justify-center gap-x-6">
            <IconButton
              onClick={onPreview}
              icon={<Expand size={20} className="text-gray-600" />}
            />
            {data.variants?.length === 0 && (
              <IconButton
                onClick={onAddToCart}
                icon={<ShoppingCart size={20} className="text-gray-600" />}
              />
            )}
          </div>
        </div>
      </div>
      {/* Description */}
      <div>
        <p className="text-lg font-semibold">{data.name}</p>
        <p className="text-sm text-gray-500">{data.category?.name}</p>
      </div>
      {/* Price & Reiew */}
      <div className="flex items-center justify-between">
        <Currency value={data?.price} />
      </div>
    </div>
  );
};

export default ProductCard;
