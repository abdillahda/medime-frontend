import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  X,
  MoreVertical,
  RefreshCw,
  Building2,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Trash2,
  Tag,
  Navigation,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MasterPerusahaan = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [notification, setNotification] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPerusahaan, setSelectedPerusahaan] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [perusahaanList, setPerusahaanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    companyCode: "",
    companyName: "",
    category: "",
    address: "",
    coordinate: "",
  });

  const fetchPerusahaan = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/perusahaan/list", {
        params: { page: page, size: pageSize },
      });

      if (response.data.success) {
        const paginationData = response.data.data;
        setPerusahaanList(paginationData.content || paginationData || []);
        setCurrentPage(paginationData.currentPage || 0);
        setTotalPages(paginationData.totalPages || 0);
        setTotalItems(paginationData.totalItems || 0);
      }
    } catch (error) {
      console.error("Gagal mengambil data list:", error);
      setPerusahaanList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setDrawerMode("add");
    setFormData({
      companyCode: "",
      companyName: "",
      category: "",
      address: "",
      coordinate: "",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenUpdate = (p) => {
    setDrawerMode("update");
    setFormData({
      companyCode: p.companyCode || "",
      companyName: p.companyName || "",
      category: p.category || "",
      address: p.address || "",
      coordinate: p.coordinate || "",
    });
    setActiveDropdown(null);
    setIsDrawerOpen(true);
  };

  const handleViewDetail = async (p) => {
    setActiveDropdown(null);
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);

    try {
      const response = await axios.get(`/api/perusahaan/detail/${p.uid}`);
      if (response.data.success) {
        setSelectedPerusahaan(response.data.data);
      } else {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Gagal",
          message: response.data.message,
        });
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Gagal mengambil detail.",
      });
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (uid) => {
    setActiveDropdown(null);
    const isConfirm = window.confirm(
      "Apakah Anda yakin ingin menonaktifkan perusahaan ini?"
    );
    if (isConfirm) {
      try {
        const response = await axios.delete(`/api/perusahaan/delete/${uid}`);
        if (response.data.success) {
          setNotification({
            isOpen: true,
            type: "success",
            title: "Berhasil",
            message: "Data berhasil dinonaktifkan.",
          });
          fetchPerusahaan(currentPage);
        } else {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: response.data.message,
          });
        }
      } catch (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Kesalahan",
          message: "Gagal menghubungi server.",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.companyCode?.trim()) missingFields.push("Kode Perusahaan");
    if (!formData.companyName?.trim()) missingFields.push("Nama Perusahaan");

    if (missingFields.length > 0) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Data Belum Lengkap",
        message: `Mohon isi field wajib berikut: ${missingFields.join(", ")}.`,
      });
      return;
    }

    try {
      let response;
      if (drawerMode === "add") {
        response = await axios.post("/api/perusahaan/add", formData);
      } else {
        const uidToUpdate = perusahaanList.find(
          (p) => p.companyCode === formData.companyCode
        )?.uid;
        response = await axios.put(
          `/api/perusahaan/update/${uidToUpdate}`,
          formData
        );
      }

      if (response.data.success) {
        setNotification({
          isOpen: true,
          type: "success",
          title: "Berhasil!",
          message:
            response.data.message ||
            `Data berhasil di${drawerMode === "add" ? "tambah" : "update"}.`,
        });
        setIsDrawerOpen(false);
        fetchPerusahaan(currentPage);
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Gagal menyimpan data.",
      });
    }
  };

  const handleToggleStatus = async (company) => {
    const nextStatus = company.status === "AKTIF" ? "TIDAK_AKTIF" : "AKTIF";
    const actionText =
      nextStatus === "AKTIF" ? "mengaktifkan kembali" : "menonaktifkan";
    const confirmMsg = `Apakah Anda yakin ingin ${actionText} perusahaan "${company.companyName}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        const response = await axios.patch(
          `/api/perusahaan/${company.uid}/status`,
          {
            status: nextStatus,
          }
        );

        if (response.data.success) {
          setNotification({
            isOpen: true,
            type: "success",
            title: "Update Berhasil",
            message: `Perusahaan ${company.companyName} kini berstatus ${nextStatus}.`,
          });

          fetchPerusahaan(currentPage);
        }
      } catch (error) {
        console.error("Error toggle status:", error);
        setNotification({
          isOpen: true,
          type: "error",
          title: "Gagal Update",
          message: "Terjadi kesalahan saat menghubungi server.",
        });
      } finally {
        setActiveDropdown(null);
      }
    } else {
      setActiveDropdown(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header Utama */}
      <header className="p-8 pb-4 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Perusahaan
          </h1>
          <nav className="text-xs text-gray-400 mt-1 italic">
            Kemitraan (B2B) &gt;{" "}
            <span className="text-cyan-700 font-bold">Daftar Perusahaan</span>
          </nav>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchPerusahaan(currentPage)}
            className="p-3 text-gray-400 hover:text-cyan-700 bg-white border rounded-xl transition-all"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Tambah Perusahaan</span>
          </button>
        </div>
      </header>

      {/* Tabel Data */}
      <div className="p-8 flex-1 overflow-auto">
        <div className="bg-white p-4 rounded-t-2xl border flex items-center justify-between">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama perusahaan atau kode..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none text-right">
            Total Mitra B2B
            <br />
            <span className="text-cyan-700 text-lg">{totalItems}</span>
          </div>
        </div>

        <div className="bg-white border border-t-0 shadow-sm overflow-visible">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-5 w-[30%]">Informasi Perusahaan</th>
                <th className="p-5 w-[20%]">Kategori Bidang</th>
                <th className="p-5 w-[25%]">Lokasi / Alamat</th>
                <th className="p-5 w-[15%]">Status</th>
                <th className="p-5 w-[10%] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {perusahaanList.map((p) => (
                <tr
                  key={p.uid}
                  className={`group transition-all ${
                    p.status === "TIDAK_AKTIF"
                      ? "bg-gray-50/50 opacity-70"
                      : "hover:bg-cyan-50/20"
                  }`}
                >
                  <td className="p-5">
                    <div className="font-bold text-gray-800 uppercase leading-tight">
                      {p.companyName}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono tracking-tighter mt-0.5">
                      Kode: {p.companyCode}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center text-gray-700 font-semibold text-[11px] uppercase">
                      <Tag size={12} className="mr-1.5 text-gray-400" />{" "}
                      {p.category || "-"}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-start text-[11px] text-gray-600 max-w-xs">
                      <MapPin
                        size={12}
                        className="mr-1.5 text-gray-400 mt-0.5 shrink-0"
                      />
                      <span className="line-clamp-2">{p.address || "-"}</span>
                    </div>
                  </td>

                  <td className="p-5">
                    {p.status === "AKTIF" ? (
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
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === p.uid ? null : p.uid
                        )
                      }
                      className="text-gray-300 hover:text-cyan-700 p-1 rounded-md"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeDropdown === p.uid && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-14 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-[0_5px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={() => handleViewDetail(p)}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-3 transition-colors"
                          >
                            <Eye size={16} /> Lihat Detail
                          </button>
                          <button
                            onClick={() => handleOpenUpdate(p)}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-3 transition-colors border-t border-gray-50"
                          >
                            <Edit size={16} /> Update Data
                          </button>
                          {p.status === "AKTIF" ? (
                            <button
                              onClick={() => handleToggleStatus(p)}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                            >
                              <X size={16} /> Nonaktifkan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(p)}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                            >
                              <CheckCircle2 size={16} /> Aktifkan Data
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {perusahaanList.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-20 text-center text-gray-400 italic"
                  >
                    Data perusahaan belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-gray-50 flex items-center justify-between bg-white rounded-b-2xl shadow-sm border border-t-0">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Menampilkan {perusahaanList.length} dari {totalItems} Mitra
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPerusahaan(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className="p-2 text-gray-400 hover:text-cyan-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages > 0 ? totalPages : 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchPerusahaan(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-200"
                      : "text-gray-400 hover:bg-gray-50 hover:text-cyan-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchPerusahaan(currentPage + 1)}
              disabled={
                currentPage === totalPages - 1 || isLoading || totalPages === 0
              }
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
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 p-0 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  {drawerMode === "add"
                    ? "Tambah Perusahaan Baru"
                    : "Update Data Perusahaan"}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Global Medika System
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 text-sm font-bold bg-cyan-700 text-white rounded-lg shadow-lg shadow-cyan-100 hover:bg-cyan-800 transition-all active:scale-95"
                >
                  {drawerMode === "add" ? "Save Data" : "Update Data"}
                </button>
              </div>
            </div>

            <form className="p-8 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    type="text"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                    placeholder="PT Global Medika..."
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Kode Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleChange}
                    type="text"
                    className={`w-full p-3 border border-gray-200 rounded-xl text-sm outline-none ${
                      drawerMode === "update"
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "focus:ring-2 focus:ring-cyan-500"
                    }`}
                    placeholder="GLB-001"
                    disabled={drawerMode === "update"}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Kategori / Sektor Industri
                </label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Manufaktur, IT, Pertambangan..."
                />
              </div>

              <div className="flex flex-col space-y-4 pt-4 border-t border-dashed">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    placeholder="Jl. Raya Utama No. 123..."
                  ></textarea>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Koordinat Peta (Opsional)
                  </label>
                  <input
                    name="coordinate"
                    value={formData.coordinate}
                    onChange={handleChange}
                    type="text"
                    className="p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="-6.200000, 106.816666"
                  />
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">
                    Detail Perusahaan B2B
                  </h2>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {selectedPerusahaan?.uid || "Memuat..."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw
                    size={32}
                    className="text-cyan-600 animate-spin mb-4"
                  />
                  <p className="text-sm text-gray-500 font-medium">
                    Mengambil data dari server...
                  </p>
                </div>
              ) : selectedPerusahaan ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-dashed">
                      Profil Perusahaan
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                          Nama Perusahaan
                        </p>
                        <p className="text-sm font-semibold text-gray-800 uppercase">
                          {selectedPerusahaan.companyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                          Kode / ID
                        </p>
                        <p className="text-sm font-mono text-gray-800">
                          {selectedPerusahaan.companyCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                          Sektor Industri
                        </p>
                        <div className="flex items-center text-sm font-medium text-gray-800">
                          <Tag size={14} className="mr-1.5 text-gray-400" />{" "}
                          {selectedPerusahaan.category || "-"}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                          Status Kemitraan
                        </p>
                        <span className="px-2.5 py-1 text-[10px] font-bold text-cyan-700 bg-cyan-100 rounded-md uppercase">
                          {selectedPerusahaan.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                          Lokasi & Operasional
                        </p>
                        <div className="flex items-start text-sm font-medium text-gray-800 mt-2">
                          <MapPin
                            size={14}
                            className="mr-1.5 text-gray-400 mt-0.5 shrink-0"
                          />
                          <span className="leading-snug">
                            {selectedPerusahaan.address ||
                              "Alamat belum diinput"}
                          </span>
                        </div>
                        {selectedPerusahaan.coordinate && (
                          <div className="flex items-center text-sm font-medium text-gray-800 mt-2">
                            <Navigation
                              size={14}
                              className="mr-1.5 text-gray-400"
                            />{" "}
                            Koordinat: {selectedPerusahaan.coordinate}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div
                className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  notification.type === "success"
                    ? "bg-cyan-50 text-cyan-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 size={32} />
                ) : (
                  <AlertCircle size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-500">{notification.message}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() =>
                  setNotification({ ...notification, isOpen: false })
                }
                className={`w-full py-3 px-4 font-bold rounded-xl transition-all active:scale-95 ${
                  notification.type === "success"
                    ? "bg-cyan-700 hover:bg-cyan-800 text-white shadow-lg shadow-cyan-100"
                    : "bg-gray-800 hover:bg-gray-900 text-white shadow-lg shadow-gray-200"
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

export default MasterPerusahaan;
