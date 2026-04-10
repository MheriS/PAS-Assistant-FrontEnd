import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Visit {
    id: string;
    visitorName: string;
    inmateName: string;
    date: string;
    time: string;
    status: 'approved' | 'pending' | 'rejected';
}

export default function VisitSchedule() {
    const visits: Visit[] = [
        {
            id: 'PAS-00012345',
            visitorName: 'Siti Aminah',
            inmateName: 'Ahmad Fauzi',
            date: '2026-04-07',
            time: '09:00',
            status: 'approved',
        },
        {
            id: 'PAS-00012346',
            visitorName: 'Budi Santoso',
            inmateName: 'Dedi Kurniawan',
            date: '2026-04-07',
            time: '10:00',
            status: 'approved',
        },
        {
            id: 'PAS-00012347',
            visitorName: 'Rina Wijaya',
            inmateName: 'Eko Prasetyo',
            date: '2026-04-07',
            time: '10:00',
            status: 'pending',
        },
        {
            id: 'PAS-00012348',
            visitorName: 'Agus Supriyanto',
            inmateName: 'Firman Maulana',
            date: '2026-04-07',
            time: '11:00',
            status: 'approved',
        },
        {
            id: 'PAS-00012349',
            visitorName: 'Dewi Lestari',
            inmateName: 'Hendra Setiawan',
            date: '2026-04-07',
            time: '13:00',
            status: 'pending',
        },
        {
            id: 'PAS-00012350',
            visitorName: 'Muhammad Rifki',
            inmateName: 'Imam Bukhori',
            date: '2026-04-07',
            time: '14:00',
            status: 'rejected',
        },
    ];

    const getStatusBadge = (status: Visit['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Disetujui
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        <XCircle className="w-4 h-4" />
                        Ditolak
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-gray-900 mb-1">Jadwal Kunjungan Besok</h2>
                    <p className="text-gray-600">
                        {formatDate('2026-04-07')}
                    </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-4">
                {visits.map((visit) => (
                    <div
                        key={visit.id}
                        className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-900">{visit.time} WIB</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-600 text-sm">{visit.id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 mb-1">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>Pengunjung: <strong>{visit.visitorName}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>WBP: <strong>{visit.inmateName}</strong></span>
                                </div>
                            </div>
                            <div>
                                {getStatusBadge(visit.status)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total jadwal besok</span>
                    <span className="text-gray-900">{visits.length} kunjungan</span>
                </div>
            </div>
        </div>
    );
}
