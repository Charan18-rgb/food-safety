import { useState, useCallback, useRef } from 'react';
import { BarcodeScannerService, ScannerConfig, ScannerStatus } from '@foodgrade/scanner';
import { FoodGradeClientService } from '@foodgrade/client-services';
import { ProductInput, AnalysisResult } from '@foodgrade/shared-types';

type ScanState = ScannerStatus;

export function useBarcodeScan(clientService: FoodGradeClientService) {
  const [state, setState] = useState<ScanState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ productInput: ProductInput; analysisResult: AnalysisResult; scanRecordId?: string } | null>(null);
  const scannerRef = useRef<BarcodeScannerService | null>(null);

  const startScanning = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      setState('requesting_camera');
      setError(null);
      setDetectedBarcode(null);
      setAnalysisResult(null);
      
      const config: ScannerConfig = {
        facingMode: 'environment',
        fps: 10,
        autoAnalyze: true
      };
      
      const scanner = new BarcodeScannerService(config, clientService);
      scannerRef.current = scanner;
      
      await scanner.start(videoElement, {
        onBarcodeDetected: (barcode: string) => {
          setDetectedBarcode(barcode);
        },
        onProductAnalyzed: (result: any) => {
          setAnalysisResult({ 
            productInput: result.productInput, 
            analysisResult: result.analysisResult,
            scanRecordId: result.scanRecord?.id 
          });
          scanner.stop();
        },
        onError: (err: Error) => {
          setError(err.message || 'Scanning error');
        },
        onStatusChange: (status: ScannerStatus) => {
          setState(status);
        }
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to start camera');
      setState('error');
    }
  }, [clientService]);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setState('idle');
  }, []);

  return { state, error, detectedBarcode, analysisResult, startScanning, stopScanning };
}
