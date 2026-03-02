import React from "react";
import { Users, LogOut } from "lucide-react";

const Home = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-xl font-medium text-gray-800 border-b pb-2">
          Home
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="mb-8 bg-gray-50 p-4 rounded-xl">
            <h1 className="text-cyan-700 font-black text-2xl">GLOBAL MEDIKA</h1>
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-tighter leading-none">
              Clinic & Occupational Health
            </p>
          </div>
          <div className="flex space-x-12 mt-4">
            <div className="flex flex-col items-center cursor-pointer group">
              <div className="p-4 bg-cyan-700 text-white rounded-full group-hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-100">
                <Users size={24} />
              </div>
              <span className="text-xs mt-3 font-bold text-gray-600">
                Profil
              </span>
            </div>
            <div className="flex flex-col items-center cursor-pointer group text-red-500">
              <div className="p-4 bg-gray-100 rounded-full group-hover:bg-red-500 group-hover:text-white transition-all">
                <LogOut size={24} />
              </div>
              <span className="text-xs mt-3 font-bold">Logout</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-cyan-700 font-bold mb-4 flex items-center">
            <span className="w-2 h-2 bg-cyan-700 rounded-full mr-2"></span>
            Thursday, 12 February 2026
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Selamat Datang, Rizqi Raditya (Admin)
          </h1>
          <h3 className="text-cyan-600 font-bold text-lg mb-6 underline decoration-cyan-200 underline-offset-8">
            Global Medika
          </h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            PT Global Integra Medikatama atau yang biasa dikenal dengan Global
            Medika adalah perusahaan yang bergerak dibidang layanan kesehatan
            meliputi layanan Klinik Umum, Homecare, Medical Check Up, Pelayanan
            Kesehatan Kerja, dan Evakuasi Medis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
