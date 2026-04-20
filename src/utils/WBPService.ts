const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface WBPRecord {
    id: number;
    nama: string;
    no_regs: string;
    jenis_kelamin: string;
    perkara: string;
    blok: string;
    kamar: string;
    foto?: string;
    status: 'aktif' | 'keluar';
    created_at?: string;
    updated_at?: string;
}

export interface WBPResponse {
    data: WBPRecord[];
    current_page: number;
    last_page: number;
    total: number;
}

export const getAllWBP = async (page = 1, query = ''): Promise<WBPResponse> => {
    const response = await fetch(`${API_BASE_URL}/wbps?page=${page}&q=${query}`);
    return await response.json();
};

export const generateNoRegs = async (): Promise<{ no_regs: string }> => {
    const response = await fetch(`${API_BASE_URL}/wbps/generate-no-reg`);
    return await response.json();
};

export const createWBP = async (data: Omit<WBPRecord, 'id' | 'status'>): Promise<WBPRecord> => {
    const response = await fetch(`${API_BASE_URL}/wbps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
};

export const updateWBP = async (id: number, data: Partial<WBPRecord>): Promise<WBPRecord> => {
    const response = await fetch(`${API_BASE_URL}/wbps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return await response.json();
};

export const recordMovement = async (id: number, type: 'masuk' | 'keluar', tanggal: string, keterangan?: string) => {
    const response = await fetch(`${API_BASE_URL}/wbps/${id}/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, tanggal, keterangan }),
    });
    return await response.json();
};
