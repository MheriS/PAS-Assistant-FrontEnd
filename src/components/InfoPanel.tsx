import { Clock, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle, ShieldAlert, Smartphone, Waves, BoxSelect, Info, Building2 } from 'lucide-react';

export default function InfoPanel() {
    const forbiddenFoods = [
        "Makanan serbuk/bubuk", "Mie instan", "Rokok & Korek api",
        "Kacang kulit/atom", "Rambak", "Roti", "Bumbu pecel/sambal", "Permen",
        "Makanan berongga", "Cumi-cumi utuh", "Serundeng/Abon", "Perkedel & tahu",
        "Pentol/Bakso", "Gorengan", "Cabe & Bawang", "Masakan berkuah", "Minuman berwarna"
    ];

    const forbiddenPersonalCare = [
        "Parfum & Roll on", "Sikat & Pasta gigi", "Sabun cuci", "Kosmetik & Sachet"
    ];

    const forbiddenPackaging = [
        "Kemasan Kaca", "Kaleng", "Botol Plastik"
    ];

    const forbiddenMain = [
        "HP & Barang Elektronik", "Narkoba & Alkohol",
        "Senjata Tajam/Api", "Kasur dan sejenisnya", "Pakaian dibatasi maksimal 2 potong (dilarang jeans & topi)"
    ];

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-2xl shadow-xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MapPin className="w-32 h-32 -mr-16 -mt-16" />
                </div>
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <Building2 className="w-8 h-8" />
                    Lapas Narkotika IIA Pamekasan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Alamat Utama</p>
                                <p className="text-sm font-medium leading-relaxed">Jl. Raya Pamekasan KM 5, Pamekasan, Jawa Timur 69317</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Hubungi Kami</p>
                                <p className="text-sm font-medium">(0324) 322xxx</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-blue-200" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">Email Resmi</p>
                                <p className="text-sm font-medium">lapas.pamekasan@kemenkumham.go.id</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Schedule & Allowed */}
                <div className="space-y-8">
                    {/* Schedule */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-fit">
                        <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="font-black text-gray-900 tracking-tight">Jadwal Layanan Kunjungan</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="font-bold text-gray-700">Selasa</span>
                                <span className="font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg text-sm">08:00 - 11:00 WIB</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="font-bold text-gray-700">Kamis</span>
                                <span className="font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg text-sm">08:00 - 11:00 WIB</span>
                            </div>
                        </div>
                    </div>

                    {/* Allowed Items */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <h3 className="font-black text-gray-900 tracking-tight">Barang yang Diperbolehkan</h3>
                        </div>
                        <div className="p-6">
                            <ul className="grid grid-cols-1 gap-3">
                                {[
                                    { label: "Makanan kemasan (max 10kg)", detail: "Harus dalam segel pabrik" },
                                    { label: "Uang tunai (max Rp 1.000.000)", detail: "Untuk penitipan di kantin/layanan" },
                                    { label: "Pakaian dalam (max 2 helai)", detail: "Harus baru/bersih" },
                                    { label: "Obat dengan resep dokter", detail: "Wajib lapor petugas medis" }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 p-3 rounded-xl bg-green-50/30 border border-green-100/50">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.detail}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Info className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-black text-amber-900 text-lg mb-1">Informasi Penting!</p>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                    Semua barang bawaan wajib melalui pemeriksaan X-Ray dan pemeriksaan manual oleh petugas keamanan. Pelanggaran akan dikenakan sanksi sesuai aturan Lapas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Prohibited Items - REFINED UI */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-red-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <h3 className="font-black text-gray-900 tracking-tight">Daftar Larangan (Prohibited)</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 1. Main & Personal Care Grouped */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest mb-3">
                                    <ShieldAlert className="w-3 h-3" /> Larangan Utama
                                </div>
                                <div className="space-y-2">
                                    {forbiddenMain.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                            <span className="text-xs font-bold text-gray-700 leading-tight">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest mb-3">
                                    <Waves className="w-3 h-3" /> Perawatan Diri
                                </div>
                                <div className="space-y-2">
                                    {forbiddenPersonalCare.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2.5">
                                            <div className="w-1.5 h-1.5 bg-red-300 rounded-full mt-1.5 flex-shrink-0"></div>
                                            <span className="text-xs font-bold text-gray-700 leading-tight">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Packaging */}
                        <div className="bg-red-50/30 rounded-2xl p-4 border border-red-100/50">
                            <div className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest mb-3">
                                <BoxSelect className="w-3 h-3" /> Jenis Kemasan Terlarang
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {forbiddenPackaging.map((item, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white border border-red-100 rounded-lg text-xs font-black text-red-600 shadow-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 3. Makanan & Minuman - Multi Column Grid */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100 flex justify-between items-center">
                                <span>Makanan & Minuman (Semua)</span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px]">{forbiddenFoods.length} Item</span>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                {forbiddenFoods.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 group">
                                        <XCircle className="w-3 h-3 text-red-200 group-hover:text-red-400 transition-colors" />
                                        <span className="text-[11px] font-medium text-gray-600 truncate">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-600 p-4 text-center">
                        <p className="text-white text-[11px] font-black tracking-tight uppercase">
                            Dilarang Keras Memasukkan Barang Titipan Secara Ilegal
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
