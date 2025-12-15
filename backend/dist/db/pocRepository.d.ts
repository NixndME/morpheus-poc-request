/**
 * POC Request Repository
 * Database operations for POC requests
 */
export interface POCRequest {
    id: string;
    reference_id: string;
    created_at: string;
    updated_at: string;
    requestor_name: string;
    requestor_email: string;
    requestor_type: string;
    requestor_company?: string;
    requestor_region: string;
    opportunity_id?: string;
    customer_name: string;
    customer_industry: string;
    customer_country?: string;
    customer_contact_name?: string;
    customer_contact_email?: string;
    use_case_description: string;
    business_justification?: string;
    poc_duration: number;
    start_date?: string;
    expected_end_date?: string;
    success_criteria: string;
    deal_size: string;
    environment_ready: boolean;
    datacenters: any[];
    public_cloud: any[];
    kubernetes_clusters: any[];
    integrations: any;
    on_prem_sockets: number;
    public_cloud_sockets: number;
    kubernetes_sockets: number;
    total_sockets: number;
    status: string;
    outcome?: string;
    outcome_details?: any;
    approved_by?: string;
    approved_at?: string;
    license_key?: string;
    internal_notes?: string;
    deleted_at?: string;
    deleted_by?: string;
}
export interface CreatePOCInput {
    referenceId: string;
    requestor: {
        name: string;
        email: string;
        type: string;
        company?: string;
        region: string;
        opportunityId?: string;
    };
    customer: {
        name: string;
        industry: string;
        country?: string;
        contactName?: string;
        contactEmail?: string;
    };
    pocDetails: {
        useCaseDescription: string;
        businessJustification?: string;
        duration: number;
        startDate?: string;
        expectedEndDate?: string;
        successCriteria: string;
        dealSize: string;
        environmentReady: boolean;
    };
    datacenters: any[];
    publicCloud: any[];
    kubernetesClusters: any[];
    integrations?: any;
    calculations: {
        onPremSockets: number;
        publicCloudSockets: number;
        kubernetesSockets: number;
        totalSockets: number;
    };
}
export interface POCFilters {
    status?: string;
    region?: string;
    searchTerm?: string;
    dealSize?: string;
}
export interface POCStats {
    total: number;
    pending: number;
    approved: number;
    active: number;
    completed: number;
    rejected: number;
    expired: number;
    totalSockets: number;
}
/**
 * Create a new POC request
 */
export declare function createPOCRequest(input: CreatePOCInput): Promise<POCRequest>;
/**
 * Get POC by Reference ID
 */
export declare function getPOCByReferenceId(referenceId: string): Promise<POCRequest | null>;
/**
 * Get POC by ID
 */
export declare function getPOCById(id: string): Promise<POCRequest | null>;
/**
 * Get all POC requests with optional filters (excludes soft-deleted)
 */
export declare function getAllPOCRequests(filters?: POCFilters): Promise<POCRequest[]>;
/**
 * Update POC status
 */
export declare function updatePOCStatus(id: string, status: string, approvedBy: string, comment?: string): Promise<POCRequest | null>;
/**
 * Get POC statistics (excludes soft-deleted records)
 */
export declare function getPOCStats(): Promise<POCStats>;
/**
 * Reset all data - soft delete ALL records (for admin reset)
 */
export declare function resetAllData(deletedBy: string): Promise<number>;
/**
 * Get audit log for a POC
 */
export declare function getAuditLog(pocId: string): Promise<any[]>;
/**
 * Soft delete a POC request (marks as deleted but keeps data)
 */
export declare function softDeletePOCRequest(id: string, deletedBy: string): Promise<POCRequest | null>;
//# sourceMappingURL=pocRepository.d.ts.map