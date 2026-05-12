import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    memo
} from 'react';

import {
    Send,
    Bot,
    User,
    Trash2,
    MessageCircle
} from 'lucide-react';

import { API_BASE_URL } from '../config';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
    id: '1',
    text: 'Selamat datang di PAS-Assistant! Saya siap membantu Anda dengan informasi seputar kunjungan ke Lapas Narkotika IIA Pamekasan.',
    sender: 'assistant',
    timestamp: new Date(),
};

const ChatMessage = memo(({ message }: { message: Message }) => {
    return (
        <div
            className={`flex gap-3 ${message.sender === 'user'
                    ? 'flex-row-reverse'
                    : 'flex-row'
                }`}
        >
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
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
                <p className="whitespace-pre-wrap">
                    {message.text}
                </p>

                <p
                    className={`text-xs mt-1 ${message.sender === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                >
                    {message.timestamp.toLocaleTimeString(
                        'id-ID',
                        {
                            hour: '2-digit',
                            minute: '2-digit',
                        }
                    )}
                </p>
            </div>
        </div>
    );
});

export default function ChatAssistant() {
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem(
            'pas_chat_messages'
        );

        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                return parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                }));
            } catch (e) {
                console.error(e);
            }
        }

        return [INITIAL_MESSAGE];
    });

    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] =
        useState(false);

    const scrollContainerRef =
        useRef<HTMLDivElement>(null);

    /*
    =========================
    AUTO SCROLL
    =========================
    */

    /*
    =========================
    SEND MESSAGE
    =========================
    */

    const handleSend = useCallback(
        async (
            textOverride?: string,
            forceSend = false
        ) => {
            const textToSend =
                textOverride ?? input;

            if (
                !textToSend.trim() ||
                (isThinking && !forceSend)
            ) {
                return;
            }

            const userMessage: Message = {
                id: Date.now().toString(),
                text: textToSend,
                sender: 'user',
                timestamp: new Date(),
            };

            setMessages((prev) => [
                ...prev,
                userMessage,
            ]);

            setInput('');
            setIsThinking(true);

            const controller =
                new AbortController();

            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 10000); // Increased timeout for Python processing

            try {
                console.time('chatbot');

                const response = await fetch(
                    `${API_BASE_URL}/chatbot`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify({
                            message: textToSend,
                        }),
                        signal: controller.signal,
                    }
                );

                clearTimeout(timeoutId);

                const data =
                    await response.json();

                console.timeEnd('chatbot');

                const aiText =
                    data.response ||
                    'Maaf, saya sedang tidak dapat merespon.';

                const assistantMessage: Message =
                {
                    id: (
                        Date.now() + 1
                    ).toString(),
                    text: aiText,
                    sender: 'assistant',
                    timestamp: new Date(),
                };

                setMessages((prev) => [
                    ...prev,
                    assistantMessage,
                ]);
            } catch (error: any) {
                console.error(error);

                let errorText =
                    'Maaf, koneksi ke server gagal.';

                if (
                    error.name ===
                    'AbortError'
                ) {
                    errorText =
                        'Server terlalu lama merespon.';
                }

                const errorMessage: Message =
                {
                    id: (
                        Date.now() + 1
                    ).toString(),
                    text: errorText,
                    sender: 'assistant',
                    timestamp: new Date(),
                };

                setMessages((prev) => [
                    ...prev,
                    errorMessage,
                ]);
            } finally {
                setIsThinking(false);
            }
        },
        [input, isThinking]
    );

    /*
    =========================
    AUTO SCROLL
    =========================
    */

    useEffect(() => {
        requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({
                    top: scrollContainerRef.current
                        .scrollHeight,
                    behavior: 'smooth',
                });
            }
        });
    }, [messages]);

    /*
    =========================
    SAVE CHAT (OPTIMIZED)
    =========================
    */

    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem(
                'pas_chat_messages',
                JSON.stringify(messages)
            );
        }, 500);

        return () => clearTimeout(timeout);
    }, [messages]);

    /*
    =========================
    ENTER KEY
    =========================
    */

    const handleKeyPress = (
        e: React.KeyboardEvent
    ) => {
        if (
            e.key === 'Enter' &&
            !e.shiftKey
        ) {
            e.preventDefault();

            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-border">
            {/* HEADER */}

            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6" />
                    </div>

                    <div>
                        <h3 className="text-white">
                            PAS-Assistant
                        </h3>

                        <p className="text-blue-100 text-sm">
                            AI Layanan
                            Kunjungan
                        </p>
                    </div>
                </div>

            <div className="flex gap-1">
                <button
                    onClick={() => {
                        if (
                            confirm(
                                'Hapus semua chat?'
                            )
                        ) {
                            setMessages([
                                {
                                    ...INITIAL_MESSAGE,
                                    timestamp:
                                        new Date(),
                                },
                            ]);

                            localStorage.removeItem(
                                'pas_chat_messages'
                            );
                        }
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
            </div>

            {/* CHAT */}

            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                    />
                ))}

                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-gray-700" />
                        </div>

                        <div className="bg-gray-100 p-3 rounded-lg">
                            <span className="text-sm text-gray-500">
                                Memproses...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT */}

            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) =>
                            setInput(
                                e.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyPress
                        }
                        placeholder="Ketik pesan..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={() =>
                            handleSend()
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />

                        <span>Kirim</span>
                    </button>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 items-center">
                    {[
                        'Jadwal',
                        'Syarat',
                        'Barang',
                    ].map((chip) => (
                        <button
                            key={chip}
                            onClick={() =>
                                setInput(chip)
                            }
                            className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                            {chip}
                        </button>
                    ))}

                    <div className="flex-1"></div>

                    <a
                        href="https://wa.me/6282143317094"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full flex items-center gap-1"
                    >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}