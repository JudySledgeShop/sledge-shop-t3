import type { DetailedProductFull } from "~/types";

export function extractQueryString(query: string) {
  // Split the query string into individual key-value pairs
  const pairs = query.split("&");

  // Extract the names and values into separate arrays
  const names: string[] | undefined = [];
  const values: string[] | undefined = [];

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    // Extract the name from the key (assuming it always ends with 'Variant')
    const name = key?.replace("Variant", "");
    names?.push(name!.charAt(0)!.toUpperCase() + name!.slice(1)); // Capitalize the first letter
    values.push(value!);
  });

  // Join the names and values with ' | ' and return
  return {
    names,
    values,
  };
}
export function filterProductsByVariants(
  products: DetailedProductFull[],
  targetNames: string[],
  targetValues: string[]
) {
  return products.filter((product) => {
    // Check if every target name and value is present in the product's variants
    return targetNames.every((name, index) => {
      // Find a variant in the product that matches the name and value
      return product.variants.some(
        (variant) =>
          variant.names.includes(name) &&
          variant.values.includes(targetValues[index]!)
      );
    });
  });
}
