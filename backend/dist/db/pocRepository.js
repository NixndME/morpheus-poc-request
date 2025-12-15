"use strict";
/**
 * POC Request Repository
 * Database operations for POC requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPOCRequest = createPOCRequest;
exports.getPOCByReferenceId = getPOCByReferenceId;
exports.getPOCById = getPOCById;
exports.getAllPOCRequests = getAllPOCRequests;
exports.updatePOCStatus = updatePOCStatus;
exports.getPOCStats = getPOCStats;
exports.resetAllData = resetAllData;
exports.getAuditLog = getAuditLog;
exports.softDeletePOCRequest = softDeletePOCRequest;
const connection_1 = require("./connection");
const uuid_1 = require("uuid");
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function generateReferenceId() {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `POC-${year}-${code}`;
}
function mapDbToPOCRequest(row) {
    return {
        id: row.id,
        reference_id: row.reference_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        requestor_name: row.requestor_name,
        requestor_email: row.requestor_email,
        requestor_type: row.requestor_type,
        requestor_company: row.requestor_company,
        requestor_region: row.requestor_region,
        opportunity_id: row.opportunity_id,
        customer_name: row.customer_name,
        customer_industry: row.customer_industry,
        customer_country: row.customer_country,
        customer_contact_name: row.customer_contact_name,
        customer_contact_email: row.customer_contact_email,
        use_case_description: row.use_case_description,
        business_justification: row.business_justification,
        poc_duration: row.poc_duration,
        start_date: row.start_date,
        expected_end_date: row.expected_end_date,
        success_criteria: row.success_criteria,
        deal_size: row.deal_size,
        environment_ready: row.environment_ready,
        datacenters: row.datacenters || [],
        public_cloud: row.public_cloud || [],
        kubernetes_clusters: row.kubernetes_clusters || [],
        integrations: row.integrations || {},
        on_prem_sockets: row.on_prem_sockets,
        public_cloud_sockets: row.public_cloud_sockets,
        kubernetes_sockets: row.kubernetes_sockets,
        total_sockets: row.total_sockets,
        status: row.status,
        outcome: row.outcome,
        outcome_details: row.outcome_details,
        approved_by: row.approved_by,
        approved_at: row.approved_at,
        license_key: row.license_key,
        internal_notes: row.internal_notes,
    };
}
// ============================================================================
// REPOSITORY FUNCTIONS
// ============================================================================
/**
 * Create a new POC request
 */
async function createPOCRequest(input) {
    const id = (0, uuid_1.v4)();
    // Use the referenceId from frontend instead of generating a new one
    const referenceId = input.referenceId;
    const query = `
    INSERT INTO ${connection_1.SCHEMA}.poc_requests (
      id, reference_id,
      requestor_name, requestor_email, requestor_type, requestor_company, requestor_region, opportunity_id,
      customer_name, customer_industry, customer_country, customer_contact_name, customer_contact_email,
      use_case_description, business_justification, poc_duration, start_date, expected_end_date, success_criteria,
      deal_size, environment_ready,
      datacenters, public_cloud, kubernetes_clusters, integrations,
      on_prem_sockets, public_cloud_sockets, kubernetes_sockets, total_sockets,
      status
    ) VALUES (
      $1, $2,
      $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19,
      $20, $21,
      $22, $23, $24, $25,
      $26, $27, $28, $29,
      'Pending Review'
    )
    RETURNING *
  `;
    const values = [
        id, referenceId,
        input.requestor.name, input.requestor.email, input.requestor.type,
        input.requestor.company || null, input.requestor.region, input.requestor.opportunityId || null,
        input.customer.name, input.customer.industry, input.customer.country || null,
        input.customer.contactName || null, input.customer.contactEmail || null,
        input.pocDetails.useCaseDescription, input.pocDetails.businessJustification || null,
        input.pocDetails.duration, input.pocDetails.startDate || null, input.pocDetails.expectedEndDate || null,
        input.pocDetails.successCriteria,
        input.pocDetails.dealSize, input.pocDetails.environmentReady,
        JSON.stringify(input.datacenters), JSON.stringify(input.publicCloud),
        JSON.stringify(input.kubernetesClusters), JSON.stringify(input.integrations),
        input.calculations.onPremSockets, input.calculations.publicCloudSockets,
        input.calculations.kubernetesSockets, input.calculations.totalSockets,
    ];
    const result = await connection_1.pool.query(query, values);
    // Log audit
    await logAudit(id, 'CREATE', 'system', null, 'Pending Review', 'POC request created');
    return mapDbToPOCRequest(result.rows[0]);
}
/**
 * Get POC by Reference ID
 */
