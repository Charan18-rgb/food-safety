import { ProductInput } from '@foodgrade/shared-types';
import { OFFLookupResult } from './OpenFoodFactsClient.js';

export interface IOpenFoodFactsClient {
  lookupByBarcode(barcode: string): Promise<ProductInput | null>;
  lookupBarcodeDetailed(barcode: string, signal?: AbortSignal): Promise<OFFLookupResult>;
}
