import { useState, useEffect } from 'react';
import { getAllRegistrations, updateRegistrationStatus, type RegistrationRecord } from '@/utils/registrationStorage';
import { CheckCircle, XCircle, Clock, Search, MapPin, User, FileText, Calendar, LayoutGrid, Users } from 'lucide-react';

export default function AdminDashboard() {
    const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllRegistrations();
            setRegistrations(data);
        };
        fetchData();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        await updateRegistrationStatus(id, status);
        const data = await getAllRegistrations();
        setRegistrations(data);
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            reg.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.inmateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === 'all' || reg.status === filter;

        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari pengunjung, WBP, atau No. Regis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${filter === f
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all' ? 'Semua' : f === 'pending' ? 'Tertunda' : f === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Tidak ada pendaftaran yang ditemukan</p>
                    </div>
                ) : (
                    filteredRegistrations.map((reg) => (
                        <div key={reg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{reg.id}</h3>
                                            <p className="text-xs text-gray-500">Dibuat pada: {new Date(reg.createdAt).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(reg.status)}`}>
                                        {reg.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pengunjung</p>
                                                <p className="text-gray-900 font-medium">{reg.visitorName}</p>
                                                <p className="text-sm text-gray-600">{reg.nik}</p>
                                                <p className="text-sm text-gray-600">{reg.visitorPhone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Alamat</p>
                                                <p className="text-sm text-gray-700 leading-tight">{reg.visitorAddress}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <LayoutGrid className="w-5 h-5 text-emerald-500 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">WBP (Warga Binaan)</p>
                                                <p className="text-gray-900 font-medium">{reg.inmateName}</p>
                                                <p className="text-sm font-semibold text-emerald-700">{reg.roomBlock || 'Belum diisi'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-gray-400 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Hubungan</p>
                                                <p className="text-sm text-gray-700 capitalize">{reg.relationship}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Jadwal Kunjungan</p>
                                                <p className="text-gray-900 font-medium">{new Date(reg.visitDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                <p className="text-sm font-bold text-blue-600">{reg.visitTime} WIB</p>
                                            </div>
                                        </div>
                                        {reg.jumlahPengikut && reg.jumlahPengikut > 0 ? (
                                            <div className="flex items-start gap-3 mt-2 pt-2 border-t border-gray-50">
                                                <Users className="w-5 h-5 text-orange-500 mt-1" />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Pengikut ({reg.jumlahPengikut})</p>
                                                    <p className="text-xs text-gray-600">
                                                        L: {reg.pengikutLaki} | P: {reg.pengikutPerempuan} | A: {reg.pengikutAnak}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-col justify-end gap-2">
                                        {reg.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(reg.id, 'approved')}
                                                    className="w-full bg-emerald-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                                                    className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all font-medium"
                                                >
                                                    <XCircle className="w-4 h-4" /> Tolak
                                                </button>
                                            </>
                                        )}
                                        {reg.status !== 'pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                                            >
                                                Kembalikan ke Pending
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
);
