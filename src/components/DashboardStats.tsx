import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

import { API_BASE_URL } from '../config';

export default function DashboardStats() {
    const [statsData, setStatsData] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        today: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
                const data = await response.json();
                setStatsData(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        {
            title: 'Total Kunjungan',
            value: statsData.total.toString(),
            icon: Users,
            color: 'blue',
            trend: 'Semua Usulan',
        },
        {
            title: 'Pendaftaran Pending',
            value: statsData.pending.toString(),
            icon: Clock,
            color: 'amber',
            trend: 'Menunggu Verifikasi',
        },
        {
            title: 'Telah Disetujui',
            value: statsData.approved.toString(),
            icon: CheckCircle,
            color: 'green',
            trend: 'Kunjungan Valid',
        },
        {
            title: 'Kunjungan Hari Ini',
            value: statsData.today.toString(),
            icon: Calendar,
            color: 'purple',
            trend: 'Terjadwal Hari Ini',
        },
    ];

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-t-blue-800',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-t-amber-600',
        },
        green: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-t-emerald-600',
        },
        purple: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-t-indigo-600',
        },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colors = colorClasses[stat.color as keyof typeof colorClasses];

                return (
                    <div
                        key={index}
                        className={`bg-white rounded-sm shadow-md border border-slate-300 border-t-4 ${colors.border} p-6 hover:shadow-lg hover:border-slate-400 transition-all duration-300`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${colors.bg} border border-slate-200 rounded-sm flex items-center justify-center shadow-inner`}>
                                <Icon className={`w-6 h-6 ${colors.text}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-600 mb-1 font-bold text-[11px] uppercase tracking-wider">{stat.title}</p>
                            <p className="text-3xl font-black text-slate-900 mb-1 leading-none">{stat.value}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{stat.trend}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
