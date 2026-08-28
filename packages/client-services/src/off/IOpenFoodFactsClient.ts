import { ProductInput } from '@foodgrade/shared-types';

export interface IOpenFoodFactsClient {
  lookupByBarcode(barcode: string): Promise<ProductInput | null>;
}
