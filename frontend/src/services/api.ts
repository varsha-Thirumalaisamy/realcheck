/**
 * Forensic API Service Layer for REALCHECK AI
 * Connects to the FastAPI backend.
 */
import { InvestigationResult, CrossMediaFusionResult, ModelInsightItem } from '../types/forensics';
import { SAMPLE_CASES } from '../data/sampleCases';

const BACKEND_URL = 'http://localhost:8000/api';

class ForensicApiService {
  async checkHealth(): Promise<{ status: string; online: boolean }> {
    try {
      const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { status: data.status, online: true };
      }
    } catch {
      // Backend offline or timeout
    }
    return { status: 'OFFLINE', online: false };
  }

  async getInvestigations(): Promise<InvestigationResult[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/investigations`);
      if (!res.ok) throw new Error('Failed to fetch investigations');
      const data = await res.json();
      const sampleCasesList = Object.values(SAMPLE_CASES);
      const existingIds = new Set(data.map((c: any) => c.case_id));
      const missingSamples = sampleCasesList.filter((c: any) => !existingIds.has(c.case_id));
      return [...data, ...missingSamples];
    } catch (err) {
      return Object.values(SAMPLE_CASES);
    }
  }

  async getInvestigation(caseId: string): Promise<InvestigationResult> {
    try {
      const res = await fetch(`${BACKEND_URL}/investigations/${caseId}`);
      if (!res.ok) {
        if (SAMPLE_CASES[caseId]) return SAMPLE_CASES[caseId];
        throw new Error(`Case ${caseId} not found`);
      }
      return await res.json();
    } catch (err) {
      if (SAMPLE_CASES[caseId]) return SAMPLE_CASES[caseId];
      throw err;
    }
  }

  async analyzeMedia(
    mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT',
    fileOrText?: File | string,
    sampleId?: string
  ): Promise<InvestigationResult> {
    if (sampleId && SAMPLE_CASES[sampleId]) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return SAMPLE_CASES[sampleId];
    }

    const formData = new FormData();
    if (fileOrText instanceof File) {
      formData.append('file', fileOrText);
    } else if (typeof fileOrText === 'string') {
      formData.append('text', fileOrText);
    }
    if (sampleId) {
      formData.append('sample_id', sampleId);
    }

    const endpoint = `${BACKEND_URL}/analyze/${mediaType.toLowerCase()}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Failed to analyze ${mediaType}`);
    }
    return await res.json();
  }

  async fuseInvestigations(caseIds: string[]): Promise<CrossMediaFusionResult> {
    if (caseIds.length === 0) {
      throw new Error('Please select at least one case to fuse.');
    }
    
    const res = await fetch(`${BACKEND_URL}/investigations/fuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseIds)
    });
    
    if (!res.ok) throw new Error('Fusion failed');
    return await res.json();
  }

  async getModelInsights(): Promise<ModelInsightItem[]> {
    const res = await fetch(`${BACKEND_URL}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();
    return data.models;
  }

  downloadJson(caseId: string) {
    window.open(`${BACKEND_URL}/investigations/reports/${caseId}?format=json`, '_blank');
  }

  downloadCsv(caseId: string) {
    window.open(`${BACKEND_URL}/investigations/reports/${caseId}?format=csv`, '_blank');
  }
}

export const forensicApi = new ForensicApiService();
