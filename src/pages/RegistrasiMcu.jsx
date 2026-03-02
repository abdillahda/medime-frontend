import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  User,
  Building2,
  Package,
  Save,
  X,
  RefreshCw,
  Fingerprint,
  Calendar,
  Phone,
  ChevronDown,
} from "lucide-react";

const RegistrasiMcu = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [isPackageLoading, setIsPackageLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    mcuNumber: "",
  });

  const initialFormState = {
    participantUid: "",
    nik: "",
    name: "",
    gender: "PRIA",
    employeeNumber: "",
    birthdayDate: "",
    phoneNumber: "",
    uidCompany: "",
    companyDepartment: "",
    companyDepartmentPosition: "",
    packageId: "",
    registrationRemarks: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("/api/perusahaan/list");
      if (res.data.success) {
        const list = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.content || [];
        setCompanyList(list);
      }
    } catch (err) {
      console.error("Gagal load perusahaan:", err);
    }
  };

  const fetchPackagesByCompany = async (companyUid) => {
    if (!companyUid) return;
    setIsPackageLoading(true);
    try {
      const res = await axios.get(
        `/api/mcu-registrations/medical-packages/${companyUid}`
      );
      if (res.data.success) {
        const list = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.content || [];
        setPackageList(list);
      }
    } catch (err) {
      setPackageList([]);
    } finally {
      setIsPackageLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      setIsSearching(true);
      try {
        const res = await axios.get("/api/participants/search", {
          params: { q: query },
        });
        if (res.data.success) {
          setSearchResults(res.data.data || []);
        }
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectParticipant = async (p) => {
    if (p.companyUid) {
      await fetchPackagesByCompany(p.companyUid);
    }

    setFormData({
      participantUid: p.uid,
      nik: p.nik || "",
      name: p.name || "",
      gender: p.gender || "PRIA",
      employeeNumber: p.employeeNumber || "",
      birthdayDate: p.birthdayDate || "",
      phoneNumber: p.phoneNumber || "",
      uidCompany: p.companyUid || "",
      companyDepartment: p.departmentName || "",
      companyDepartmentPosition: p.positionName || "",

      packageId: p.packageUid || "",
      registrationRemarks: p.remarks || "",
    });

    setSearchQuery("");
    setSearchResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "uidCompany") {
      fetchPackagesByCompany(value);
      setFormData((prev) => ({ ...prev, uidCompany: value, packageId: "" }));
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setSearchQuery("");
    setSearchResults([]);
    setPackageList([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/mcu-registrations/direct-checkin",
        formData
      );
      if (response.data.success) {
        setNotification({
          isOpen: true,
          type: "success",
          title: "Berhasil",
          message: "Pasien berhasil didaftarkan.",
          mcuNumber: response.data.data,
        });
        setIsDrawerOpen(false);
        fetchQueueData();
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Pendaftaran Ditolak",
          message: response.data.message,
        });
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Pendaftaran Gagal",
        message: error.response?.data?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
      {/* HEADER UTAMA */}
      <header className="p-5 md:p-8 pb-4 flex flex-col md:flex-row md:justify-between md:items-center bg-white border-b border-slate-200 shrink-0 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
            Registrasi & Check-In MCU
          </h1>
          <nav className="text-[10px] text-slate-400 mt-1.5 italic font-bold uppercase tracking-widest">
            Frontdesk &gt;{" "}
            <span className="text-cyan-700">Pendaftaran Langsung</span>
          </nav>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-sm"
          >
            Reset Form
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 scrollbar-hide flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
            <h3 className="text-[11px] font-black text-cyan-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Search size={16} /> Pencarian Data Pasien
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
              Ketik Nama atau NIK untuk pasien yang sudah pernah terdaftar agar
              data terisi otomatis.
            </p>

            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Cari NIK / Nama..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 uppercase focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              />
              {isSearching && (
                <RefreshCw
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600 animate-spin"
                  size={18}
                />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 mx-6 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.uid}
                    onClick={() => handleSelectParticipant(p)}
                    className="w-full text-left p-4 hover:bg-cyan-50 border-b border-slate-50 transition-colors flex flex-col gap-1"
                  >
                    <span className="text-sm font-black text-slate-800 uppercase">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center gap-1">
                      <Fingerprint size={12} /> {p.nik}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-cyan-50/50 p-6 rounded-3xl border border-cyan-100 flex-1">
            <div className="flex items-center gap-3 mb-4 text-cyan-800">
              <AlertCircle size={20} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Panduan Frontdesk
              </h3>
            </div>
            <ul className="text-xs text-cyan-900/70 space-y-3 font-medium leading-relaxed list-disc list-inside">
              <li>Pastikan NIK sesuai dengan KTP asli.</li>
              <li>Jika pasien belum ada, isi manual form di bawah/samping.</li>
              <li>Tombol Check-In akan langsung mencetak nomor antrean.</li>
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-2/3 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <RefreshCw size={40} className="text-cyan-600 animate-spin" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-700 mb-2 border-b border-slate-100 pb-3">
                <User size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Informasi Pribadi
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nama Sesuai KTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all text-sm font-bold uppercase"
                    placeholder="Input Nama..."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nomor KTP (NIK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    type="number"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="3201..."
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    No. Handphone / WA
                  </label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    type="number"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="08..."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: "PRIA" })
                      }
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${
                        formData.gender === "PRIA"
                          ? "bg-white text-cyan-700 shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      Pria
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, gender: "WANITA" })
                      }
                      className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${
                        formData.gender === "WANITA"
                          ? "bg-white text-cyan-700 shadow-sm"
                          : "text-slate-400"
                      }`}
                    >
                      Wanita
                    </button>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="birthdayDate"
                    value={formData.birthdayDate}
                    onChange={handleChange}
                    type="date"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-700 mb-2 border-b border-slate-100 pb-3">
                  <Building2 size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">
                    Kemitraan (B2B)
                  </h3>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Perusahaan Mitra <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="uidCompany"
                      value={formData.uidCompany}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-white border-2 border-cyan-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 appearance-none"
                    >
                      <option value="">-- Pilih Perusahaan --</option>
                      {companyList.map((c) => (
                        <option key={c.uid} value={c.uid}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-4 text-cyan-600 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    No. Karyawan (NIP)
                  </label>
                  <input
                    name="employeeNumber"
                    value={formData.employeeNumber}
                    onChange={handleChange}
                    type="text"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 uppercase"
                    placeholder="Kosongkan jika tidak ada"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-2 border-b border-slate-100 pb-3">
                  <Package size={18} />
                  <h3 className="text-xs font-black uppercase tracking-widest">
                    Layanan Pemeriksaan
                  </h3>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Pilih Paket MCU <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="packageId"
                      value={formData.packageId}
                      onChange={handleChange}
                      disabled={!formData.uidCompany || isPackageLoading}
                      className="w-full p-3.5 bg-white border-2 border-emerald-100 rounded-2xl text-sm font-black text-emerald-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 appearance-none"
                    >
                      <option value="">
                        {isPackageLoading
                          ? "Memuat Paket..."
                          : "-- Pilih Paket MCU --"}
                      </option>
                      {packageList.map((pkg) => (
                        <option key={pkg.uid} value={pkg.uid}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-4 text-emerald-600 pointer-events-none"
                      size={18}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    name="registrationRemarks"
                    value={formData.registrationRemarks}
                    onChange={handleChange}
                    rows="1"
                    className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                    placeholder="Opsional..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-auto px-10 py-4 bg-cyan-700 hover:bg-cyan-800 text-white font-black rounded-2xl shadow-xl shadow-cyan-200 uppercase text-sm tracking-widest transition-all active:scale-95 flex justify-center items-center gap-3"
              >
                <CheckCircle2 size={20} /> Konfirmasi Kehadiran
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- MODAL SUKSES --- */}
      {notification.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <div className="p-8">
              <div
                className={`mx-auto flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                  notification.type === "success"
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 size={40} />
                ) : (
                  <AlertCircle size={40} />
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                {notification.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium px-2">
                {notification.message}
              </p>

              {notification.mcuNumber && (
                <div className="mt-6 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">
                    Nomor Antrean Peserta
                  </p>
                  <p className="text-3xl font-black text-emerald-700 tracking-tighter">
                    {notification.mcuNumber}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() =>
                  setNotification({
                    ...notification,
                    isOpen: false,
                    mcuNumber: "",
                  })
                }
                className={`w-full py-4 px-6 font-black rounded-2xl transition-all uppercase text-xs tracking-widest shadow-xl active:scale-95 ${
                  notification.type === "success"
                    ? "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
                    : "bg-red-600 text-white hover:bg-red-700 shadow-red-200"
                }`}
              >
                {notification.type === "success"
                  ? "Tutup & Lanjut"
                  : "Mengerti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrasiMcu;
