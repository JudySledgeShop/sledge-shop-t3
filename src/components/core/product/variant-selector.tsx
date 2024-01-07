import { useEffect, type FC } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import * as z from "zod";

import type { DetailedProductFull, Variation } from "~/types";
import { cn } from "~/utils/styles";

interface IProps {
  product: DetailedProductFull;
  variant: Variation | null;

  setVariant: (variant: Variation | null) => void;
  setQuantity: (quantity: number) => void;
}
const formSchema = z.object({
  selection: z.record(z.string(), z.string()),
  quantity: z.number().min(1),
});

type ProductFormValues = z.infer<typeof formSchema>;

const VariantSelector: FC<IProps> = ({
  product,

  variant,
  setVariant,
  setQuantity,
}) => {
  // Define a zod schema for validation

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selection: {},
      quantity: 1,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    const getVariant = () => {
      return product.variants?.find(
        (variant) =>
          Object.values(watchedValues.selection).join(", ") === variant.values
      );
    };

    const selectedVariant = getVariant();

    if (product.variants?.length > 0 && selectedVariant) {
      setVariant(selectedVariant);
    } else {
      setVariant(null);
    }
    setQuantity(watchedValues.quantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, product.variants]);

  useEffect(() => {
    if (variant) form.setValue("quantity", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  const availableOptions = product?.variants?.map((variant) => {
    if (variant.quantity > 1) return `${variant.values}, ${variant.quantity}`;
    return "";
  });

  const isOptionAvailable = (option: string) => {
    // Assuming availableOptions is an array of strings
    // Update this logic based on how your availableOptions are structured
    return availableOptions.some((availableOption) =>
      availableOption.includes(option)
    );
  };

  const possibleOptions = React.useMemo(() => {
    return product.category.attributes?.map((attribute) => {
      return {
        name: attribute.name,
        values: attribute.values.split(";"),
      };
    });
  }, [product.category.attributes]);

  //  First, generate an array of possible options and array of available options
  //  Second, compare the two arrays and return the available options
  function doesMatch(option: string, idx: number, name: string): boolean {
    const searchArray = Object.values({
      ...form.watch("selection"),
      [name]: option,
    });
    for (const target of availableOptions) {
      const splitTarget = target.split(", ").map((s) => s.trim());
      let isMatch = true;

      for (let i = 0; i < searchArray.length; i++) {
        const searchElement = searchArray[i];
        const targetElement = splitTarget[i];

        // Check if the elements match, considering undefined as a wildcard
        if (searchElement !== undefined && searchElement !== targetElement) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return true; // Found a matching string in targetArray
      }
    }

    return false; // No match found in targetArray
  }

  // console.log(availableOptions);

  return (
    <>
      <Form {...form}>
        <form className="space-y-5">
          {product.variants?.length > 0 &&
            possibleOptions?.map((field, idx) => (
              <FormItem key={idx} className="flex flex-col">
                <FormLabel>{field.name}</FormLabel>{" "}
                <Controller
                  name={`selection.${field.name}`}
                  control={form.control}
                  render={({ field: formField }) => (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-[200px] justify-between",
                                !formField.value && "text-muted-foreground"
                              )}
                            >
                              {formField.value
                                ? product.category.attributes[
                                    idx
                                  ]!.values.split(";").find(
                                    (language) => language === formField.value
                                  )
                                : `Select a ${field.name}`}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder={`Search ${field.name}...`}
                            />
                            <CommandEmpty>No {field.name} found.</CommandEmpty>
                            <CommandGroup>
                              {field.values.map((language, index) => {
                                const available = isOptionAvailable(language);
                                const combo = doesMatch(
                                  language,
                                  idx,
                                  field.name
                                );

                                return (
                                  <CommandItem
                                    value={language}
                                    key={index}
                                    className={cn(
                                      available && combo
                                        ? ""
                                        : "text-gray-400 line-through"
                                    )}
                                    disabled={!available || !combo}
                                    onSelect={() => {
                                      form.setValue(
                                        `selection.${field.name}`,
                                        formField.value === language
                                          ? ""
                                          : language
                                      );
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        language === formField.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {language}{" "}
                                    {!available || !combo
                                      ? " - Out of stock"
                                      : ""}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </>
                  )}
                />
              </FormItem>
            ))}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-[180px]"
                    type="number"
                    min={1}
                    max={variant ? variant.quantity : product.quantity}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
};

export default VariantSelector;
