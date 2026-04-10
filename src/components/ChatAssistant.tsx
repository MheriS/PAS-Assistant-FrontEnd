import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

const FAQ_RESPONSES: { [key: string]: string } = {
    'jadwal': 'Jadwal kunjungan Lapas Narkotika IIA Pamekasan:\n• Senin - Kamis: 09.00 - 14.00 WIB\n• Jumat: 09.00 - 11.00 WIB\n• Sabtu - Minggu: 09.00 - 15.00 WIB',
    'syarat': 'Syarat kunjungan:\n1. KTP/Identitas asli dan fotokopi\n2. Surat izin dari RT/RW (untuk kunjungan pertama)\n3. Kartu keluarga (khusus keluarga)\n4. Sudah melakukan pendaftaran online\n5. Pakaian sopan dan rapi',
    'barang': 'Barang yang boleh dibawa:\n• Makanan dalam kemasan (max 2kg)\n• Uang tunai (max Rp 500.000)\n• Pakaian dalam (max 3 pasang)\n• Obat-obatan dengan resep dokter\n\nBarang yang DILARANG:\n• Handphone, rokok, senjata tajam\n• Narkoba dan alkohol\n• Barang elektronik',
    'daftar': 'Cara pendaftaran:\n1. Akses website atau aplikasi PAS-Assistant\n2. Pilih menu "Daftar Kunjungan"\n3. Isi data pengunjung dan WBP\n4. Pilih tanggal dan waktu kunjungan\n5. Upload dokumen persyaratan\n6. Tunggu konfirmasi via SMS/Email',
    'durasi': 'Durasi kunjungan maksimal 60 menit per sesi. Jika antrian sedikit, waktu bisa diperpanjang sesuai kebijakan petugas.',
    'kontak': 'Kontak Lapas Narkotika IIA Pamekasan:\n📞 Telepon: (0324) 322xxx\n📧 Email: lapas.pamekasan@kemenkumham.go.id\n📍 Alamat: Jl. Raya Pamekasan KM 5, Pamekasan, Jawa Timur',
};

export default function ChatAssistant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Selamat datang di PAS-Assistant! Saya siap membantu Anda dengan informasi seputar kunjungan ke Lapas Narkotika IIA Pamekasan. Ada yang bisa saya bantu?',
            sender: 'assistant',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateResponse = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('jadwal') || lowerMessage.includes('jam')) {
            return FAQ_RESPONSES['jadwal'];
        } else if (lowerMessage.includes('syarat') || lowerMessage.includes('persyaratan')) {
            return FAQ_RESPONSES['syarat'];
        } else if (lowerMessage.includes('barang') || lowerMessage.includes('bawa')) {
            return FAQ_RESPONSES['barang'];
        } else if (lowerMessage.includes('daftar') || lowerMessage.includes('pendaftaran')) {
            return FAQ_RESPONSES['daftar'];
        } else if (lowerMessage.includes('durasi') || lowerMessage.includes('lama')) {
            return FAQ_RESPONSES['durasi'];
        } else if (lowerMessage.includes('kontak') || lowerMessage.includes('telepon') || lowerMessage.includes('alamat')) {
            return FAQ_RESPONSES['kontak'];
        } else if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello')) {
            return 'Halo! Saya PAS-Assistant. Silakan tanyakan tentang:\n• Jadwal kunjungan\n• Syarat dan prosedur\n• Barang bawaan\n• Cara pendaftaran\n• Kontak Lapas';
        } else {
            return 'Maaf, saya belum memahami pertanyaan Anda. Silakan tanyakan tentang: jadwal, syarat, barang bawaan, cara pendaftaran, durasi kunjungan, atau kontak Lapas.';
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        setTimeout(() => {
            const response = generateResponse(input);
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'assistant',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        }, 500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-border">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white">PAS-Assistant</h3>
                        <p className="text-blue-100 text-sm">AI Layanan Kunjungan</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            {message.sender === 'user' ? (
                                <User className="w-5 h-5 text-white" />
                            ) : (
                                <Bot className="w-5 h-5 text-gray-700" />
                            )}
                        </div>
                        <div
                            className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.text}</p>
                            <p
                                className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}
                            >
                                {message.timestamp.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik pertanyaan Anda..."
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    />
                    <button
                        onClick={handleSend}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Kirim
                    </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {['Jadwal', 'Syarat', 'Barang', 'Kontak'].map((chip) => (
                        <button
                            key={chip}
                            onClick={() => setInput(chip)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
