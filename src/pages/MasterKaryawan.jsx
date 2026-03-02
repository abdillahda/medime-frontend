import React, { useState } from "react";

const MasterKaryawan = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="p-8 h-full flex flex-col relative bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Master Karyawan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data staf internal dan admin Medime
          </p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-cyan-600 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-700 transition-colors font-medium shadow-sm shadow-cyan-600/20"
        >
          + Tambah Karyawan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 font-medium">Tabel Data Karyawan</p>
          <p className="text-sm text-gray-300 mt-1">
            Nantinya akan diisi daftar staf lab, analis, dan admin.
          </p>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-800">Tambah Karyawan</h3>
            <p className="text-xs text-gray-500">
              Form pendaftaran akun staf internal baru
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Peran (Role)
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white">
              <option value="">Pilih peran karyawan...</option>
              <option value="admin">Admin Sistem</option>
              <option value="analis">Analis Lab</option>
              <option value="staf">Staf Registrasi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Username / Email
            </label>
            <input
              type="email"
              placeholder="budi@medime.id"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button className="px-5 py-2.5 text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 rounded-lg shadow-sm transition-colors">
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterKaryawan;
