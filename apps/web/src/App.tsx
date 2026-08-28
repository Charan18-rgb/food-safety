import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import Home from '@/pages/Home';
import Scanner from '@/pages/Scanner';
import Result from '@/pages/Result';
import History from '@/pages/History';
import Saved from '@/pages/Saved';
import About from '@/pages/About';
import { ResultProvider } from '@/context/ResultContext';

export default function App() {
  return (
    <ResultProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/result" element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </ResultProvider>
  );
}
