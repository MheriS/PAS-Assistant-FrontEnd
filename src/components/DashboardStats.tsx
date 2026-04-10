import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function DashboardStats() {
    const stats = [
        {
            title: 'Total Kunjungan Hari Ini',
            value: '42',
            icon: Users,
            color: 'blue',
            trend: '+12% dari kemarin',
        },
        {
            title: 'Pendaftaran Pending',
            value: '15',
            icon: Clock,
            color: 'amber',
            trend: 'Menunggu verifikasi',
        },
        {
            title: 'Kunjungan Selesai',
            value: '128',
            icon: CheckCircle,
            color: 'green',
            trend: 'Minggu ini',
        },
        {
            title: 'Jadwal Besok',
            value: '38',
            icon: Calendar,
            color: 'purple',
            trend: 'Sudah terdaftar',
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
                        className="bg-white rounded-xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${colors.text}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-gray-900 mb-2">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.trend}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
