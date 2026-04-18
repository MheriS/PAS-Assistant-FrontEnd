import { useState } from 'react';
import { Building2, MessageSquare, FileText, BarChart3, Menu, X, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import ChatAssistant from './components/ChatAssistant';
import RegistrationForm from './components/RegistrationForm';
import InfoPanel from './components/InfoPanel';
import DashboardStats from './components/DashboardStats';
import VisitSchedule from './components/VisitSchedule';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { getRegistrationsByNIK, type RegistrationRecord } from './utils/registrationStorage';

type Tab = 'dashboard' | 'registration' | 'chat' | 'info' | 'admin' | 'status';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(localStorage.getItem('is_admin_logged_in') === 'true');
  const [statusNik, setStatusNik] = useState('');
  const [visitorRegistrations, setVisitorRegistrations] = useState<RegistrationRecord[]>([]);

  const handleAdminLogin = (status: boolean) => {
    setIsAdminLoggedIn(status);
    if (status) setActiveTab('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('is_admin_logged_in');
    setIsAdminLoggedIn(false);
    setActiveTab('dashboard');
  };

  const handleCheckStatus = async () => {
    if (statusNik.length === 16) {
      const data = await getRegistrationsByNIK(statusNik);
      setVisitorRegistrations(data);
    }
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'registration' as Tab, label: 'Daftar Kunjungan', icon: FileText },
    { id: 'status' as Tab, label: 'Cek Status', icon: CheckCircle2 },
    { id: 'chat' as Tab, label: 'Chat Assistant', icon: MessageSquare },
    { id: 'info' as Tab, label: 'Informasi', icon: Building2 },
    { id: 'admin' as Tab, label: isAdminLoggedIn ? 'Admin Panel' : 'Admin Login', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-11 h-11 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden lg:flex flex-col">
                <h1 className="text-gray-900 text-lg font-black tracking-tight leading-none">PAS-Assistant</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Lapas Pamekasan</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/50">
              {tabs.filter(t => !['admin'].includes(t.id)).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-white text-blue-600 shadow-md border border-gray-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                      }`}
                  >
                    <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={isActive ? 'block' : 'hidden xl:block'}>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:block h-8 w-[1px] bg-gray-200 mx-1"></div>
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/20'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Shield className="w-5 h-5" />
                <span className="hidden lg:block">{isAdminLoggedIn ? 'Admin Panel' : 'Admin'}</span>
              </button>

              {isAdminLoggedIn ? (
                <button
                  onClick={handleAdminLogout}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl hover:bg-gray-100"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 px-4 border-t border-gray-100 bg-white shadow-xl animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-600'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Dashboard Monitoring</h2>
              <p className="text-gray-600">
                Pantau statistik dan jadwal kunjungan Lapas Narkotika IIA Pamekasan
              </p>
            </div>
            {!isAdminLoggedIn && <DashboardStats />}
            <VisitSchedule />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Cek Status Pendaftaran</h2>
              <p className="text-gray-600">
                Masukkan NIK Anda untuk melihat status pendaftaran kunjungan
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  maxLength={16}
                  value={statusNik}
                  onChange={(e) => setStatusNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan 16 digit NIK"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleCheckStatus}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  Cek Status
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {visitorRegistrations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">Masukkan NIK untuk melihat data pendaftaran Anda</p>
                </div>
              ) : (
                visitorRegistrations.map((reg) => (
                  <div key={reg.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.id}</h3>
                      <p className="text-sm text-gray-500">WBP: {reg.inmateName} | Tanggal: {reg.visitDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${reg.status === 'approved' ? 'bg-green-100 text-green-700' :
                        reg.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isAdminLoggedIn ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Panel Administrasi</h2>
                  <p className="text-gray-600 font-medium">
                    Layanan pengelolaan pendaftaran kunjungan Lapas Pamekasan
                  </p>
                </div>
                <AdminDashboard />
              </>
            ) : (
              <div className="py-12">
                <AdminLogin onLogin={handleAdminLogin} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'registration' && (
          <div>
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Pendaftaran Kunjungan</h2>
              <p className="text-gray-600">
                Daftarkan kunjungan Anda secara online untuk memudahkan proses administrasi
              </p>
            </div>
            <RegistrationForm />
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Chat dengan AI Assistant</h2>
              <p className="text-gray-600">
                Tanya jawab seputar informasi kunjungan, jadwal, dan prosedur
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <ChatAssistant />
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div>
            <div className="mb-8">
              <h2 className="text-gray-900 mb-2">Informasi & Peraturan</h2>
              <p className="text-gray-600">
                Informasi lengkap mengenai jadwal, kontak, dan peraturan kunjungan
              </p>
            </div>
            <InfoPanel />
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg">PAS-Assistant</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sistem layanan kunjungan terpadu berbasis AI untuk Lapas Narkotika IIA Pamekasan
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Kontak</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">📞</span> (0324) 322xxx
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">✉️</span> lapas.pamekasan@kemenkumham.go.id
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Jam Operasional</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex justify-between">
                  <span>Senin - Kamis:</span>
                  <span className="text-gray-300">09:00 - 14:00</span>
                </p>
                <p className="flex justify-between">
                  <span>Jumat:</span>
                  <span className="text-gray-300">09:00 - 11:00</span>
                </p>
                <p className="flex justify-between">
                  <span>Sabtu - Minggu:</span>
                  <span className="text-gray-300">09:00 - 15:00</span>
                </p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2026 Lapas Narkotika IIA Pamekasan. Kementerian Hukum dan HAM Republik Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}