import axios from "axios";

import type Shippo from "shippo";
import { create } from "zustand";
import type { PackageFormValues } from "~/components/admin/orders/package-form";

export type ShippingAddress = {
  name: string;
  street: string;
  additional?: string;
  city: string;
  state: string;
  zip: string;
};

export type ShippingResponse = {
  isValid: boolean;
  message: string;
};

export type RateResponse = {
  isValid: boolean;
  message: string;
  rates?: Shippo.Rate[];
};
export type Package = {
  length: number;
  width: number;
  height: number;
  distance_unit: "in" | "cm";
  weight: number;
  mass_unit: "lb" | "kg";
};

const DEFAULT_COUNTRY = "US";
// const DEFAULT_UNIT_SYSTEM = "imperial";

interface useShippingLabelStore {
  rates: Shippo.Rate[];
  setRates: (rates: Shippo.Rate[]) => void;
  selectedRate: Shippo.Rate | null;
  setSelectedRate: (rate: Shippo.Rate) => void;
  customerAddress: ShippingAddress | null;
  setCustomerAddress: (address: ShippingAddress) => void;
  businessAddress: ShippingAddress | null;
  setBusinessAddress: (address: ShippingAddress) => void;
  parcel: Package | null;
  setParcel: (parcel: Package) => void;
}

const useShippingLabelValues = create<useShippingLabelStore>((set) => ({
  rates: [],
  setRates: (rates: Shippo.Rate[]) => set({ rates }),
  selectedRate: null,
  setSelectedRate: (selectedRate: Shippo.Rate) => set({ selectedRate }),
  customerAddress: null,
  setCustomerAddress: (customerAddress: ShippingAddress) =>
    set({ customerAddress }),
  businessAddress: null,
  setBusinessAddress: (businessAddress: ShippingAddress) =>
    set({ businessAddress }),
  parcel: null,
  setParcel: (parcel: Package) => set({ parcel }),
}));

const useShippingLabel = () => {
  const {
    rates,
    setRates,
    customerAddress,
    setCustomerAddress,
    businessAddress,
    setBusinessAddress,
    parcel,
    setParcel,
    selectedRate,
    setSelectedRate,
  } = useShippingLabelValues();
  //   const [rates, setRates] = useState<Shippo.Rate[]>([]);
  //   const [parcel, setParcel] = useState<Package | null>(null);

  //   const [customerAddress, setCustomerAddress] =
  //     useState<ShippingAddress | null>(null);

  //   const [businessAddress, setBusinessAddress] =
  //     useState<ShippingAddress | null>(null);

  const validateAddress = async (address: ShippingAddress) => {
    const addressResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shipping/addresses`,
      {
        street1: address.street,
        street2: address.additional,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: DEFAULT_COUNTRY,
      }
    );

    if (addressResponse.status !== 200)
      return {
        isValid: false,
        message: `There was an issue with validating the address.
    Please try again later.`,
      };

    const validationResults = addressResponse.data.validation_results;

    if (validationResults.is_valid)
      return { isValid: true, message: "Success" };
    else
      return { isValid: false, message: validationResults.messages?.[0]?.text };
  };

  const getRates = async () => {
    if (rates.length > 0)
      return {
        isValid: true,
        message: "Fetched from cache",
        rates: rates,
      };
    if (!customerAddress || !businessAddress) {
      return {
        isValid: false,
        message: "Please enter a valid address",
        rates: [],
      };
    }

    if (!parcel) {
      return {
        isValid: false,
        message: "Please enter valid package information",
        rates: [],
      };
    }

    const ratesResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shipping/rates`,
      {
        customer_name: customerAddress.name,
        customer_street: customerAddress.street,
        customer_additional: customerAddress.additional,
        customer_city: customerAddress.city,
        customer_state: customerAddress.state,
        customer_zip: customerAddress.zip,
        business_name: businessAddress.name,
        business_street: businessAddress.street,
        business_additional: businessAddress.additional,
        business_city: businessAddress.city,
        business_state: businessAddress.state,
        business_zip: businessAddress.zip,
        weight_lb: parcel.weight,
        weight_oz: 0,
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
      }
    );

    if (ratesResponse.status !== 200) {
      return {
        isValid: false,
        message: "There was an error generating rates. Please try again.",
      };
    }

    const rateData = ratesResponse.data.rates as Shippo.Rate[];

    return {
      isValid: true,
      message: "Success",
      rates: rateData,
    };
  };

  const setParcelMeasurements = (data: PackageFormValues) => {
    setParcel({
      length: data.package_length,
      width: data.package_width,
      height: data.package_height,
      distance_unit: "in",
      weight: (data.package_weight_lbs + data.package_weight_oz) / 16,
      mass_unit: "lb",
    });
  };

  return {
    validateAddress,
    getRates,
    setRates,
    rates,
    setCustomerAddress,
    customerAddress,
    businessAddress,
    parcel,
    setBusinessAddress,
    setParcelMeasurements,
    selectedRate,
    setSelectedRate,
  };
};

export default useShippingLabel;
