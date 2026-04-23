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

import { API_BASE_URL } from '../config';

export default function VisitSchedule() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');


    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/registrations/schedule/upcoming`);
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

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'all' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Semua
                    {activeTab === 'all' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'pending' ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Pending
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600 rounded-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'approved' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Disetujui
                    {activeTab === 'approved' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === 'rejected' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Ditolak
                    {activeTab === 'rejected' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full"></div>
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : visits.filter(v => activeTab === 'all' || v.status === activeTab).length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {activeTab === 'all' ? 'Belum ada jadwal kunjungan mendatang' : `Tidak ada pendaftaran dengan status ${activeTab}`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visits
                        .filter((visit) => activeTab === 'all' || visit.status === activeTab)
                        .map((visit) => (
                            <div
                                key={visit.id}
                                className="border border-border rounded-lg p-4 hover:bg-gray-50 transition-all hover:shadow-md h-full flex flex-col justify-between"
                            >
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {new Date(visit.date).toDateString() === new Date().toDateString() ? (
                                                <div className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                    HARI INI
                                                </div>
                                            ) : (
                                                <div className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    {formatDate(visit.date).split(',')[0]}
                                                </div>
                                            )}
                                        </div>
                                        {getStatusBadge(visit.status)}
                                    </div>

                                    <div className="flex items-center gap-2 mb-3 text-sm">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900 font-bold">{visit.time} WIB</span>
                                        <span className="text-gray-300 mx-1">|</span>
                                        <span className="text-gray-500 text-xs">{formatDate(visit.date)}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 leading-none mb-0.5">PENGUNJUNG</span>
                                                <span className="text-sm font-bold text-gray-900 truncate">{visit.visitorName || 'Bukan Nama'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 leading-none mb-0.5">WARGA BINAAN (WBP)</span>
                                                <span className="text-sm font-bold text-gray-900 truncate">{visit.inmateName || 'Bukan Nama'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {visit.id}</span>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {!isLoading && visits.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-500 uppercase tracking-wider">
                            {activeTab === 'all' ? 'Total jadwal mendatang' : `Total ${activeTab}`}
                        </span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            {visits.filter(v => activeTab === 'all' || v.status === activeTab).length} Kunjungan
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
