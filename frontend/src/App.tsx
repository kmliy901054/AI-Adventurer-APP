import { Navigate, Route, Routes } from 'react-router-dom';

import DebugPage from '@/pages/Debug';
import HomePage from '@/pages/Home';
import NotFoundPage from '@/pages/NotFound';
import PlayPage from '@/pages/Play';
import ResultPage from '@/pages/Result';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
