// Registration data storage utility
// Menggunakan Laravel Backend API untuk menyimpan data pendaftaran

const API_BASE_URL = 'http://localhost:8000/api';

export interface RegistrationRecord {
    id: string;
    nik: string;
    visitorName: string;
    visitorPhone: string;
    visitorAddress: string;
    inmateName: string;
    inmateNumber?: string;
    relationship: string;
    visitDate: string;
    visitTime?: string;
    roomBlock?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    pengikutLaki?: number;
    pengikutPerempuan?: number;
    pengikutAnak?: number;
    jumlahPengikut?: number;
}

// Mendapatkan semua data pendaftaran (admin)
export async function getAllRegistrations(): Promise<RegistrationRecord[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/registrations`);
        const data = await response.json();
        if (!Array.isArray(data)) return [];
        return data.map((item: any) => ({
            id: item.id,
            nik: item.nik,
            visitorName: item.visitor_name,
            visitorPhone: item.visitor_phone,
            visitorAddress: item.visitor_address,
            inmateName: item.inmate_name,
            inmateNumber: item.inmate_number,
            relationship: item.relationship,
            visitDate: item.visit_date,
            visitTime: item.visit_time,
            roomBlock: item.room_block,
            status: item.status,
            createdAt: item.created_at,
            pengikutLaki: item.pengikut_laki,
            pengikutPerempuan: item.pengikut_perempuan,
            pengikutAnak: item.pengikut_anak,
            jumlahPengikut: item.jumlah_pengikut,
        }));
    } catch (error) {
        console.error('Error reading registration data:', error);
        return [];
    }
}

// Menyimpan pendaftaran baru
export async function saveRegistration(record: Omit<RegistrationRecord, 'id' | 'status' | 'createdAt'>): Promise<RegistrationRecord> {
    try {
        const id = `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const response = await fetch(`${API_BASE_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...record, id }),
        });

        if (!response.ok) throw new Error('Gagal menyimpan pendaftaran');

        const item = await response.json();
        return {
            id: item.id,
            nik: item.nik,
            visitorName: item.visitor_name,
            visitorPhone: item.visitor_phone,
            visitorAddress: item.visitor_address,
            inmateName: item.inmate_name,
            inmateNumber: item.inmate_number,
            relationship: item.relationship,
            visitDate: item.visit_date,
            visitTime: item.visit_time,
            roomBlock: item.room_block,
            status: item.status,
            createdAt: item.created_at,
            pengikutLaki: item.pengikut_laki,
            pengikutPerempuan: item.pengikut_perempuan,
            pengikutAnak: item.pengikut_anak,
            jumlahPengikut: item.jumlah_pengikut,
        };
    } catch (error) {
        console.error('Error saving registration:', error);
        throw new Error('Gagal menyimpan pendaftaran');
    }
}

// Memperbarui status pendaftaran (admin)
export async function updateRegistrationStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/registrations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
    } catch (error) {
        console.error('Error updating registration status:', error);
    }
}

// Mendapatkan pendaftaran berdasarkan NIK (untuk dashboard pengunjung)
export async function getRegistrationsByNIK(nik: string): Promise<RegistrationRecord[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/registrations/status/${nik}`);
        const data = await response.json();
        return data.map((item: any) => ({
            id: item.id,
            nik: item.nik,
            visitorName: item.visitor_name,
            visitorPhone: item.visitor_phone,
            visitorAddress: item.visitor_address,
            inmateName: item.inmate_name,
            inmateNumber: item.inmate_number,
            relationship: item.relationship,
            visitDate: item.visit_date,
            visitTime: item.visit_time,
            roomBlock: item.room_block,
            status: item.status,
            createdAt: item.created_at,
            pengikutLaki: item.pengikut_laki,
            pengikutPerempuan: item.pengikut_perempuan,
            pengikutAnak: item.pengikut_anak,
            jumlahPengikut: item.jumlah_pengikut,
        }));
    } catch (error) {
        console.error('Error fetching data by NIK:', error);
        return [];
    }
}

// Mencari WBP berdasarkan nama
export async function searchWBP(query: string): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/wbps/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error searching WBP:', error);
        return [];
    }
}

// Visit Slot Management
export interface VisitSlot {
    id: number;
    date: string;
    session_name?: string;
    start_time: string;
    end_time: string;
    max_visitors: number;
    is_available: boolean;
}

export async function getAllVisitSlots(): Promise<VisitSlot[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/visit-slots`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching visit slots:', error);
        return [];
    }
}

export async function getAvailableDates(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/visit-slots/available-dates`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching available dates:', error);
        return [];
    }
}

export async function getAvailableTimes(date: string): Promise<VisitSlot[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/visit-slots/available-times/${date}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching available times:', error);
        return [];
    }
}

export async function createVisitSlot(data: {
    date: string,
    session_name?: string,
    start_time: string,
    end_time: string,
    max_visitors?: number
}): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/visit-slots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error('Error creating visit slot:', error);
    }
}

export async function deleteVisitSlot(id: number): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/visit-slots/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error deleting visit slot:', error);
    }
}

export async function toggleVisitSlotAvailability(id: number): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/visit-slots/${id}/toggle`, {
            method: 'PATCH',
        });
    } catch (error) {
        console.error('Error toggling visit slot:', error);
    }
}
