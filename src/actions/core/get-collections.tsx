import type { Collection } from "~/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/collections`;

const getCollections = async (): Promise<Collection[]> => {
  const res = await fetch(URL);

  return res.json();
};

export default getCollections;
