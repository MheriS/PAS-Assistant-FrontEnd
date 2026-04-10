import { useState } from 'react';
import { Calendar, User, IdCard, Phone, Home, FileText, CheckCircle, Search, Scan, UserCheck, UserPlus } from 'lucide-react';
import { findVisitorByNIK, saveVisitor, type VisitorData } from '@/utils/visitorStorage';

interface FormData {
    visitorName: string;
    visitorId: string;
    visitorPhone: string;
    visitorAddress: string;
    inmateName: string;
    inmateNumber: string;
    relationship: string;
    visitDate: string;
    visitTime: string;
}

export default function RegistrationForm() {
    const [nikInput, setNikInput] = useState('');
    const [nikChecked, setNikChecked] = useState(false);
    const [isReturningVisitor, setIsReturningVisitor] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        visitorName: '',
        visitorId: '',
        visitorPhone: '',
        visitorAddress: '',
        inmateName: '',
        inmateNumber: '',
        relationship: '',
        visitDate: '',
        visitTime: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleNikSearch = () => {
        if (!nikInput || nikInput.length !== 16) {
            alert('Masukkan NIK dengan benar (16 digit)');
            return;
        }

        setIsSearching(true);

        // Simulate scanning/searching animation
        setTimeout(() => {
            const existingVisitor = findVisitorByNIK(nikInput);

            if (existingVisitor) {
                // Auto-fill data for returning visitor
                setFormData({
                    ...formData,
                    visitorId: existingVisitor.nik,
                    visitorName: existingVisitor.name,
                    visitorPhone: existingVisitor.phone,
                    visitorAddress: existingVisitor.address,
                    relationship: existingVisitor.relationship,
                });
                setIsReturningVisitor(true);
            } else {
                // New visitor - set NIK only
                setFormData({
                    ...formData,
                    visitorId: nikInput,
                });
                setIsReturningVisitor(false);
            }

            setNikChecked(true);
            setIsSearching(false);
        }, 800);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Save visitor data to storage
        try {
            const visitorData: VisitorData = {
                nik: formData.visitorId,
                name: formData.visitorName,
                phone: formData.visitorPhone,
                address: formData.visitorAddress,
                relationship: formData.relationship,
            };

            saveVisitor(visitorData);
            setSubmitted(true);

            setTimeout(() => {
                setSubmitted(false);
                setNikChecked(false);
                setNikInput('');
                setIsReturningVisitor(false);
                setFormData({
                    visitorName: '',
                    visitorId: '',
                    visitorPhone: '',
                    visitorAddress: '',
                    inmateName: '',
                    inmateNumber: '',
                    relationship: '',
                    visitDate: '',
                    visitTime: '',
                });
            }, 3000);
        } catch (error) {
            alert('Terjadi kesalahan saat menyimpan data');
        }
    };

    const handleResetNik = () => {
        setNikChecked(false);
        setNikInput('');
        setIsReturningVisitor(false);
        setFormData({
            visitorName: '',
            visitorId: '',
            visitorPhone: '',
            visitorAddress: '',
            inmateName: '',
            inmateNumber: '',
            relationship: '',
            visitDate: '',
            visitTime: '',
        });
    };

    if (submitted) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-green-600 mb-2">Pendaftaran Berhasil!</h2>
                <p className="text-gray-600">
                    Nomor registrasi Anda: <strong>PAS-{Date.now().toString().slice(-8)}</strong>
                </p>
                <p className="text-gray-600 mt-2">
                    Silakan cek email/SMS untuk konfirmasi kunjungan.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-gray-900 mb-1">Formulir Pendaftaran Kunjungan</h2>
                <p className="text-gray-600">
                    {!nikChecked ? 'Masukkan NIK untuk memulai pendaftaran' : 'Lengkapi data berikut untuk mendaftar kunjungan'}
                </p>
            </div>

            {!nikChecked ? (
                // NIK Input Step - First Step
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Scan className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-bold">Scan / Cek NIK Pengunjung</h3>
                                <p className="text-sm text-gray-600">Masukkan NIK untuk cek data pengunjung</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nikInput" className="text-gray-700 font-medium block mb-2">
                                    NIK (Nomor Induk Kependudukan) *
                                </label>
                                <input
                                    type="text"
                                    id="nikInput"
                                    value={nikInput}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 16) {
                                            setNikInput(value);
                                        }
                                    }}
                                    maxLength={16}
                                    placeholder="Masukkan 16 digit NIK"
                                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isSearching}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {nikInput.length}/16 digit
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleNikSearch}
                                disabled={nikInput.length !== 16 || isSearching}
                                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${nikInput.length === 16 && !isSearching
                                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSearching ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Mencari Data...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Scan / Cari Data Pengunjung
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-2">
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-blue-900 font-medium">Informasi:</p>
                                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                                    <li>Jika NIK sudah terdaftar, data akan terisi otomatis</li>
                                    <li>Jika NIK baru, Anda akan mengisi data lengkap</li>
                                    <li>Pastikan NIK sesuai dengan KTP Anda</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Full Form - After NIK is checked
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status indicator */}
                    <div className={`border-2 rounded-lg p-4 ${isReturningVisitor ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isReturningVisitor ? 'bg-green-600' : 'bg-blue-600'}`}>
                                {isReturningVisitor ? (
                                    <UserCheck className="w-6 h-6 text-white" />
                                ) : (
                                    <UserPlus className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold ${isReturningVisitor ? 'text-green-900' : 'text-blue-900'}`}>
                                    {isReturningVisitor ? 'Pengunjung Terdaftar!' : 'Pengunjung Baru'}
                                </h3>
                                <p className={`text-sm ${isReturningVisitor ? 'text-green-700' : 'text-blue-700'}`}>
                                    {isReturningVisitor
                                        ? 'Data Anda telah terisi otomatis. Silakan periksa dan lanjutkan.'
                                        : 'NIK belum terdaftar. Silakan lengkapi data Anda di bawah.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetNik}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Ganti NIK
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Data Pengunjung
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="visitorId" className="text-gray-700 block mb-2">
                                    NIK (No. KTP) *
                                </label>
                                <input
                                    type="text"
                                    id="visitorId"
                                    name="visitorId"
                                    value={formData.visitorId}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="visitorName" className="text-gray-700 block mb-2">
                                    Nama Lengkap *
                                </label>
                                <input
                                    type="text"
                                    id="visitorName"
                                    name="visitorName"
                                    value={formData.visitorName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nama lengkap sesuai KTP"
                                />
                            </div>
                            <div>
                                <label htmlFor="visitorPhone" className="text-gray-700 block mb-2">
                                    No. Telepon *
                                </label>
                                <input
                                    type="tel"
                                    id="visitorPhone"
                                    name="visitorPhone"
                                    value={formData.visitorPhone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="08xxx"
                                />
                            </div>
                            <div>
                                <label htmlFor="relationship" className="text-gray-700 block mb-2">
                                    Hubungan dengan WBP *
                                </label>
                                <select
                                    id="relationship"
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih hubungan</option>
                                    <option value="keluarga">Keluarga Inti</option>
                                    <option value="saudara">Saudara</option>
                                    <option value="kuasa-hukum">Kuasa Hukum</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="visitorAddress" className="text-gray-700 block mb-2">
                                Alamat Lengkap *
                            </label>
                            <textarea
                                id="visitorAddress"
                                name="visitorAddress"
                                value={formData.visitorAddress}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Alamat sesuai KTP"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                            <IdCard className="w-5 h-5 text-blue-600" />
                            Data Warga Binaan (WBP)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="inmateName" className="text-gray-700 block mb-2">
                                    Nama WBP *
                                </label>
                                <input
                                    type="text"
                                    id="inmateName"
                                    name="inmateName"
                                    value={formData.inmateName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nama warga binaan"
                                />
                            </div>
                            <div>
                                <label htmlFor="inmateNumber" className="text-gray-700 block mb-2">
                                    No. Register WBP *
                                </label>
                                <input
                                    type="text"
                                    id="inmateNumber"
                                    name="inmateNumber"
                                    value={formData.inmateNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="No. register"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Jadwal Kunjungan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="visitDate" className="text-gray-700 block mb-2">
                                    Tanggal Kunjungan *
                                </label>
                                <input
                                    type="date"
                                    id="visitDate"
                                    name="visitDate"
                                    value={formData.visitDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="visitTime" className="text-gray-700 block mb-2">
                                    Waktu Kunjungan *
                                </label>
                                <select
                                    id="visitTime"
                                    name="visitTime"
                                    value={formData.visitTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Pilih waktu</option>
                                    <option value="09:00">09:00 - 10:00 WIB</option>
                                    <option value="10:00">10:00 - 11:00 WIB</option>
                                    <option value="11:00">11:00 - 12:00 WIB</option>
                                    <option value="13:00">13:00 - 14:00 WIB</option>
                                    <option value="14:00">14:00 - 15:00 WIB</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-2">
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-blue-900">Catatan Penting:</p>
                                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                                    <li>Harap datang 15 menit sebelum waktu kunjungan</li>
                                    <li>Bawa dokumen asli untuk verifikasi</li>
                                    <li>Patuhi tata tertib dan aturan kunjungan</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Daftar Kunjungan
                    </button>
                </form>
            )}
        </div>
    );
}
