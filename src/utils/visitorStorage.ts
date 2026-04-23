import { API_BASE_URL } from '../config';

export interface VisitorData {
    nik: string;
    name: string;
    phone: string;
    address: string;
    relationship: string;
    gender: string;
    lastVisit?: string;
    visitCount?: number;
}

// Find visitor by NIK
export async function findVisitorByNIK(nik: string): Promise<VisitorData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/visitors/${nik}`);
        if (!response.ok) return null;

        const data = await response.json();
        if (!data || !data.nik) return null;

        return {
            nik: data.nik,
            name: data.name,
            phone: data.phone,
            address: data.address,
            relationship: data.relationship,
            gender: data.gender,
            lastVisit: data.last_visit,
            visitCount: data.visit_count,
        };
    } catch (error) {
        console.error('Error finding visitor:', error);
        return null;
    }
}

// Save or update visitor data
export async function saveVisitor(visitorData: VisitorData): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/visitors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitorData),
        });
    } catch (error) {
        console.error('Error saving visitor data:', error);
        throw new Error('Gagal menyimpan data pengunjung');
    }
}

