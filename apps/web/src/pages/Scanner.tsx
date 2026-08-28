import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useBarcodeScan } from '@/hooks/useBarcodeScan';
import { useLabelScan } from '@/hooks/useLabelScan';
import { Camera, ScanBarcode, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { compressImage } from '@/utils/imageUtils';
import { useNavigate } from 'react-router-dom';
import { useResultContext } from '@/context/ResultContext';
import { clientService } from '@/services/client';
import { normalizeBarcode, validateGS1CheckDigit } from '@foodgrade/client-services';

export default function Scanner() {
  const [mode, setMode] = useState<'barcode' | 'label' | 'manual'>('barcode');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualError, setManualError] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedPhotoData, setCapturedPhotoData] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const barcodeScan = useBarcodeScan(clientService);
  const labelScan = useLabelScan();
  const navigate = useNavigate();
  const { setResult } = useResultContext();

  useEffect(() => {
    if (mode === 'barcode' && videoRef.current) {
      barcodeScan.startScanning(videoRef.current);
    } else {
      barcodeScan.stopScanning();
    }
    return () => barcodeScan.stopScanning();
  }, [mode, barcodeScan.startScanning, barcodeScan.stopScanning]);

  // Clean up Object URL on unmount or photo change
  useEffect(() => {
    return () => {
      if (capturedPhotoUrl) {
        URL.revokeObjectURL(capturedPhotoUrl);
      }
      labelScan.cancel();
    };
  }, [capturedPhotoUrl, labelScan.cancel]);

  useEffect(() => {
    if (barcodeScan.analysisResult) {
      setResult({
        productInput: barcodeScan.analysisResult.productInput,
        analysisResult: barcodeScan.analysisResult.analysisResult,
        scanMethod: 'barcode',
        timestamp: Date.now(),
        scanRecordId: barcodeScan.analysisResult.scanRecordId
      });
      barcodeScan.stopScanning();
      navigate('/result');
    }
  }, [barcodeScan.analysisResult, navigate, setResult, barcodeScan]);

  useEffect(() => {
    if (labelScan.result) {
      setResult({
        productInput: labelScan.result.productInput,
        analysisResult: labelScan.result.analysisResult,
        scanMethod: 'label',
        timestamp: Date.now()
      });
      navigate('/result');
    }
  }, [labelScan.result, navigate, setResult]);

  const handleManualSubmit = async () => {
    setManualError('');
    if (!manualBarcode || manualBarcode.trim().length < 8) {
      setManualError('Invalid barcode format or checksum');
      return;
    }
    try {
      const normalized = normalizeBarcode(manualBarcode);
      if (!validateGS1CheckDigit(normalized)) {
        setManualError('Invalid barcode format or checksum');
        return;
      }
      setManualLoading(true);
      const res = await clientService.lookupBarcodeAndAnalyze(normalized);
      if (!res) {
        setManualError('Product not found in database');
      } else {
        setResult({
          productInput: res.productInput,
          analysisResult: res.analysisResult,
          scanMethod: 'manual',
          timestamp: Date.now(),
          scanRecordId: res.scanRecord.id,
          isFavorite: res.scanRecord.isFavorite
        });
        navigate('/result');
      }
    } catch (e: any) {
      setManualError(e.message || 'Lookup failed');
    } finally {
      setManualLoading(false);
    }
  };

  const handlePhotoCapture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = URL.createObjectURL(file);
        setCapturedPhotoUrl(url);
        
        const compressedData = await compressImage(file);
        setCapturedPhotoData(compressedData);
      } catch (err) {
        setManualError('Failed to process image');
      }
    }
  };

  const startAnalysis = () => {
    if (capturedPhotoData) {
      labelScan.analyzeImage(capturedPhotoData);
    }
  };

  const retakePhoto = () => {
    if (capturedPhotoUrl) {
      URL.revokeObjectURL(capturedPhotoUrl);
    }
    setCapturedPhotoUrl(null);
    setCapturedPhotoData(null);
    labelScan.cancel();
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
        {mode === 'barcode' && (
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />
        )}
        
        {mode === 'barcode' && barcodeScan.state === 'detecting' && (
          <div className="absolute z-10 w-64 h-32 border-2 border-primary-500 rounded-xl flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        )}

        {mode === 'barcode' && barcodeScan.state === 'error' && (
          <div className="z-10 text-white p-4 text-center">
            <p className="text-red-400 mb-2">{barcodeScan.error}</p>
            <Button onClick={() => { if(videoRef.current) barcodeScan.startScanning(videoRef.current) }}>Retry Camera</Button>
            <Button variant="ghost" className="mt-2" onClick={() => setMode('manual')}>Enter Barcode Manually</Button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="z-10 bg-white p-6 rounded-2xl w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4 text-center">Enter Barcode</h3>
            <input 
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="w-full p-3 border rounded-lg mb-4"
              placeholder="e.g. 8901234567890"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
            />
            {manualError && <p className="text-red-500 text-sm mb-4">{manualError}</p>}
            <Button className="w-full" onClick={handleManualSubmit} disabled={manualLoading}>
              {manualLoading ? <Spinner /> : 'Analyze'}
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={() => setMode('barcode')}>Cancel</Button>
          </div>
        )}

        {mode === 'label' && (
          <div className="z-10 flex flex-col items-center justify-center p-4 w-full h-full">
            {capturedPhotoUrl ? (
              <div className="absolute inset-0 flex flex-col">
                <img src={capturedPhotoUrl} alt="Captured Label" className="flex-1 object-cover" />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-black/50 flex justify-between gap-4">
                  {labelScan.state === 'analyzing' ? (
                    <div className="flex items-center justify-center w-full text-white">
                      <Spinner className="w-6 h-6 mr-3" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={retakePhoto} className="flex-1">Retake</Button>
                      <Button onClick={startAnalysis} className="flex-1">Use Photo</Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-white flex flex-col items-center gap-4">
                <Camera className="w-16 h-16 text-gray-500" />
                <p className="text-center text-gray-300">Position the ingredients or nutrition label clearly in frame</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoCapture}
                />
                <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
                  Capture Photo
                </Button>
              </div>
            )}
            
            {labelScan.error && (
              <div className="absolute top-4 inset-x-4 bg-red-500 text-white p-3 rounded-lg text-sm">
                {labelScan.error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-4 pb-8 flex justify-center gap-4 z-20">
        <Button 
          variant={mode === 'barcode' || mode === 'manual' ? 'primary' : 'ghost'} 
          className={mode === 'barcode' || mode === 'manual' ? '' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
          onClick={() => { setMode('barcode'); retakePhoto(); }}
        >
          <ScanBarcode className="w-5 h-5 mr-2" />
          Barcode
        </Button>
        <Button 
          variant={mode === 'label' ? 'primary' : 'ghost'}
          className={mode === 'label' ? '' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
          onClick={() => setMode('label')}
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          Label OCR
        </Button>
      </div>
    </div>
  );
}