async function getPOCByReferenceId(referenceId) {
    const query = `SELECT * FROM ${connection_1.SCHEMA}.poc_requests WHERE reference_id = $1`;
    const result = await connection_1.pool.query(query, [referenceId.toUpperCase()]);
    if (result.rows.length === 0) {
        return null;
    }
    return mapDbToPOCRequest(result.rows[0]);
}
/**
 * Get POC by ID
 */
async function getPOCById(id) {
    const query = `SELECT * FROM ${connection_1.SCHEMA}.poc_requests WHERE id = $1`;
    const result = await connection_1.pool.query(query, [id]);
    if (result.rows.length === 0) {
        return null;
    }
    return mapDbToPOCRequest(result.rows[0]);
}
/**
 * Get all POC requests with optional filters (excludes soft-deleted)
 */
async function getAllPOCRequests(filters) {
    // Only return non-deleted records
    let query = `SELECT * FROM ${connection_1.SCHEMA}.poc_requests WHERE deleted_at IS NULL`;
    const values = [];
    let paramIndex = 1;
    if (filters?.status) {
        query += ` AND status = $${paramIndex}`;
        values.push(filters.status);
        paramIndex++;
    }
    if (filters?.region) {
        query += ` AND requestor_region = $${paramIndex}`;
        values.push(filters.region);
        paramIndex++;
    }
    if (filters?.dealSize) {
        query += ` AND deal_size = $${paramIndex}`;
        values.push(filters.dealSize);
        paramIndex++;
    }
    if (filters?.searchTerm) {
        query += ` AND (
      reference_id ILIKE $${paramIndex} OR
      customer_name ILIKE $${paramIndex} OR
      requestor_name ILIKE $${paramIndex} OR
      requestor_email ILIKE $${paramIndex} OR
      opportunity_id ILIKE $${paramIndex}
    )`;
        values.push(`%${filters.searchTerm}%`);
        paramIndex++;
    }
    query += ` ORDER BY created_at DESC`;
    const result = await connection_1.pool.query(query, values);
    return result.rows.map(mapDbToPOCRequest);
}
/**
 * Update POC status
 */
