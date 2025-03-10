import Link from "next/link";

export type BreadCrumbPath = {
  name: string;
  link?: string;
};

const Breadcrumbs = ({ pathway }: { pathway: BreadCrumbPath[] }) => {
  return (
    <nav className="mb-4 flex   px-5 pb-5 pt-10 " aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-neutral-500 transition-colors hover:text-black"
          >
            <svg
              className="mr-2.5 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            Home
          </Link>
        </li>

        {pathway.map((path, idx) => (
          <BreadcrumbPath pathway={path} key={idx} />
        ))}
        {/* <li>
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-neutral-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <Link
              href="/collections/all-products"
              className="ml-1 text-sm font-medium text-neutral-500 transition-colors hover:text-black md:ml-2"
            >
              Collections
            </Link>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-neutral-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span className="ml-1 text-sm font-medium  text-black md:ml-2">
              {collection?.name}
            </span>
          </div>
        </li> */}
      </ol>
    </nav>
  );
};

const BreadcrumbPath = ({
  pathway,
}: {
  pathway: {
    name: string;
    link?: string;
  };
}) => {
  const params = pathway?.link
    ? ({
        "aria-current": "page",
      } as React.HTMLAttributes<HTMLLIElement>)
    : {};

  return (
    <li {...params}>
      <div className="flex items-center">
        <svg
          className="h-6 w-6 text-neutral-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          ></path>
        </svg>

        {pathway?.link ? (
          <Link
            href={pathway?.link}
            className="ml-1 text-sm font-medium text-neutral-500 transition-colors hover:text-black md:ml-2"
          >
            {pathway.name}
          </Link>
        ) : (
          <span className="ml-1 text-sm font-medium  text-black md:ml-2">
            {pathway.name}
          </span>
        )}
      </div>
    </li>
  );
};

export default Breadcrumbs;
