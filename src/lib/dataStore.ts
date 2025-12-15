/**
 * POC Data Store Service
 * 
 * In production (when served by backend), always uses PostgreSQL API.
 * In development (npm run dev), uses localStorage unless VITE_API_URL is set.
 */

import type { POCRequest, POCStatus } from '../types';

const STORAGE_KEY = 'morpheus_poc_requests';

// In production, the frontend is served by the backend, so API is at /api
// In development, use VITE_API_URL if set, otherwise use localStorage
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? '/api' : (import.meta.env.VITE_API_URL || '');

// Determine if we're using API mode
const useAPI = (): boolean => isProduction || !!import.meta.env.VITE_API_URL;

console.log('DataStore mode:', useAPI() ? 'API' : 'localStorage', '| API URL:', API_BASE_URL);

// ============================================================================
// API HELPERS
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || `HTTP ${response.status}` };
    }

    return result;
  } catch (error) {
    console.error('API request failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Convert API response (snake_case) to frontend format (camelCase)
function mapApiToFrontend(apiData: any): POCRequest {
  return {
    id: apiData.id,
    referenceId: apiData.reference_id,
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at,
    requestor: {
      name: apiData.requestor_name,
      email: apiData.requestor_email,
      type: apiData.requestor_type,
      company: apiData.requestor_company || '',
      region: apiData.requestor_region,
      opportunityId: apiData.opportunity_id || '',
    },
    customer: {
      name: apiData.customer_name,
      industry: apiData.customer_industry,
      country: apiData.customer_country || '',
      contactName: apiData.customer_contact_name || '',
      contactEmail: apiData.customer_contact_email || '',
    },
    pocDetails: {
      useCaseDescription: apiData.use_case_description,
      businessJustification: apiData.business_justification || '',
      duration: apiData.poc_duration,
      startDate: apiData.start_date || '',
      expectedEndDate: apiData.expected_end_date || '',
      successCriteria: apiData.success_criteria || '',
      dealSize: apiData.deal_size || 'unknown',
      environmentReady: apiData.environment_ready ?? true,
    },
    datacenters: apiData.datacenters || [],
    publicCloud: apiData.public_cloud || [],
    kubernetesClusters: apiData.kubernetes_clusters || [],
    integrations: apiData.integrations || {
      automation: ['none'],
      itsm: 'none',
      itsmDetails: '',
      loadBalancer: ['none'],
      dnsIpam: ['none'],
      otherIntegrations: '',
    },
    calculations: {
      onPremSockets: apiData.on_prem_sockets || 0,
      publicCloudSockets: apiData.public_cloud_sockets || 0,
      kubernetesSockets: apiData.kubernetes_sockets || 0,
      totalSockets: apiData.total_sockets || 0,
    },
    status: apiData.status,
    outcomeDetails: apiData.outcome_details,
    licenseKey: apiData.license_key,
    approvedBy: apiData.approved_by,
    approvedAt: apiData.approved_at,
    internalNotes: apiData.internal_notes,
  };
}

// Convert frontend format to API format
function mapFrontendToApi(request: POCRequest): any {
  return {
    referenceId: request.referenceId, // Pass the frontend-generated reference ID
    requestor: {
      name: request.requestor.name,
      email: request.requestor.email,
      type: request.requestor.type,
      company: request.requestor.company || undefined,
      region: request.requestor.region,
      opportunityId: request.requestor.opportunityId || undefined,
    },
    customer: {
      name: request.customer.name,
      industry: request.customer.industry,
      country: request.customer.country || undefined,
      contactName: request.customer.contactName || undefined,
      contactEmail: request.customer.contactEmail || undefined,
    },
    pocDetails: {
      useCaseDescription: request.pocDetails.useCaseDescription,
      businessJustification: request.pocDetails.businessJustification || undefined,
      duration: request.pocDetails.duration,
      startDate: request.pocDetails.startDate || undefined,
      expectedEndDate: request.pocDetails.expectedEndDate || undefined,
      successCriteria: request.pocDetails.successCriteria || '',
      dealSize: request.pocDetails.dealSize || 'unknown',
      environmentReady: request.pocDetails.environmentReady ?? true,
    },
    datacenters: request.datacenters,
    publicCloud: request.publicCloud,
    kubernetesClusters: request.kubernetesClusters,
    integrations: request.integrations,
    calculations: request.calculations,
  };
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

function getLocalRequests(): POCRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalRequests(requests: POCRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all POC requests
 */
export async function getAllPOCRequestsAsync(): Promise<POCRequest[]> {
  if (useAPI()) {
    const result = await apiRequest<any[]>('/poc-requests');
    if (result.success && result.data) {
      return result.data.map(mapApiToFrontend);
    }
    return [];
  }
  return getLocalRequests();
}

// Sync version for backward compatibility
export function getAllPOCRequests(): POCRequest[] {
  if (useAPI()) {
    console.warn('getAllPOCRequests is sync but API mode is enabled. Use getAllPOCRequestsAsync instead.');
    return [];
  }
  return getLocalRequests();
}

/**
 * Get a single POC request by Reference ID
 */
export async function getPOCByReferenceIdAsync(referenceId: string): Promise<POCRequest | null> {
  if (useAPI()) {
    const result = await apiRequest<any>(`/poc-requests/search/${encodeURIComponent(referenceId)}`);
    if (result.success && result.data) {
      return mapApiToFrontend(result.data);
    }
    return null;
  }
  const requests = getLocalRequests();
  return requests.find(r => r.referenceId === referenceId) || null;
}

// Sync version for backward compatibility
export function getPOCByReferenceId(referenceId: string): POCRequest | null {
  if (useAPI()) {
    console.warn('getPOCByReferenceId is sync but API mode is enabled. Use getPOCByReferenceIdAsync instead.');
    return null;
  }
  const requests = getLocalRequests();
  return requests.find(r => r.referenceId === referenceId) || null;
}

/**
 * Get a single POC request by UUID
 */
export function getPOCById(id: string): POCRequest | null {
  const requests = getLocalRequests();
  return requests.find(r => r.id === id) || null;
}

/**
 * Save a new POC request
 */
export async function savePOCRequestAsync(request: POCRequest): Promise<POCRequest> {
  if (useAPI()) {
    const apiData = mapFrontendToApi(request);
    const result = await apiRequest<any>('/poc-requests', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
    if (result.success && result.data) {
      return mapApiToFrontend(result.data);
    }
    throw new Error(result.error || 'Failed to save POC request');
  }
  
  // Local storage mode
  const requests = getLocalRequests();
  const existing = requests.find(r => r.referenceId === request.referenceId);
  if (existing) {
    throw new Error(`POC with reference ID ${request.referenceId} already exists`);
  }
  
  const newRequest: POCRequest = {
    ...request,
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
  };
  
  requests.push(newRequest);
  saveLocalRequests(requests);
  
  return newRequest;
}

// Sync version for backward compatibility
export function savePOCRequest(request: POCRequest): POCRequest {
  if (useAPI()) {
    throw new Error('savePOCRequest is sync but API mode is enabled. Use savePOCRequestAsync instead.');
  }
  
  const requests = getLocalRequests();
  const existing = requests.find(r => r.referenceId === request.referenceId);
  if (existing) {
    throw new Error(`POC with reference ID ${request.referenceId} already exists`);
  }
  
  const newRequest: POCRequest = {
    ...request,
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
  };
  
  requests.push(newRequest);
  saveLocalRequests(requests);
  
  return newRequest;
}

/**
 * Update an existing POC request
 */
export function updatePOCRequest(id: string, updates: Partial<POCRequest>): POCRequest | null {
  const requests = getLocalRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  requests[index] = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveLocalRequests(requests);
  return requests[index];
}

/**
 * Update POC status with admin action
 */
export async function updatePOCStatusAsync(
  id: string, 
  status: POCStatus, 
  adminComment: string,
  approvedBy: string
): Promise<POCRequest | null> {
  console.log('updatePOCStatusAsync called:', { id, status, adminComment, approvedBy, useAPI: useAPI() });
  
  if (useAPI()) {
    const payload = { status, approvedBy, comment: adminComment };
    console.log('Sending PATCH request to /poc-requests/' + id + '/status with:', payload);
    
    const result = await apiRequest<any>(`/poc-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    
    console.log('PATCH response:', result);
    
    if (result.success && result.data) {
      return mapApiToFrontend(result.data);
    }
    console.error('PATCH failed:', result.error);
    return null;
  }
  
  // Local storage mode
  return updatePOCStatus(id, status, adminComment, approvedBy);
}

// Sync version for backward compatibility
export function updatePOCStatus(
  id: string, 
  status: POCStatus, 
  adminComment: string,
  approvedBy: string
): POCRequest | null {
  const requests = getLocalRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  
  requests[index] = {
    ...requests[index],
    status,
    updatedAt: now,
    approvedBy,
    approvedAt: status === 'Approved' || status === 'Active' ? now : undefined,
    internalNotes: adminComment 
      ? `${requests[index].internalNotes || ''}\n[${now}] ${approvedBy}: ${adminComment}`.trim()
      : requests[index].internalNotes,
  };
  
  saveLocalRequests(requests);
  return requests[index];
}

/**
 * Soft delete a POC request (async for API mode)
 */
export async function deletePOCRequestAsync(
  id: string,
  deletedBy: string = 'admin@hpe.com'
): Promise<boolean> {
  console.log('deletePOCRequestAsync called:', { id, deletedBy, useAPI: useAPI() });
  
  if (useAPI()) {
    const result = await apiRequest<any>(`/poc-requests/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ deletedBy }),
    });
    
    console.log('DELETE response:', result);
    return result.success;
  }
  
  // Local storage mode - actually remove from storage
  return deletePOCRequest(id);
}

/**
 * Delete a POC request (admin only) - sync version for localStorage
 */
export function deletePOCRequest(id: string): boolean {
  const requests = getLocalRequests();
  const filtered = requests.filter(r => r.id !== id);
  
  if (filtered.length === requests.length) return false;
  
  saveLocalRequests(filtered);
  return true;
}

/**
 * Reset all data - soft delete all records
 */
export async function resetAllDataAsync(
  deletedBy: string = 'admin@hpe.com'
): Promise<{ success: boolean; deletedCount: number }> {
  console.log('resetAllDataAsync called:', { deletedBy, useAPI: useAPI() });
  
  if (useAPI()) {
    const result = await apiRequest<{ deletedCount: number }>('/poc-requests/reset', {
      method: 'POST',
      body: JSON.stringify({ deletedBy, confirmReset: 'RESET_ALL_DATA' }),
    });
    
    console.log('RESET response:', result);
    return { 
      success: result.success, 
      deletedCount: (result.data as any)?.deletedCount || 0 
    };
  }
  
  // Local storage mode - clear all data
  const requests = getLocalRequests();
  const count = requests.length;
  saveLocalRequests([]);
  return { success: true, deletedCount: count };
}

// ============================================================================
// QUERY & FILTER OPERATIONS
// ============================================================================

export interface POCFilters {
  status?: POCStatus[];
  region?: string[];
  requestorType?: string[];
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Get filtered POC requests
 */
export async function getFilteredPOCRequestsAsync(filters: POCFilters): Promise<POCRequest[]> {
  if (useAPI()) {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    if (filters.status && filters.status.length === 1) params.append('status', filters.status[0]);
    if (filters.region && filters.region.length === 1) params.append('region', filters.region[0]);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await apiRequest<any[]>(`/poc-requests${query}`);
    if (result.success && result.data) {
      return result.data.map(mapApiToFrontend);
    }
    return [];
  }
  
  return getFilteredPOCRequests(filters);
}

// Sync version for backward compatibility
export function getFilteredPOCRequests(filters: POCFilters): POCRequest[] {
  let requests = getLocalRequests();
  
  if (filters.status && filters.status.length > 0) {
    requests = requests.filter(r => filters.status!.includes(r.status));
  }
  
  if (filters.region && filters.region.length > 0) {
    requests = requests.filter(r => filters.region!.includes(r.requestor.region));
  }
  
  if (filters.requestorType && filters.requestorType.length > 0) {
    requests = requests.filter(r => filters.requestorType!.includes(r.requestor.type));
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    requests = requests.filter(r => 
      r.referenceId.toLowerCase().includes(term) ||
      r.customer.name.toLowerCase().includes(term) ||
      r.requestor.name.toLowerCase().includes(term) ||
      r.requestor.email.toLowerCase().includes(term) ||
      (r.requestor.opportunityId && r.requestor.opportunityId.toLowerCase().includes(term))
    );
  }
  
  if (filters.dateFrom) {
    requests = requests.filter(r => r.createdAt >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    requests = requests.filter(r => r.createdAt <= filters.dateTo!);
  }
  
  return requests.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface POCStats {
  total: number;
  pending: number;
  approved: number;
  active: number;
  completed: number;
  rejected: number;
  expired: number;
  avgDuration: number;
  totalSockets: number;
}

/**
 * Get POC statistics
 */
export async function getPOCStatsAsync(): Promise<POCStats> {
  if (useAPI()) {
    const result = await apiRequest<any>('/poc-requests/stats');
    if (result.success && result.data) {
      return {
        total: result.data.total || 0,
        pending: result.data.pending || 0,
        approved: result.data.approved || 0,
        active: result.data.active || 0,
        completed: result.data.completed || 0,
        rejected: result.data.rejected || 0,
        expired: result.data.expired || 0,
        avgDuration: result.data.avgDuration || 0,
        totalSockets: result.data.totalSockets || 0,
      };
    }
  }
  return getPOCStats();
}

// Sync version for backward compatibility
export function getPOCStats(): POCStats {
  const requests = getLocalRequests();
  
  const stats: POCStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending Review').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    active: requests.filter(r => r.status === 'Active').length,
    completed: requests.filter(r => r.status === 'Completed').length,
    rejected: requests.filter(r => r.status === 'Cancelled').length,
    expired: requests.filter(r => r.status === 'Expired').length,
    avgDuration: 0,
    totalSockets: requests.reduce((sum, r) => sum + r.calculations.totalSockets, 0),
  };
  
  const durations = requests.map(r => r.pocDetails.duration);
  if (durations.length > 0) {
    stats.avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }
  
  return stats;
}

// ============================================================================
// DEMO DATA (for testing)
// ============================================================================

export function loadDemoData(): void {
  if (useAPI()) return; // Demo data is server-side in API mode
  
  const existing = getLocalRequests();
  if (existing.length > 0) return;
  
  const demoRequests: POCRequest[] = [
    {
      id: 'demo-1',
      referenceId: 'POC-2024-ABC123',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      requestor: {
        name: 'John Smith',
        email: 'john.smith@partner.com',
        type: 'partner-engineer',
        company: 'AC3',
        region: 'anz',
        opportunityId: 'OPP-789456',
      },
      customer: {
        name: 'Sydney Water Corporation',
        industry: 'government',
        country: 'Australia',
        contactName: 'Jane Doe',
        contactEmail: 'jane.doe@sydneywater.com.au',
      },
      pocDetails: {
        useCaseDescription: 'VMware migration to Morpheus with self-service portal',
        businessJustification: 'Cost reduction initiative after Broadcom acquisition',
        duration: 45,
        startDate: '2024-01-15',
        expectedEndDate: '2024-03-01',
        successCriteria: 'Successfully migrate 50 VMs and deploy self-service catalog',
        dealSize: '100k-250k',
        environmentReady: true,
      },
      datacenters: [
        { id: 'dc1', name: 'Sydney DC1', hypervisor: 'vmware-vsphere', hosts: 12, socketsPerHost: 2 }
      ],
      publicCloud: [{ provider: 'aws', vms: 45 }],
      kubernetesClusters: [
        { id: 'k8s1', name: 'Production EKS', distribution: 'eks', workers: 30, location: 'aws' }
      ],
      integrations: {
        automation: ['ansible-tower', 'terraform'],
        itsm: 'servicenow',
        itsmDetails: 'SNOW integration for CMDB sync',
        loadBalancer: ['f5-bigip'],
        dnsIpam: ['infoblox'],
        otherIntegrations: '',
      },
      calculations: { onPremSockets: 24, publicCloudSockets: 3, kubernetesSockets: 3, totalSockets: 30 },
      status: 'Active',
      approvedBy: 'admin@hpe.com',
      approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-2',
      referenceId: 'POC-2024-DEF456',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      requestor: {
        name: 'Sarah Johnson',
        email: 'sarah.j@hpe.com',
        type: 'hpe-sales-engineer',
        company: '',
        region: 'apac',
        opportunityId: '',
      },
      customer: {
        name: 'DBS Bank',
        industry: 'financial-services',
        country: 'Singapore',
        contactName: 'Michael Tan',
        contactEmail: 'm.tan@dbs.com',
      },
      pocDetails: {
        useCaseDescription: 'Multi-cloud management across AWS and Azure',
        businessJustification: 'Centralized governance and cost optimization',
        duration: 60,
        startDate: '',
        expectedEndDate: '',
        successCriteria: 'Demonstrate unified dashboard and policy enforcement',
        dealSize: '250k-500k',
        environmentReady: false,
      },
      datacenters: [
        { id: 'dc2', name: 'Singapore DC', hypervisor: 'nutanix-ahv', hosts: 8, socketsPerHost: 2 }
      ],
      publicCloud: [{ provider: 'aws', vms: 120 }, { provider: 'azure', vms: 80 }],
      kubernetesClusters: [
        { id: 'k8s2', name: 'AKS Cluster', distribution: 'aks', workers: 50, location: 'azure' }
      ],
      integrations: {
        automation: ['terraform'],
        itsm: 'none',
        itsmDetails: '',
        loadBalancer: ['aws-alb', 'azure-lb'],
        dnsIpam: ['aws-route53'],
        otherIntegrations: '',
      },
      calculations: { onPremSockets: 16, publicCloudSockets: 14, kubernetesSockets: 5, totalSockets: 35 },
      status: 'Pending Review',
    },
  ];
  
  saveLocalRequests(demoRequests);
}

/**
 * Clear all data (for testing)
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if API mode is enabled
 */
export function isAPIMode(): boolean {
  return useAPI();
}
