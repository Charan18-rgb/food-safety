import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ProductInput, AnalysisResult } from '@foodgrade/shared-types';

export interface AppResultState {
  productInput: ProductInput;
  analysisResult: AnalysisResult;
  scanMethod: 'barcode' | 'label' | 'manual' | 'history';
  timestamp: number;
  scanRecordId?: string;
  isFavorite?: boolean;
}

interface ResultContextType {
  currentResult: AppResultState | null;
  setResult: (result: AppResultState) => void;
  clearResult: () => void;
  updateFavoriteStatus: (isFav: boolean) => void;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [currentResult, setCurrentResult] = useState<AppResultState | null>(null);

  const setResult = useCallback((result: AppResultState) => setCurrentResult(result), []);
  const clearResult = useCallback(() => setCurrentResult(null), []);
  
  const updateFavoriteStatus = useCallback((isFav: boolean) => {
    setCurrentResult(prev => prev ? { ...prev, isFavorite: isFav } : null);
  }, []);

  return (
    <ResultContext.Provider value={{ currentResult, setResult, clearResult, updateFavoriteStatus }}>
      {children}
    </ResultContext.Provider>
  );
}

export function useResultContext() {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error('useResultContext must be used within a ResultProvider');
  }
  return context;
}

