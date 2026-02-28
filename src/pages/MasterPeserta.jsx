import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Search, Plus, X, MoreVertical, RefreshCw, Phone,
  Building2, Briefcase, Eye, Edit, CheckCircle2, AlertCircle,
  Calendar, MapPin, User, Trash2 , XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const MasterPeserta = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const pageSize = 2;

  const [pesertaList, setPesertaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    gender: "PRIA",
    employeeNumber: "",
    birthdayDate: "",
    uidCompany: "ce05b7cc-28a0-4d70-bd5e-b30b3d4625cb",
    companyDepartment: "",
    companyDepartmentPosition: "",
    phoneNumber: "",
    age: null
  });

  const fetchPeserta = async (page = 0) => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/participants/list', {
          params: { page: page, size: pageSize }
        });

        if (response.data.success) {
          const paginationData = response.data.data;

          setPesertaList(paginationData.content || paginationData || []);
          setCurrentPage(paginationData.currentPage || 0);
          setTotalPages(paginationData.totalPages || 0);
          setTotalItems(paginationData.totalItems || 0);
        }
      } catch (error) {
        console.error("Gagal mengambil data list:", error);
        setPesertaList([]);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchPeserta();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setDrawerMode('add');
    setFormData({
      nik: "", name: "", gender: "PRIA", employeeNumber: "",
      birthdayDate: "", uidCompany: "ce05b7cc-28a0-4d70-bd5e-b30b3d4625cb",
      companyDepartment: "", companyDepartmentPosition: "", phoneNumber: "", age: null
    });
    setIsDrawerOpen(true);
  };

  const handleOpenUpdate = (p) => {
    setDrawerMode('update');
    setFormData({
      nik: p.nik || "",
      name: p.name || "",
      gender: p.gender || "PRIA",
      employeeNumber: p.employeeNumber || "",
      birthdayDate: p.birthdayDate || "",
      uidCompany: p.uidCompany || "ce05b7cc-28a0-4d70-bd5e-b30b3d4625cb",
      companyDepartment: p.departmentName || "",
      companyDepartmentPosition: p.positionName || "",
      phoneNumber: p.phoneNumber || "",
      age: p.age || null
    });
    setActiveDropdown(null);
    setIsDrawerOpen(true);
  };

  const handleViewDetail = async (p) => {
    setActiveDropdown(null);
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);

    try {
      const response = await axios.get(`/api/participants/detail/${p.uid}`);

      if (response.data.success) {
        setSelectedPeserta(response.data.data);
      } else {
        setNotification({
          isOpen: true, type: 'error', title: 'Gagal', message: response.data.message
        });
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      console.error("Gagal mengambil detail:", error);
      setNotification({
        isOpen: true, type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal mengambil data detail dari server.'
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (uid) => {
    setActiveDropdown(null);

    const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus data peserta ini?");

    if (isConfirm) {
      try {
        const response = await axios.delete(`/api/participants/delete/${uid}`);

        if (response.data.success) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Berhasil Terhapus',
            message: 'Data peserta berhasil dinonaktifkan.'
          });
          fetchPeserta(currentPage);
        } else {
          setNotification({
            isOpen: true, type: 'error', title: 'Gagal', message: response.data.message
          });
        }
      } catch (error) {
        console.error("Gagal menghapus:", error);
        setNotification({
          isOpen: true, type: 'error', title: 'Terjadi Kesalahan', message: 'Gagal menghapus data ke server.'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      const missingFields = [];
      if (!formData.name?.trim()) missingFields.push("Nama Lengkap");
      if (!formData.nik?.toString().trim()) missingFields.push("NIK");
      if (!formData.birthdayDate) missingFields.push("Tanggal Lahir");
      if (!formData.phoneNumber?.toString().trim()) missingFields.push("No. Telepon/HP");

      if (missingFields.length > 0) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Data Belum Lengkap',
          message: `Mohon isi field wajib berikut: ${missingFields.join(', ')}.`
        });
        return;
      }
      // ----------------------------------------

      try {
        let response;
        if (drawerMode === 'add') {
          response = await axios.post('/api/participants/add', formData);
        } else {
          response = await axios.put('/api/participants/update', formData);
        }

        if (response.data.success) {
          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Berhasil!',
            message: response.data.message || `Data peserta berhasil di${drawerMode === 'add' ? 'tambah' : 'update'}.`
          });
          setIsDrawerOpen(false);
          fetchPeserta(currentPage);
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Terjadi Kesalahan',
          message: `Gagal men${drawerMode === 'add' ? 'tambahkan' : 'gupdate'} peserta. Periksa koneksi ke Backend.`
        });
      }
    };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header Utama */}
      <header className="p-8 pb-4 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Peserta</h1>
          <nav className="text-xs text-gray-400 mt-1 italic">Manajemen Database &gt; <span className="text-cyan-700 font-bold">Daftar Peserta</span></nav>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => fetchPeserta(currentPage)} className="p-3 text-gray-400 hover:text-cyan-700 bg-white border rounded-xl transition-all">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleOpenAdd} className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-100 transition-all active:scale-95">
            <Plus size={18} />
            <span>Tambah Peserta</span>
          </button>
        </div>
      </header>

      {/* Tabel Data */}
      <div className="p-8 flex-1 overflow-auto">
        <div className="bg-white p-4 rounded-t-2xl border flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari nama atau NIK..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none text-right">
            Total Database<br/><span className="text-cyan-700 text-lg">{pesertaList.length}</span>
          </div>
        </div>

        <div className="bg-white border border-t-0 rounded-b-2xl shadow-sm overflow-visible">
          <table className="w-full text-left">
                      <thead className="bg-gray-50/50 border-b">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <th className="p-5 w-[25%]">Informasi Pasien</th>
                          <th className="p-5 w-[20%]">Perusahaan</th>
                          <th className="p-5 w-[20%]">Unit & Jabatan</th>
                          <th className="p-5 w-[15%]">Usia & Lahir</th>  {/* <-- Kolom Lahir Kembali! */}
                          <th className="p-5 w-[10%]">Status</th>        {/* <-- Kolom Status */}
                          <th className="p-5 w-[10%] text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-sm">
                        {pesertaList.map((p) => (
                          <tr key={p.uid} className={`group transition-all ${p.status === 'Tidak Aktif' || p.status === 'TIDAK_AKTIF' ? 'bg-gray-50/50 opacity-70' : 'hover:bg-cyan-50/20'}`}>

                            {/* 1. Informasi Pasien */}
                            <td className="p-5">
                              <div className="font-bold text-gray-800 uppercase leading-tight">{p.name}</div>
                              <div className="text-[11px] text-gray-400 font-mono tracking-tighter mt-0.5">{p.nik}</div>
                            </td>

                            {/* 2. Perusahaan */}
                            <td className="p-5">
                              <div className="flex items-center text-cyan-700 font-bold text-xs uppercase mb-1">
                                <Building2 size={12} className="mr-1" /> {p.companyName || '-'}
                              </div>
                              <div className="flex items-center text-[10px] text-gray-400">
                                <Phone size={10} className="mr-1" /> {p.phoneNumber || '-'}
                              </div>
                            </td>

                            {/* 3. Unit & Jabatan */}
                            <td className="p-5">
                               <div className="flex items-center text-gray-700 font-semibold text-[11px] uppercase">
                                  <Briefcase size={12} className="mr-1 text-gray-400" /> {p.departmentName || '-'}
                               </div>
                               <div className="text-[10px] text-gray-400 uppercase ml-4">{p.positionName || '-'}</div>
                            </td>

                            {/* 4. Usia & Lahir (YANG SEMPAT HILANG) */}
                            <td className="p-5">
                              <div className="text-gray-600 font-medium text-[13px]">{p.birthdayDate}</div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                                {p.age} TAHUN | {p.gender}
                              </div>
                            </td>

                            {/* 5. Status Aktif / Nonaktif */}
                            <td className="p-5">
                              {p.status === 'Aktif' || p.status === 'AKTIF' ? (
                                <div className="flex items-center text-green-600 font-semibold text-[11px] uppercase bg-green-50 px-2.5 py-1 rounded-md w-fit border border-green-100">
                                  <CheckCircle2 size={12} className="mr-1.5" /> Aktif
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600 font-semibold text-[11px] uppercase bg-red-50 px-2.5 py-1 rounded-md w-fit border border-red-100">
                                  <XCircle size={12} className="mr-1.5" /> Nonaktif
                                </div>
                              )}
                            </td>

                            <td className="p-5 text-center relative">
                              <button onClick={() => setActiveDropdown(activeDropdown === p.uid ? null : p.uid)} className="text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 p-1.5 rounded-lg transition-colors">
                                <MoreVertical size={20}/>
                              </button>
                              {activeDropdown === p.uid && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                                  <div className="absolute right-14 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-[0_5px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button onClick={() => handleViewDetail(p)} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-3 transition-colors">
                                      <Eye size={16} /> Lihat Detail
                                    </button>
                                    <button onClick={() => handleOpenUpdate(p)} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-3 transition-colors border-t border-gray-50">
                                      <Edit size={16} /> Update Peserta
                                    </button>
                                    {(p.status === 'Aktif' || p.status === 'AKTIF') && (
                                       <button onClick={() => handleDelete(p.uid)} className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50">
                                         <Trash2 size={16} /> Nonaktifkan
                                       </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                        {pesertaList.length === 0 && !isLoading && (
                          <tr>
                            <td colSpan="6" className="p-20 text-center text-gray-400 italic">Data peserta belum tersedia.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
        </div>
        <div className="p-5 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Menampilkan {pesertaList.length} dari {totalItems} Peserta
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchPeserta(currentPage - 1)}
                      disabled={currentPage === 0 || isLoading}
                      className="p-2 text-gray-400 hover:text-cyan-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => fetchPeserta(i)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === i
                              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                              : "text-gray-400 hover:bg-white hover:text-cyan-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => fetchPeserta(currentPage + 1)}
                      disabled={currentPage === totalPages - 1 || isLoading}
                      className="p-2 text-gray-400 hover:text-cyan-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
      </div>

      {/* --- SIDE DRAWER FORM (ADD & UPDATE) --- */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 p-0 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  {drawerMode === 'add' ? 'Tambah Peserta Baru' : 'Update Data Peserta'}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Medika System</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
                <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold bg-cyan-700 text-white rounded-lg shadow-lg shadow-cyan-100 hover:bg-cyan-800 transition-all active:scale-95">
                  {drawerMode === 'add' ? 'Save Data' : 'Update Data'}
                </button>
              </div>
            </div>

            <form className="p-8 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Pasien <span className="text-red-500">*</span></label>
                  <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm" placeholder="Input Nama..." />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span></label>
                  <input
                    name="nik" value={formData.nik} onChange={handleChange} type="number"
                    className={`w-full p-3 border border-gray-200 rounded-xl text-sm outline-none ${drawerMode === 'update' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-cyan-500'}`}
                    placeholder="3201..." disabled={drawerMode === 'update'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button type="button" onClick={() => setFormData({...formData, gender: 'PRIA'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.gender === 'PRIA' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-400'}`}>Pria</button>
                      <button type="button" onClick={() => setFormData({...formData, gender: 'WANITA'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.gender === 'WANITA' ? 'bg-white text-cyan-700 shadow-sm' : 'text-gray-400'}`}>Wanita</button>
                    </div>
                 </div>
                 <div className="flex flex-col space-y-1 text-sm">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. Karyawan</label>
                    <input name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} type="text" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="EMP-001" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <input name="birthdayDate" value={formData.birthdayDate} onChange={handleChange} type="date" className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none" />
                 </div>
                 <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. Telepon/HP <span className="text-red-500">*</span></label>
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="number" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none" placeholder="08..." />
                 </div>
              </div>

              <div className="flex flex-col space-y-4 pt-4 border-t border-dashed">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Departemen / Unit Kerja</label>
                  <input name="companyDepartment" value={formData.companyDepartment} onChange={handleChange} type="text" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Contoh: IT Operation" />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan / Posisi</label>
                  <input name="companyDepartmentPosition" value={formData.companyDepartmentPosition} onChange={handleChange} type="text" className="p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Contoh: Software Engineer" />
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* --- MODAL LIHAT DETAIL --- */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">Detail Peserta MCU</h2>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedPeserta?.uid || 'Memuat...'}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw size={32} className="text-cyan-600 animate-spin mb-4" />
                  <p className="text-sm text-gray-500 font-medium">Mengambil data dari server...</p>
                </div>
              ) : selectedPeserta ? (
                <div className="space-y-6">
                  {/* Bagian 1: Identitas Diri */}
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-dashed">Identitas Pasien</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Nama Lengkap</p>
                        <p className="text-sm font-semibold text-gray-800 uppercase">{selectedPeserta.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">NIK</p>
                        <p className="text-sm font-mono text-gray-800">{selectedPeserta.nik}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Gender & Usia</p>
                        <p className="text-sm font-medium text-gray-800">{selectedPeserta.gender} <span className="text-gray-400 mx-1">•</span> {selectedPeserta.age} Tahun</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Tanggal Lahir</p>
                        <div className="flex items-center text-sm font-medium text-gray-800">
                          <Calendar size={14} className="mr-1.5 text-gray-400" /> {selectedPeserta.birthdayDate}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Kontak & Alamat</p>
                        <div className="flex items-center text-sm font-medium text-gray-800 mb-1">
                          <Phone size={14} className="mr-1.5 text-gray-400" /> {selectedPeserta.phoneNumber || '-'}
                        </div>
                        <div className="flex items-start text-sm font-medium text-gray-800 mt-2">
                          <MapPin size={14} className="mr-1.5 text-gray-400 mt-0.5 shrink-0" />
                          <span className="leading-snug">{selectedPeserta.address || 'Alamat belum diinput'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Pekerjaan / B2B */}
                  <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100/50">
                    <h3 className="text-[10px] font-bold text-cyan-800 uppercase tracking-widest mb-3">Informasi Kemitraan (B2B)</h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                      <div className="col-span-2">
                        <p className="text-[10px] text-cyan-600/70 uppercase font-bold mb-1">Perusahaan</p>
                        <div className="flex items-center text-sm font-bold text-cyan-800 uppercase">
                          <Building2 size={14} className="mr-1.5" /> {selectedPeserta.companyName || '-'}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-cyan-600/70 uppercase font-bold mb-1">Departemen / Unit</p>
                        <p className="text-sm font-semibold text-cyan-900 uppercase">{selectedPeserta.departmentName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-cyan-600/70 uppercase font-bold mb-1">Posisi / Jabatan</p>
                        <p className="text-sm font-semibold text-cyan-900 uppercase">{selectedPeserta.positionName || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM NOTIFICATION MODAL --- */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4 ${notification.type === 'success' ? 'bg-cyan-50 text-cyan-600' : 'bg-red-50 text-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{notification.title}</h3>
              <p className="text-sm text-gray-500">{notification.message}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setNotification({ ...notification, isOpen: false })}
                className={`w-full py-3 px-4 font-bold rounded-xl transition-all active:scale-95 ${
                  notification.type === 'success'
                    ? 'bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-100'
                    : 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg shadow-gray-200'
                }`}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPeserta;