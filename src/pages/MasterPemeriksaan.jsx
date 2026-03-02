import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  X,
  MoreVertical,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Trash2,
  XCircle,
  Network,
  Hash,
  ChevronRight,
  FileText,
  LayoutList,
  ChevronLeft,
} from "lucide-react";

const MasterPemeriksaan = () => {
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
  const [selectedItem, setSelectedItem] = useState(null);

  const [flatList, setFlatList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    referenceCode: "",
    level: 1,
    sequenceOrder: 1,
    inputType: "NONE",
    status: "ACTIVE",
    parentId: "",
  });

  const flattenHierarchy = (nodes, result = [], depth = 0) => {
    if (!nodes) return result;
    nodes.forEach((node) => {
      result.push({ ...node, depth });
      if (node.childItems && node.childItems.length > 0) {
        flattenHierarchy(node.childItems, result, depth + 1);
      }
    });
    return result;
  };

  const fetchExaminations = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/examinations/hierarchy", {
        params: { page: page, size: pageSize },
      });

      if (response.data.success) {
        const paginationData = response.data.data;

        setFlatList(flattenHierarchy(paginationData.content || []));
        setCurrentPage(paginationData.currentPage || 0);
        setTotalPages(paginationData.totalPages || 0);
        setTotalItems(paginationData.totalItems || 0);
      }
    } catch (error) {
      console.error("Gagal mengambil data hierarki:", error);
      setFlatList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "level" && parseInt(value) < 3) {
        newData.inputType = "NONE";
      }
      return newData;
    });
  };

  const handleOpenAdd = () => {
    setDrawerMode("add");
    setFormData({
      id: null,
      name: "",
      referenceCode: "",
      level: 1,
      sequenceOrder: 1,
      inputType: "NONE",
      status: "ACTIVE",
      parentId: "",
    });
    setIsDrawerOpen(true);
  };

  const handleOpenUpdate = (item) => {
    setDrawerMode("update");
    setFormData({
      id: item.id,
      name: item.name,
      referenceCode: item.referenceCode || "",
      level: item.level,
      sequenceOrder: item.sequenceOrder || 1,
      inputType: item.inputType || "NONE",
      status: item.status || "ACTIVE",
      parentId: item.parentId || "",
    });
    setActiveDropdown(null);
    setIsDrawerOpen(true);
  };

  const handleViewDetail = (item) => {
    setActiveDropdown(null);
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id) => {
    setActiveDropdown(null);
    const isConfirm = window.confirm(
      "Apakah Anda yakin ingin menonaktifkan data ini?"
    );
    if (isConfirm) {
      try {
        await axios.delete(`/api/examinations/${id}`);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Berhasil",
          message: "Data pemeriksaan berhasil dinonaktifkan.",
        });
        fetchExaminations(currentPage);
      } catch (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Gagal",
          message: "Terjadi kesalahan saat menonaktifkan data.",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.name?.trim()) missingFields.push("Nama Pemeriksaan");
    if (!formData.referenceCode?.trim()) missingFields.push("Kode Referensi");
    if (parseInt(formData.level) === 3 && formData.inputType === "NONE")
      missingFields.push("Tipe Input (Wajib untuk Level 3)");

    if (missingFields.length > 0) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Data Belum Lengkap",
        message: `Mohon isi field: ${missingFields.join(", ")}.`,
      });
      return;
    }

    const payload = {
      ...formData,
      level: parseInt(formData.level),
      sequenceOrder: parseInt(formData.sequenceOrder),
      parent: formData.parentId ? { id: formData.parentId } : null,
    };

    try {
      if (drawerMode === "add") {
        await axios.post("/api/examinations", payload);
      } else {
        await axios.put(`/api/examinations/${formData.id}`, payload);
      }

      setNotification({
        isOpen: true,
        type: "success",
        title: "Berhasil!",
        message: `Data master berhasil di${
          drawerMode === "add" ? "tambah" : "update"
        }.`,
      });
      setIsDrawerOpen(false);
      fetchExaminations(currentPage);
    } catch (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Terjadi Kesalahan",
        message: error.response?.data?.message || `Gagal memproses data.`,
      });
    }
  };

  const availableParents = flatList.filter((item) =>
    parseInt(formData.level) > 1
      ? item.level === parseInt(formData.level) - 1
      : false
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header Utama */}
      <header className="p-8 pb-4 flex justify-between items-center bg-white border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Master Pemeriksaan
          </h1>
          <nav className="text-xs text-gray-400 mt-1 italic">
            Manajemen Database &gt;{" "}
            <span className="text-cyan-700 font-bold">Data Medis</span>
          </nav>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchExaminations(currentPage)}
            className="p-3 text-gray-400 hover:text-cyan-700 bg-white border rounded-xl transition-all"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-100 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>Tambah Data</span>
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
              placeholder="Cari nama pemeriksaan..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none text-right">
            Total Kategori Utama
            <br />
            <span className="text-cyan-700 text-lg">{totalItems}</span>
          </div>
        </div>

        <div className="bg-white border border-t-0 shadow-sm overflow-visible">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-5 w-[35%]">Nama Pemeriksaan</th>
                <th className="p-5 w-[15%]">Level & Kode</th>
                <th className="p-5 w-[20%]">Tipe Input</th>
                <th className="p-5 w-[15%]">Status</th>
                <th className="p-5 w-[15%] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {flatList.map((item) => (
                <tr
                  key={item.id}
                  className={`group transition-all ${
                    item.status === "INACTIVE"
                      ? "bg-gray-50/50 opacity-70"
                      : "hover:bg-cyan-50/20"
                  }`}
                >
                  <td className="p-5 flex items-center">
                    <div
                      style={{ marginLeft: `${item.depth * 24}px` }}
                      className="flex items-center"
                    >
                      {item.level === 1 && (
                        <LayoutList size={16} className="text-cyan-700 mr-2" />
                      )}
                      {item.level === 2 && (
                        <Network size={14} className="text-gray-500 mr-2" />
                      )}
                      {item.level === 3 && (
                        <ChevronRight
                          size={14}
                          className="text-gray-300 mr-1"
                        />
                      )}

                      <div>
                        <div
                          className={`uppercase leading-tight ${
                            item.level === 1
                              ? "font-bold text-cyan-800"
                              : item.level === 2
                              ? "font-semibold text-gray-700"
                              : "font-medium text-gray-600"
                          }`}
                        >
                          {item.name}
                        </div>
                        {item.level === 3 && (
                          <div className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5">
                            urutan tampil: {item.sequenceOrder}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center text-gray-600 font-bold text-xs uppercase mb-1">
                      Level {item.level}
                    </div>
                    <div className="flex items-center text-[10px] text-gray-400 font-mono">
                      <Hash size={10} className="mr-1" />{" "}
                      {item.referenceCode || "-"}
                    </div>
                  </td>

                  <td className="p-5">
                    {item.level === 3 ? (
                      <div className="flex items-center text-cyan-700 font-semibold text-[11px] uppercase bg-cyan-50 px-2.5 py-1 rounded-md w-fit border border-cyan-100">
                        <FileText size={12} className="mr-1.5" />{" "}
                        {item.inputType}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-300 italic uppercase">
                        Tidak Berlaku
                      </div>
                    )}
                  </td>

                  <td className="p-5">
                    {item.status === "ACTIVE" ? (
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
                          activeDropdown === item.id ? null : item.id
                        )
                      }
                      className="text-gray-400 hover:text-cyan-700 hover:bg-cyan-50 p-1.5 rounded-lg transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeDropdown === item.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdown(null)}
                        />
                        <div className="absolute right-14 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl shadow-[0_5px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-3 transition-colors"
                          >
                            <Eye size={16} /> Lihat Detail
                          </button>
                          <button
                            onClick={() => handleOpenUpdate(item)}
                            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-3 transition-colors border-t border-gray-50"
                          >
                            <Edit size={16} /> Edit Data
                          </button>
                          {item.status === "ACTIVE" && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                            >
                              <Trash2 size={16} /> Nonaktifkan
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {flatList.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan="5"
                    className="p-20 text-center text-gray-400 italic"
                  >
                    Data pemeriksaan belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-5 border-t border-gray-50 flex items-center justify-between bg-white rounded-b-2xl shadow-sm border border-t-0">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Menampilkan halaman {currentPage + 1} dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchExaminations(currentPage - 1)}
              disabled={currentPage === 0 || isLoading}
              className="p-2 text-gray-400 hover:text-cyan-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages > 0 ? totalPages : 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchExaminations(i)}
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
              onClick={() => fetchExaminations(currentPage + 1)}
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

      {/* SIDE DRAWER FORM */}
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
                    ? "Tambah Master Baru"
                    : "Update Master Data"}
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Konfigurasi Form Medis
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
                  Save Data
                </button>
              </div>
            </div>

            <form className="p-8 space-y-5 overflow-y-auto flex-1 scrollbar-hide">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Pilih Level <span className="text-red-500">*</span>
                </label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          level: lvl,
                          inputType: lvl < 3 ? "NONE" : "TEXT",
                          parentId: "",
                        }))
                      }
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        parseInt(formData.level) === lvl
                          ? "bg-white text-cyan-700 shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Level {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {parseInt(formData.level) > 1 && (
                <div className="flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Pilih Induk (Parent) Level {parseInt(formData.level) - 1}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm text-gray-700"
                  >
                    <option value="">-- Pilih Induk Pemeriksaan --</option>
                    {availableParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} ({parent.referenceCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nama Pemeriksaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm"
                    placeholder="Contoh: Tekanan Darah"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Kode Referensi{" "}
                    </label>
                    <input
                      name="referenceCode"
                      value={formData.referenceCode}
                      onChange={handleChange}
                      type="text"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="h01p01t01"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Urutan Tampil
                    </label>
                    <input
                      name="sequenceOrder"
                      value={formData.sequenceOrder}
                      onChange={handleChange}
                      type="number"
                      className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {parseInt(formData.level) === 3 && (
                <div className="flex flex-col space-y-1 pt-4 border-t border-dashed animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-1">
                    Konfigurasi Tipe Input Form UI
                  </label>
                  <select
                    name="inputType"
                    value={formData.inputType}
                    onChange={handleChange}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm text-gray-700"
                  >
                    <option value="TEXT">Text Biasa (Singkat)</option>
                    <option value="TEXTAREA">
                      Text Area (Paragraf Panjang)
                    </option>
                    <option value="NUMBER">Number (Angka)</option>
                    <option value="RADIO">Radio Button (Pilih Satu)</option>
                    <option value="CHECKBOX">Checkbox (Pilih Banyak)</option>
                    <option value="SELECT">Dropdown Select</option>
                  </select>
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {/* --- CUSTOM NOTIFICATION MODAL --- */}
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
                    ? "bg-cyan-700 hover:bg-cyan-800 text-white"
                    : "bg-gray-800 hover:bg-gray-900 text-white"
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

export default MasterPemeriksaan;
