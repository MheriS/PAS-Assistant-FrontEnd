import { useState, useEffect } from 'react';
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
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/registrations/schedule/upcoming`);
                const data = await response.json();

                const mappedVisits = data.map((item: any) => ({
                    id: item.id,
                    visitorName: item.visitor_name,
                    inmateName: item.inmate_name,
                    date: item.visit_date,
                    time: item.visit_time,
                    status: item.status,
                }));

                setVisits(mappedVisits);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, []);

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
                    <h2 className="text-gray-900 mb-1">Jadwal Kunjungan Mendatang</h2>
                    <p className="text-gray-600">
                        Daftar pendaftaran kunjungan yang akan datang
                    </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : visits.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada jadwal kunjungan mendatang</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visits.map((visit) => (
                        <div
                            key={visit.id}
                            className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-all hover:shadow-md"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {new Date(visit.date).toDateString() === new Date().toDateString() ? (
                                            <div className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                HARI INI
                                            </div>
                                        ) : (
                                            <div className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {formatDate(visit.date).split(',')[0]}
                                            </div>
                                        )}
                                        <Clock className="w-4 h-4 text-gray-500 ml-1" />
                                        <span className="text-gray-900 font-bold">{visit.time} WIB</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500 text-xs">{formatDate(visit.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700 mb-1">
                                        <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-blue-600" />
                                        </div>
                                        <span className="text-sm">Pengunjung: <strong className="text-gray-900">{visit.visitorName || 'Bukan Nama'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="w-5 h-5 bg-emerald-50 rounded flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-emerald-600" />
                                        </div>
                                        <span className="text-sm">WBP: <strong className="text-gray-900">{visit.inmateName || 'Bukan Nama'}</strong></span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    {getStatusBadge(visit.status)}
                                    <span className="text-[10px] text-gray-400 font-mono">{visit.id}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && visits.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-500 uppercase tracking-wider">Total jadwal mendatang</span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{visits.length} Kunjungan</span>
                    </div>
                </div>
            )}
        </div>
    );
}
