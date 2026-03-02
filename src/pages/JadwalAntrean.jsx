import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RefreshCw, Clock, User, Building2, Package,
  PlayCircle, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';

const JadwalAntrean = () => {
  const [queueData, setQueueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, type: '', title: '', message: '' });

  // 1. Fungsi Menarik Data Antrean Hari Ini
  const fetchTodayQueue = async () => {
    setIsLoading(true);
    try {
      // Menembak API yang baru saja Anda buat di Backend
      const response = await axios.get('/api/mcu-registrations/queue/today');
      if (response.data.success) {
        setQueueData(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal menarik data antrean:", error);
      showNotification('error', 'Koneksi Gagal', 'Tidak dapat memuat data antrean dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetch saat komponen pertama kali dimuat
  useEffect(() => {
    fetchTodayQueue();

    // Opsional: Auto-refresh setiap 30 detik agar layar selalu update
    const interval = setInterval(() => {
      fetchTodayQueue();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fungsi Mengubah Status Pasien
  const handleUpdateStatus = async (uid, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await axios.patch(`/api/mcu-registrations/${uid}/status`, null, {
        params: { status: newStatus }
      });

      if (response.data.success) {
        // Refresh data antrean setelah berhasil update
        fetchTodayQueue();
      }
    } catch (error) {
      console.error("Gagal update status:", error);
      showNotification('error', 'Update Gagal', 'Terjadi kesalahan saat mengubah status pasien.');
    } finally {
      setIsUpdating(false);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
    setTimeout(() => setNotification({ isOpen: false, type: '', title: '', message: '' }), 3000);
  };

  // 3. Helper untuk memfilter data berdasarkan status
  const getFilteredQueue = (status) => queueData.filter(item => item.status === status);

  // 4. Komponen Kartu Pasien (UI)
  const PatientCard = ({ data }) => {
    // Format Jam Registrasi
    const timeString = new Date(data.registrationTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 mb-4 group relative overflow-hidden">
        {/* Indikator Warna Status */}
        <div className={`absolute top-0 left-0 w-1.5 h-full ${
          data.status === 'REGISTERED' ? 'bg-orange-400' :
          data.status === 'IN_PROGRESS' ? 'bg-cyan-500' : 'bg-emerald-500'
        }`}></div>

        <div className="pl-2">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider bg-gray-50 px-2 py-1 rounded-md">
              {data.mcuNumber}
            </span>
            <span className="flex items-center text-[10px] font-bold text-gray-400">
              <Clock size={12} className="mr-1" /> {timeString}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-800 uppercase leading-tight mb-1">{data.participantName}</h3>

          <div className="space-y-1.5 mt-3 border-t border-gray-50 pt-3">
            <div className="flex items-center text-[11px] text-gray-500 font-medium">
              <Building2 size={12} className="mr-2 text-cyan-600" /> {data.companyName}
            </div>
            <div className="flex items-center text-[11px] text-gray-500 font-medium">
              <Package size={12} className="mr-2 text-cyan-600" /> {data.packageName}
            </div>
          </div>

          {/* Tombol Aksi Berdasarkan Status */}
          <div className="mt-4 flex gap-2">
            {data.status === 'REGISTERED' && (
              <button
                onClick={() => handleUpdateStatus(data.registrationUid, 'IN_PROGRESS')}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                <PlayCircle size={14} /> Panggil Masuk
              </button>
            )}
            {data.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleUpdateStatus(data.registrationUid, 'COMPLETED')}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> Selesai Diperiksa
              </button>
            )}
            {data.status === 'COMPLETED' && (
              <div className="flex-1 py-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg">
                Pemeriksaan Selesai
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* --- HEADER --- */}
      <header className="p-6 md:p-8 flex justify-between items-end bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Live Antrean MCU</h1>
          <nav className="text-xs text-gray-400 mt-1 italic">Operasional &gt; <span className="text-cyan-700 font-bold">Jadwal & Antrean</span></nav>
        </div>
        <button
          onClick={fetchTodayQueue}
          disabled={isLoading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-cyan-700 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin text-cyan-600" : ""} />
          Segarkan Data
        </button>
      </header>

      [Image of a Kanban board UI with three columns for medical queue management showing patient cards]

      {/* --- KANBAN BOARD (3 KOLOM) --- */}
      <div className="flex-1 overflow-x-auto p-6 md:p-8">
        <div className="flex flex-nowrap md:grid md:grid-cols-3 gap-6 min-w-[800px] md:min-w-0 h-full">

          {/* KOLOM 1: Menunggu Panggilan */}
          <div className="flex flex-col w-full bg-gray-50/50 rounded-2xl border border-gray-200/60 overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                Menunggu Antrean
              </h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-md">
                {getFilteredQueue('REGISTERED').length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {getFilteredQueue('REGISTERED').map(item => <PatientCard key={item.registrationUid} data={item} />)}
              {getFilteredQueue('REGISTERED').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">Belum ada antrean</div>
              )}
            </div>
          </div>

          {/* KOLOM 2: Sedang Diperiksa */}
          <div className="flex flex-col w-full bg-cyan-50/30 rounded-2xl border border-cyan-100/60 overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Sedang Diperiksa
              </h2>
              <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-0.5 rounded-md">
                {getFilteredQueue('IN_PROGRESS').length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {getFilteredQueue('IN_PROGRESS').map(item => <PatientCard key={item.registrationUid} data={item} />)}
              {getFilteredQueue('IN_PROGRESS').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">Kosong</div>
              )}
            </div>
          </div>

          {/* KOLOM 3: Selesai */}
          <div className="flex flex-col w-full bg-emerald-50/30 rounded-2xl border border-emerald-100/60 overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Selesai MCU
              </h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md">
                {getFilteredQueue('COMPLETED').length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide opacity-70">
              {getFilteredQueue('COMPLETED').map(item => <PatientCard key={item.registrationUid} data={item} />)}
              {getFilteredQueue('COMPLETED').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">Belum ada yang selesai</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- TOAST NOTIFICATION Sederhana --- */}
      {notification.isOpen && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          {notification.type === 'error' ? <AlertCircle className="text-red-400" /> : <CheckCircle2 className="text-emerald-400" />}
          <div>
            <h4 className="font-bold text-sm">{notification.title}</h4>
            <p className="text-xs text-gray-300">{notification.message}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default JadwalAntrean;