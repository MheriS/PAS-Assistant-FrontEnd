import { useState, useEffect, useRef } from 'react';
import { getAllWBP, recordMovement, createWBP, generateNoRegs, type WBPRecord } from '@/utils/WBPService';
import { Search, Plus, UserPlus, LogIn, LogOut, LayoutGrid, Users, RefreshCw, Camera, X } from 'lucide-react';

export default function AdminWBPManager() {
    const [wbps, setWbps] = useState<WBPRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [newWBP, setNewWBP] = useState({
        nama: '',
        no_regs: '',
        jenis_kelamin: 'Laki-laki',
        perkara: '',
        blok: '',
        kamar: '',
        foto: '',
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getAllWBP(currentPage, searchTerm);
            setWbps(data.data);
            setTotalPages(data.last_page);
        } catch (error) {
            console.error('Error fetching WBP:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

    const handleOpenAddForm = async () => {
        setIsLoading(true);
        try {
            const { no_regs } = await generateNoRegs();
            setNewWBP(prev => ({ ...prev, no_regs }));
            setShowAddForm(true);
        } catch (error) {
            console.error('Error generating no_regs:', error);
            setShowAddForm(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewWBP(prev => ({ ...prev, foto: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMovement = async (id: number, type: 'masuk' | 'keluar') => {
        const keterangan = prompt(`Keterangan ${type} (opsional):`);
        if (keterangan === null) return;

        try {
            await recordMovement(id, type, new Date().toISOString(), keterangan);
            fetchData();
        } catch (error) {
            alert('Gagal mencatat pergerakan');
        }
    };

    const handleAddWBP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createWBP(newWBP);
            setShowAddForm(false);
            setNewWBP({
                nama: '',
                no_regs: '',
                jenis_kelamin: 'Laki-laki',
                perkara: '',
                blok: '',
                kamar: '',
                foto: '',
            });
            fetchData();
        } catch (error) {
            alert('Gagal menambah WBP. Pastikan semua data benar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari WBP (Nama atau No. Regis)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={() => showAddForm ? setShowAddForm(false) : handleOpenAddForm()}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
                >
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (showAddForm ? <LayoutGrid className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
                    {showAddForm ? 'Lihat Daftar' : 'Tambah WBP Baru'}
                </button>
            </div>

            {showAddForm ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                        Pendaftaran WBP Baru
                    </h3>
                    <form onSubmit={handleAddWBP} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-32 h-40 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group">
                                    {newWBP.foto ? (
                                        <>
                                            <img src={newWBP.foto} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setNewWBP(prev => ({ ...prev, foto: '' }))}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Camera className="w-10 h-10" />
                                            <span className="text-xs font-bold">Ambil Foto</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Lengkap</label>
                            <input
                                type="text"
                                value={newWBP.nama}
                                onChange={(e) => setNewWBP({ ...newWBP, nama: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                placeholder="Masukkan nama sesuai KTP"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nomor Registrasi (Otomatis)</label>
                            <input
                                type="text"
                                value={newWBP.no_regs}
                                readOnly
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl outline-none font-bold cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Jenis Kelamin</label>
                            <select
                                value={newWBP.jenis_kelamin}
                                onChange={(e) => setNewWBP({ ...newWBP, jenis_kelamin: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Perkara / Kasus</label>
                            <input
                                type="text"
                                value={newWBP.perkara}
                                onChange={(e) => setNewWBP({ ...newWBP, perkara: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Blok</label>
                            <input
                                type="text"
                                value={newWBP.blok}
                                onChange={(e) => setNewWBP({ ...newWBP, blok: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Kamar</label>
                            <input
                                type="text"
                                value={newWBP.kamar}
                                onChange={(e) => setNewWBP({ ...newWBP, kamar: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Simpan Data WBP
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <RefreshCw className="w-12 h-12 text-blue-500 mx-auto animate-spin mb-4" />
                                <p className="text-gray-500">Memuat data WBP...</p>
                            </div>
                        ) : wbps.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Tidak ada data WBP ditemukan</p>
                            </div>
                        ) : (
                            wbps.map((wbp) => (
                                <div key={wbp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                                    <div className="p-6">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {wbp.foto ? (
                                                        <img src={wbp.foto} alt={wbp.nama} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <LayoutGrid className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{wbp.nama}</h3>
                                                    <p className="text-xs text-gray-500">No. Regs: <span className="font-semibold">{wbp.no_regs}</span></p>
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold border transition-all ${wbp.status === 'aktif'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {wbp.status === 'aktif' ? 'DI DALAM' : 'DI LUAR'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Perkara</p>
                                                <p className="text-sm font-semibold text-gray-800">{wbp.perkara}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Lokasi</p>
                                                <p className="text-sm font-semibold text-emerald-700">Blok {wbp.blok} / Kamar {wbp.kamar}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Jenis Kelamin</p>
                                                <p className="text-sm font-medium text-gray-800">{wbp.jenis_kelamin}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {wbp.status === 'aktif' ? (
                                                    <button
                                                        onClick={() => handleMovement(wbp.id, 'keluar')}
                                                        className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all font-bold group"
                                                    >
                                                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> WBP Keluar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMovement(wbp.id, 'masuk')}
                                                        className="w-full bg-emerald-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-bold shadow-sm shadow-emerald-100 group"
                                                    >
                                                        <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> WBP Masuk
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 py-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                            >
                                Sebelumnya
                            </button>
                            <span className="text-sm text-gray-500 font-medium">Halaman {currentPage} dari {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
