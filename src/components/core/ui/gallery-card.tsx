import Image from "next/image";

interface ProductCard {
  data: string;
}

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "~/components/ui/dialog";

const GalleryCard: React.FC<ProductCard> = ({ data }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group cursor-pointer space-y-4 rounded-xl border bg-white p-3">
          {/* Image & actions */}
          <div className="relative aspect-square rounded-xl bg-gray-100">
            <Image
              src={data ?? ""}
              alt=""
              fill
              className="aspect-square rounded-md object-cover"
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="aspect-square ">
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Image
              src={data ?? ""}
              alt=""
              fill
              className="aspect-square rounded-md object-cover"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryCard;
