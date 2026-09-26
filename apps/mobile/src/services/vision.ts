import { VisionPipeline, GeminiVisionProvider, OCREvidence } from '@foodgrade/vision';
import { clientService } from './client';

// EXPO_PUBLIC_API_URL must be set in the build environment.
// Development: set to http://<your-LAN-IP>:3000/api/v1/vision/ocr in .env.local
// Production:  set to https://<your-domain>/api/v1/vision/ocr
// If unset, OCR will fail with a clear VisionEndpointMissingError rather than silently
// sending requests to a non-existent address.
const proxyEndpoint = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000/api/v1/vision/ocr';

const geminiProvider = new GeminiVisionProvider({
  endpoint: proxyEndpoint
});

export const visionPipeline = new VisionPipeline(geminiProvider);

/**
 * Convenience method to parse OCR evidence and evaluate the product,
 * keeping the UI clean.
 *
 * @param signal - optional AbortSignal. When aborted, the function returns
 *   immediately without saving to history. The caller must check for AbortError.
 */
export async function analyzeOCRTextAndSave(
  rawText: string,
  ocrEvidence: OCREvidence,
  signal?: AbortSignal
) {
  if (signal?.aborted) {
    const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
  }

  // Parse the text
  const parsedResult = visionPipeline.parseEvidence({ ...ocrEvidence, rawText });

  if (signal?.aborted) {
    const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
  }

  // Assemble it into ProductInput
  const productInput = visionPipeline.assembleProductInput(parsedResult, ocrEvidence);

  // Critical guard before history write
  if (signal?.aborted) {
    const err = new Error('Cancelled'); err.name = 'AbortError'; throw err;
  }

  // Save via clientService (analyzes and saves)
  const result = await clientService.analyzeAndSave(productInput);

  return result;
}
