const BASE_URL = 'http://localhost:4000';

export interface SentenceResult {
  text: string;
  isPlagiarized: boolean;
  similarityScore: number;
  matchedSource: { url: string; title: string } | null;
}

export interface SourceResult {
  url: string;
  title: string;
  snippet: string;
  matchCount: number;
  matchedSentences: string[];
}

export interface ReportData {
  reportId: string;
  plagiarismScore: number;
  aiScore: number;
  humanScore: number;
  sentences: SentenceResult[];
  sources: SourceResult[];
  summary: {
    totalSentences: number;
    plagiarizedSentences: number;
    uniqueSentences: number;
    plagiarismRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';
    aiContentRisk: 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';
    topSources: Array<{ url: string; title: string; matchCount: number }>;
  };
}

export interface UploadResult {
  fileId: string | null;
  originalName: string | null;
  extractedText: string;
  wordCount: number;
  charCount: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}/api${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.errors?.[0]?.msg || `Request failed with status ${response.status}`);
  }
  return data.data;
}

export const api = {
  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed');
    return data.data;
  },

  async checkPlagiarism(text: string, fileName?: string, inputType: 'TEXT' | 'FILE' = 'TEXT'): Promise<ReportData> {
    return request<ReportData>('/check-plagiarism', {
      method: 'POST',
      body: JSON.stringify({ text, fileName, inputType }),
    });
  },

  async detectAI(text: string) {
    return request('/detect-ai', { method: 'POST', body: JSON.stringify({ text }) });
  },

  async getReport(id: string): Promise<ReportData> {
    return request<ReportData>(`/report/${id}`);
  },

  async downloadPDF(reportId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/report/${reportId}/pdf`);
    if (!response.ok) throw new Error('PDF generation failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aiverify-report-${reportId.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};