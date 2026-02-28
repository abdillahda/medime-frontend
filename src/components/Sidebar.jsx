import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BriefcaseMedical,
  Users,
  ClipboardList,
  UserCircle,
  Settings,
  Menu,
  Database
} from 'lucide-react';

const menuGroups = [
  {
    title: "Overview",
    items: [
      { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard size={20} /> },
    ]
  },
  {
    title: "Kemitraan (B2B)",
    items: [
      { id: 'perusahaan', label: 'Daftar Perusahaan', icon: <Building2 size={20} /> },
      { id: 'paket', label: 'Paket Pemeriksaan', icon: <BriefcaseMedical size={20} /> },
    ]
  },
  {
    title: "Operasional MCU",
    items: [
      { id: 'peserta', label: 'Master Peserta', icon: <Users size={20} /> },
      { id: 'jadwal', label: 'Jadwal & Antrean', icon: <ClipboardList size={20} /> },
    ]
  },
  {
    title: "Manajemen Database",
    items: [
      { id: 'pemeriksaan', label: 'Data Pemeriksaan', icon: <Database size={20} /> },
    ]
  },
  {
    title: "Pengaturan",
    items: [
      { id: 'karyawan', label: 'Staf Internal Lab', icon: <UserCircle size={20} /> },
      { id: 'konfigurasi', label: 'Konfigurasi Sistem', icon: <Settings size={20} /> },
    ]
  }
];

export default function Sidebar({ activeMenu, setActiveMenu, onToggleDrawer }) {
  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-gray-100 shadow-sm shrink-0">
      <div className="flex items-center justify-between h-[72px] px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-[#007b99] rounded-md">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#1e293b]">
            Medime <span className="text-sm font-medium italic text-[#007b99]">V.2.0</span>
          </h1>
        </div>

        <button
          onClick={onToggleDrawer}
          className="p-1.5 text-gray-500 rounded-md hover:bg-gray-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-0">
            <h3 className="px-6 mb-3 text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
              {group.title}
            </h3>

            <div className="space-y-1 pr-4">
              {group.items.map((item) => {
                const isActive = activeMenu === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`relative flex items-center justify-between w-full py-3 rounded-r-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#eef8fa] text-[#007b99]'
                        : 'text-[#64748b] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#007b99] rounded-r-md"></div>
                      )}

                      <span className={`ml-6 ${isActive ? 'text-[#007b99]' : 'text-[#64748b]'}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[15px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {item.label}
                      </span>
                    </div>

                    {isActive && (
                      <div className="w-1.5 h-1.5 mr-4 bg-[#007b99] rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}