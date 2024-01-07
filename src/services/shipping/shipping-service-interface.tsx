//Create an interface for a shipping label service
export interface IShippingLabelService {
  generateShippingLabel(orderId: string): void;
}
