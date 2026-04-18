import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

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
                const response = await fetch('http://localhost:8000/api/dashboard/stats');
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
            trend: 'Semua pendaftaran',
        },
        {
            title: 'Pendaftaran Pending',
            value: statsData.pending.toString(),
            icon: Clock,
            color: 'amber',
            trend: 'Menunggu verifikasi',
        },
        {
            title: 'Disetujui',
            value: statsData.approved.toString(),
            icon: CheckCircle,
            color: 'green',
            trend: 'Kunjungan valid',
        },
        {
            title: 'Kunjungan Hari Ini',
            value: statsData.today.toString(),
            icon: Calendar,
            color: 'purple',
            trend: 'Terdaftar hari ini',
        },
    ];

    const colorClasses = {
        blue: {
            bg: 'bg-blue-100',
            text: 'text-blue-600',
            border: 'border-blue-200',
        },
        amber: {
            bg: 'bg-amber-100',
            text: 'text-amber-600',
            border: 'border-amber-200',
        },
        green: {
            bg: 'bg-green-100',
            text: 'text-green-600',
            border: 'border-green-200',
        },
        purple: {
            bg: 'bg-purple-100',
            text: 'text-purple-600',
            border: 'border-purple-200',
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
                        className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-all hover:scale-[1.02] duration-300"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${colors.text}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600 mb-1 font-medium">{stat.title}</p>
                            <p className="text-2xl font-black text-gray-900 mb-1">{stat.value}</p>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.trend}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
