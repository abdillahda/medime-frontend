import React from 'react';
import { LayoutDashboard, Users, ClipboardEdit, FileSearch, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menus = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'peserta', label: 'Master Peserta', icon: Users },
    { id: 'input', label: 'Input Hasil', icon: ClipboardEdit },
    { id: 'laporan', label: 'Laporan', icon: FileSearch },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 flex items-center space-x-2">
        <div className="w-8 h-8 bg-cyan-700 rounded flex items-center justify-center text-white font-bold">M</div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">Medime <span className="text-cyan-600 font-medium text-sm italic">V.2.0</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Utama</p>
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
              activeMenu === menu.id
                ? 'bg-cyan-50 text-cyan-700 border-l-4 border-cyan-700 rounded-l-none'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <menu.icon size={20} />
              <span className="font-medium text-sm">{menu.label}</span>
            </div>
            {activeMenu === menu.id && <div className="w-1.5 h-1.5 bg-cyan-700 rounded-full" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-medium text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;