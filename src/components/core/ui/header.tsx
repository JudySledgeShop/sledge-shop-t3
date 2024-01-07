import type { Collection } from "~/types";

interface BillboardProps {
  data: Collection;
  minimal?: boolean;
}

const Header: React.FC<BillboardProps> = ({ data }) => {
  return (
    <div className="relative overflow-hidden rounded-xl p-4 sm:p-6 lg:p-8">
      <div
        style={{ backgroundImage: `url(${data?.billboard?.imageUrl})` }}
        className="relative aspect-square overflow-hidden rounded-xl bg-cover   md:aspect-[6.4/1] "
      >
        {" "}
        <div className="flex h-full w-full flex-col items-center justify-center gap-y-8 text-center">
          <div className="z-10 max-w-xs bg-gradient-to-br from-neutral-900 to-neutral-700 bg-clip-text text-3xl font-bold text-transparent sm:max-w-xl sm:text-5xl lg:text-6xl">
            {data?.name}
          </div>{" "}
          <div className="absolute  z-0 h-full w-full bg-gradient-to-b from-transparent to-slate-300 backdrop-contrast-75"></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
