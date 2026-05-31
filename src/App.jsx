import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CommandCenterDashboard from './pages/CommandCenterDashboard.jsx';
import PublicPortal from './pages/PublicPortal.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicPortal />} />
        <Route path="/command" element={<CommandCenterDashboard />} />
      </Routes>
    </Router>
  );
}
