import { Clock, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function InfoPanel() {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6">
                <h2 className="text-white mb-4">Lapas Narkotika IIA Pamekasan</h2>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-100">Alamat</p>
                            <p className="text-white">Jl. Raya Pamekasan KM 5, Pamekasan, Jawa Timur 69317</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-100">Telepon</p>
                            <p className="text-white">(0324) 322xxx</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-100">Email</p>
                            <p className="text-white">lapas.pamekasan@kemenkumham.go.id</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Jadwal Kunjungan
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-gray-700">Senin - Kamis</span>
                        <span className="text-gray-900">09:00 - 14:00 WIB</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-gray-700">Jumat</span>
                        <span className="text-gray-900">09:00 - 11:00 WIB</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Sabtu - Minggu</span>
                        <span className="text-gray-900">09:00 - 15:00 WIB</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Barang yang Boleh Dibawa
                </h3>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Makanan dalam kemasan (max 2kg)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Uang tunai (max Rp 500.000)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Pakaian dalam (max 3 pasang)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Obat dengan resep dokter</span>
                    </li>
                </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Barang yang Dilarang
                </h3>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Handphone & barang elektronik</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Rokok dan korek api</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Narkoba dan alkohol</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Senjata tajam</span>
                    </li>
                </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-amber-900 mb-2">Perhatian</p>
                        <p className="text-sm text-amber-800">
                            Semua barang bawaan akan diperiksa oleh petugas. Harap membawa dokumen identitas asli untuk verifikasi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