async function updatePOCStatus(id, status, approvedBy, comment) {
    // Get current status for audit
    const current = await getPOCById(id);
    if (!current)
        return null;
    const isApproval = status === 'Approved' || status === 'Active';
    const commentText = comment || '';
    const now = new Date().toISOString();
    // Build the update dynamically to avoid PostgreSQL type inference issues
    // The status column is already typed as poc_status enum, so we just need to pass the string
    try {
        let result;
        if (commentText) {
            // With comment - update internal_notes
            const newNotes = current.internal_notes
                ? `${current.internal_notes}\n[${now}] ${approvedBy}: ${commentText}`
                : `[${now}] ${approvedBy}: ${commentText}`;
            const query = `
        UPDATE ${connection_1.SCHEMA}.poc_requests
        SET status = $1,
            approved_by = $2,
            approved_at = $3,
            internal_notes = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
            result = await connection_1.pool.query(query, [
                status,
                approvedBy,
                isApproval ? now : (current.approved_at || null),
                newNotes,
                id
            ]);
        }
        else {
            // Without comment
            const query = `
        UPDATE ${connection_1.SCHEMA}.poc_requests
        SET status = $1,
            approved_by = $2,
            approved_at = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *
      `;
            result = await connection_1.pool.query(query, [
                status,
                approvedBy,
                isApproval ? now : (current.approved_at || null),
                id
            ]);
        }
        if (result.rows.length === 0) {
            return null;
        }
        // Log audit
        await logAudit(id, 'STATUS_CHANGE', approvedBy, current.status, status, comment);
        return mapDbToPOCRequest(result.rows[0]);
    }
    catch (error) {
        console.error('updatePOCStatus error:', error);
        throw error;
    }
}
/**
 * Get POC statistics (excludes soft-deleted records)
 */
async function getPOCStats() {
    const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'Pending Review' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
      COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as rejected,
      COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expired,
      COALESCE(SUM(total_sockets), 0) as total_sockets
    FROM ${connection_1.SCHEMA}.poc_requests
    WHERE deleted_at IS NULL
  `;
    const result = await connection_1.pool.query(query);
    const row = result.rows[0];
    return {
        total: parseInt(row.total),
        pending: parseInt(row.pending),
        approved: parseInt(row.approved),
        active: parseInt(row.active),
        completed: parseInt(row.completed),
        rejected: parseInt(row.rejected),
        expired: parseInt(row.expired),
        totalSockets: parseInt(row.total_sockets),
    };
}
/**
 * Reset all data - soft delete ALL records (for admin reset)
 */
async function resetAllData(deletedBy) {
    try {
        const query = `
      UPDATE ${connection_1.SCHEMA}.poc_requests
      SET deleted_at = NOW(),
          deleted_by = $1,
          updated_at = NOW()
      WHERE deleted_at IS NULL
      RETURNING id
    `;
        const result = await connection_1.pool.query(query, [deletedBy]);
        // Log audit for the reset
        await logAudit('00000000-0000-0000-0000-000000000000', 'RESET_ALL_DATA', deletedBy, null, null, `Reset all data - ${result.rowCount} records soft deleted`);
        return result.rowCount || 0;
    }
    catch (error) {
        console.error('resetAllData error:', error);
        throw error;
    }
}
/**
 * Log audit entry
 */
async function logAudit(pocId, action, performedBy, oldStatus, newStatus, comment) {
    try {
        const query = `
      INSERT INTO ${connection_1.SCHEMA}.poc_audit_log (poc_id, action, performed_by, old_status, new_status, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
        await connection_1.pool.query(query, [pocId, action, performedBy, oldStatus, newStatus, comment || null]);
    }
    catch (error) {
        // Log but don't fail the main operation if audit logging fails
        console.error('Failed to log audit:', error);
    }
}
/**
 * Get audit log for a POC
 */
async function getAuditLog(pocId) {
    const query = `
    SELECT * FROM ${connection_1.SCHEMA}.poc_audit_log
    WHERE poc_id = $1
    ORDER BY performed_at DESC
  `;
    const result = await connection_1.pool.query(query, [pocId]);
    return result.rows;
}
/**
 * Soft delete a POC request (marks as deleted but keeps data)
 */
async function softDeletePOCRequest(id, deletedBy) {
    try {
        const query = `
      UPDATE ${connection_1.SCHEMA}.poc_requests
      SET deleted_at = NOW(),
          deleted_by = $1,
          updated_at = NOW()
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;
        const result = await connection_1.pool.query(query, [deletedBy, id]);
        if (result.rows.length === 0) {
            return null;
        }
        // Log audit
        await logAudit(id, 'SOFT_DELETE', deletedBy, result.rows[0].status, 'Deleted', 'POC request soft deleted');
        return mapDbToPOCRequest(result.rows[0]);
    }
    catch (error) {
        console.error('softDeletePOCRequest error:', error);
        throw error;
    }
}
//# sourceMappingURL=pocRepository.js.map