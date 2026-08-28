/// <reference types="vite/client" />
import { useState, useCallback, useRef } from 'react';
import { 
  VisionPipeline, 
  VisionPipelineResult, 
  VisionImageSource,
  CompositeVisionProvider,
  GeminiVisionProvider,
  TesseractVisionProvider
} from '@foodgrade/vision';

type ScanState = 'idle' | 'capturing' | 'analyzing' | 'success' | 'error';

export function useLabelScan() {
  const [state, setState] = useState<ScanState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisionPipelineResult | null>(null);
  
  // Inject the Vite environment variable into the provider explicitly
  const pipelineRef = useRef<VisionPipeline>((() => {
    const gemini = new GeminiVisionProvider({
      endpoint: import.meta.env.VITE_VISION_PROXY_ENDPOINT as string | undefined
    });
    const tesseract = new TesseractVisionProvider();
    
    // Use cloud_first strategy, falling back to local OCR if network fails
    const composite = new CompositeVisionProvider('cloud_first', gemini, tesseract);
    return new VisionPipeline(composite);
  })());

  const analyzeImage = useCallback(async (image: VisionImageSource) => {
    try {
      setState('analyzing');
      setError(null);
      setResult(null);
      
      const res = await pipelineRef.current.processImage(image);
      setResult(res);
      setState('success');
    } catch (err: any) {
      if (err.name === 'VisionCancelledError') {
        // Ignore cancellation errors as they mean a new scan started or we cancelled intentionally
        return;
      }
      setError(err.message || 'Failed to analyze label');
      setState('error');
    }
  }, []);

  const cancel = useCallback(() => {
    pipelineRef.current.cancel();
    setState('idle');
  }, []);

  return { state, error, result, analyzeImage, cancel };
}
