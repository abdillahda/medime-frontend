import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import MasterPeserta from './pages/MasterPeserta';
import MasterPerusahaan from './pages/MasterPerusahaan';
import MasterKaryawan from './pages/MasterKaryawan';
import MasterPemeriksaan from './pages/MasterPemeriksaan';
import MasterPaket from './pages/MasterPaket';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="flex-1 overflow-hidden">
        {activeMenu === 'dashboard' && <Home />}
        {activeMenu === 'peserta' && <MasterPeserta />}
        {activeMenu === 'perusahaan' && <MasterPerusahaan />}
        {activeMenu === 'karyawan' && <MasterKaryawan />}
        {activeMenu === 'pemeriksaan' && <MasterPemeriksaan />}
        {activeMenu === 'paket' && <MasterPaket />}

        {activeMenu === 'input' && (
          <div className="p-20 text-center text-gray-400">Halaman Input Hasil sedang dikembangkan...</div>
        )}
      </main>
    </div>
  );
}

export default App;