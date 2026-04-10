import { useState } from 'react';
import { Building2, MessageSquare, FileText, BarChart3, Menu, X } from 'lucide-react';
import ChatAssistant from './components/ChatAssistant';
import RegistrationForm from './components/RegistrationForm';
import InfoPanel from './components/InfoPanel';
import DashboardStats from './components/DashboardStats';
import VisitSchedule from './components/VisitSchedule';

type Tab = 'dashboard' | 'registration' | 'chat' | 'info';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'registration' as Tab, label: 'Daftar Kunjungan', icon: FileText },
    { id: 'chat' as Tab, label: 'Chat Assistant', icon: MessageSquare },
    { id: 'info' as Tab, label: 'Informasi', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl blur-sm opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-900 text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent whitespace-nowrap leading-tight">
                  PAS-Assistant
                </h1>
                <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                  Lapas Pamekasan
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>

            <nav className="hidden md:flex items-center gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
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
        </div>
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
            <DashboardStats />
            <VisitSchedule />
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