// Visitor data storage utility
// Uses localStorage for demo - can be upgraded to Supabase backend

export interface VisitorData {
    nik: string;
    name: string;
    phone: string;
    address: string;
    relationship: string;
    lastVisit?: string;
    visitCount?: number;
}

const STORAGE_KEY = 'pas_visitors_data';

// Get all visitors
export function getAllVisitors(): VisitorData[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading visitor data:', error);
        return [];
    }
}

// Find visitor by NIK
export function findVisitorByNIK(nik: string): VisitorData | null {
    const visitors = getAllVisitors();
    return visitors.find(v => v.nik === nik) || null;
}

// Save or update visitor data
export function saveVisitor(visitorData: VisitorData): void {
    try {
        const visitors = getAllVisitors();
        const existingIndex = visitors.findIndex(v => v.nik === visitorData.nik);

        if (existingIndex >= 0) {
            // Update existing visitor
            visitors[existingIndex] = {
                ...visitors[existingIndex],
                ...visitorData,
                visitCount: (visitors[existingIndex].visitCount || 0) + 1,
                lastVisit: new Date().toISOString(),
            };
        } else {
            // Add new visitor
            visitors.push({
                ...visitorData,
                visitCount: 1,
                lastVisit: new Date().toISOString(),
            });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
    } catch (error) {
        console.error('Error saving visitor data:', error);
        throw new Error('Gagal menyimpan data pengunjung');
    }
}

// Get visitor statistics
export function getVisitorStats() {
    const visitors = getAllVisitors();
    return {
        total: visitors.length,
        totalVisits: visitors.reduce((sum, v) => sum + (v.visitCount || 0), 0),
    };
}
