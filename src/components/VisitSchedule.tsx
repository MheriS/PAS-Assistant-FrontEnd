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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        DISETUJUI
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" />
                        PENDING
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-800 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <XCircle className="w-3.5 h-3.5" />
                        DITOLAK
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
        <div className="bg-white rounded-sm shadow-md border border-slate-300 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">Jadwal Kunjungan Mendatang</h2>
                    <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase">
                        Daftar Usulan dan Pendaftaran Kunjungan Warga Binaan
                    </p>
                </div>
                <div className="bg-slate-100 p-3 rounded-sm border border-slate-200">
                    <Calendar className="w-6 h-6 text-slate-700" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === 'all' ? 'text-blue-800 bg-blue-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                >
                    Semua
                    {activeTab === 'all' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-blue-800"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === 'pending' ? 'text-amber-800 bg-amber-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                >
                    Menunggu Verifikasi
                    {activeTab === 'pending' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-amber-600"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === 'approved' ? 'text-emerald-800 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                >
                    Telah Disetujui
                    {activeTab === 'approved' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-emerald-600"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${activeTab === 'rejected' ? 'text-red-800 bg-red-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                >
                    Ditolak
                    {activeTab === 'rejected' && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-red-600"></div>
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : visits.filter(v => activeTab === 'all' || v.status === activeTab).length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-300">
                    <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold tracking-wide uppercase text-sm">
                        {activeTab === 'all' ? 'TIDAK ADA DATA JADWAL KUNJUNGAN' : `TIDAK ADA PENDAFTARAN DENGAN STATUS ${activeTab.toUpperCase()}`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visits
                        .filter((visit) => activeTab === 'all' || visit.status === activeTab)
                        .map((visit) => (
                            <div
                                key={visit.id}
                                className="bg-white border border-slate-200 border-l-4 border-l-blue-800 rounded-sm p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                                <div className="mb-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {new Date(visit.date).toDateString() === new Date().toDateString() ? (
                                                <div className="bg-rose-700 text-white px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                    HARI INI
                                                </div>
                                            ) : (
                                                <div className="bg-slate-800 text-slate-100 px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                                    {formatDate(visit.date).split(',')[0]}
                                                </div>
                                            )}
                                        </div>
                                        {getStatusBadge(visit.status)}
                                    </div>

                                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-900 font-bold">{visit.time} WIB</span>
                                        <span className="text-slate-300 mx-1">|</span>
                                        <span className="text-slate-500 text-xs font-semibold uppercase">{formatDate(visit.date)}</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <User className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">NAMA PENGUNJUNG</span>
                                                <span className="text-sm font-bold text-slate-900 leading-tight">{visit.visitorName || 'TIDAK TERDAFTAR'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <User className="w-4 h-4 text-blue-700" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">WARGA BINAAN (WBP)</span>
                                                <span className="text-sm font-bold text-slate-900 leading-tight">{visit.inmateName || 'TIDAK TERDAFTAR'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[9px] text-slate-400 font-mono tracking-widest">REG-ID: {visit.id.substring(0, 8)}...</span>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {!isLoading && visits.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-slate-500 uppercase tracking-widest text-[10px]">
                            {activeTab === 'all' ? 'AKUMULASI SELURUH JADWAL' : `TOTAL STATUS: ${activeTab}`}
                        </span>
                        <span className="bg-slate-900 text-white px-4 py-1.5 rounded-sm text-[11px] tracking-widest uppercase shadow-sm">
                            {visits.filter(v => activeTab === 'all' || v.status === activeTab).length} DATA
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
