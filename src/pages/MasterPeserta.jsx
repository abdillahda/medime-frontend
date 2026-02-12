import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Plus, X, MoreVertical, RefreshCw, Phone, Building2, Briefcase } from 'lucide-react';

const MasterPeserta = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nik: "",
    name: "",
    gender: "PRIA",
    employeeNumber: "",
    birthdayDate: "",
    uidCompany: "ce05b7cc-28a0-4d70-bd5e-b30b3d4625cb",
    companyDepartment: "",
    companyDepartmentPosition: "",
    phoneNumber: ""
  });

  const fetchPeserta = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/peserta/listPeserta');
      if (response.data.success) {
        setPesertaList(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/peserta/add', formData);
      if (response.data.success) {
        alert(response.data.message);
        setIsDrawerOpen(false);

        setFormData({
          nik: "", name: "", gender: "PRIA", employeeNumber: "",
          birthdayDate: "", uidCompany: "ce05b7cc-28a0-4d70-bd5e-b30b3d4625cb",
          companyDepartment: "", companyDepartmentPosition: "", phoneNumber: ""
        });
        fetchPeserta();
      }
    } catch (error) {
      alert("Gagal menambahkan peserta. Periksa koneksi ke Backend.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      <header className="p-8 pb-4 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Peserta</h1>
          <nav className="text-xs text-gray-400 mt-1 italic">Manajemen Database &gt; <span className="text-cyan-700 font-bold">Daftar Peserta</span></nav>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchPeserta}
            className="p-3 text-gray-400 hover:text-cyan-700 bg-white border rounded-xl transition-all"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Tambah Peserta</span>
          </button>
        </div>
      </header>

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

        <div className="bg-white border border-t-0 rounded-b-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-5">Informasi Pasien</th>
                <th className="p-5">Perusahaan</th>
                <th className="p-5">Unit & Jabatan</th>
                <th className="p-5">Status Lahir</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {pesertaList.map((p) => (
                <tr key={p.uid} className="hover:bg-cyan-50/20 group transition-all">
                  <td className="p-5">
                    <div className="font-bold text-gray-800 uppercase leading-tight">{p.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono tracking-tighter">{p.nik}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center text-cyan-700 font-bold text-xs uppercase mb-1">
                      <Building2 size={12} className="mr-1" /> {p.companyName}
                    </div>
                    <div className="flex items-center text-[10px] text-gray-400">
                      <Phone size={10} className="mr-1" /> {p.phoneNumber}
                    </div>
                  </td>
                  <td className="p-5">
                     <div className="flex items-center text-gray-700 font-semibold text-[11px] uppercase">
                        <Briefcase size={12} className="mr-1 text-gray-400" /> {p.departmentName}
                     </div>
                     <div className="text-[10px] text-gray-400 uppercase ml-4">{p.positionName}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-gray-600 font-medium">{p.birthdayDate}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {p.age} TAHUN | {p.gender}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <button className="text-gray-300 group-hover:text-cyan-700"><MoreVertical size={18}/></button>
                  </td>
                </tr>
              ))}
              {pesertaList.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400 italic">Data belum tersedia di Database Java.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 p-0 flex flex-col animate-in slide-in-from-right duration-300">

            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">Database Peserta Form</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Medika System</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setIsDrawerOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">Cancel</button>
                <button onClick={handleSubmit} className="px-6 py-2 text-sm font-bold bg-cyan-700 text-white rounded-lg shadow-lg shadow-cyan-100 hover:bg-cyan-800 transition-all active:scale-95">Save Data</button>
              </div>
            </div>

            <form className="p-8 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap Pasien</label>
                  <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm" placeholder="Input Nama..." />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK (Nomor Induk Kependudukan)</label>
                  <input name="nik" value={formData.nik} onChange={handleChange} type="number" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500" placeholder="3201..." />
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input name="birthdayDate" value={formData.birthdayDate} onChange={handleChange} type="date" className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none" />
                 </div>
                 <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. Telepon/HP</label>
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

              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Company Reference ID</p>
                <p className="text-[10px] text-gray-400 font-mono break-all">{formData.uidCompany}</p>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default MasterPeserta;