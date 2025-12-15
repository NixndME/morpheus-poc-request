"use strict";
/**
 * POC Request API Routes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.pocRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const pocRepo = __importStar(require("../db/pocRepository"));
exports.pocRouter = (0, express_1.Router)();
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const createPOCSchema = zod_1.z.object({
    referenceId: zod_1.z.string().min(1), // Accept referenceId from frontend
    requestor: zod_1.z.object({
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        type: zod_1.z.enum(['hpe-sales-engineer', 'partner-engineer', 'gsi-partner', 'distributor', 'internal-team']),
        company: zod_1.z.string().optional(),
        region: zod_1.z.string().min(1),
        opportunityId: zod_1.z.string().optional(),
    }),
    customer: zod_1.z.object({
        name: zod_1.z.string().min(1),
        industry: zod_1.z.string().min(1),
        country: zod_1.z.string().optional(),
        contactName: zod_1.z.string().optional(),
        contactEmail: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    }),
    pocDetails: zod_1.z.object({
        useCaseDescription: zod_1.z.string().min(1),
        businessJustification: zod_1.z.string().optional(),
        duration: zod_1.z.number().int().min(45).max(90),
        startDate: zod_1.z.string().optional(),
        expectedEndDate: zod_1.z.string().optional(),
        successCriteria: zod_1.z.string().min(1),
        dealSize: zod_1.z.enum(['less-than-50k', '50k-100k', '100k-250k', '250k-500k', '500k-plus', 'unknown']),
        environmentReady: zod_1.z.boolean(),
    }),
    datacenters: zod_1.z.array(zod_1.z.any()),
    publicCloud: zod_1.z.array(zod_1.z.any()),
    kubernetesClusters: zod_1.z.array(zod_1.z.any()),
    integrations: zod_1.z.any().optional().default({}),
    calculations: zod_1.z.object({
        onPremSockets: zod_1.z.number().int().min(0),
        publicCloudSockets: zod_1.z.number().int().min(0),
        kubernetesSockets: zod_1.z.number().int().min(0),
        totalSockets: zod_1.z.number().int().min(0),
    }),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['Draft', 'Pending Review', 'Approved', 'Active', 'Extended', 'Completed', 'Expired', 'Cancelled']),
    approvedBy: zod_1.z.string().min(1),
    comment: zod_1.z.string().optional(),
});
// ============================================================================
// ROUTES
// ============================================================================
/**
 * POST /api/poc-requests
 * Create a new POC request
 */
exports.pocRouter.post('/', async (req, res) => {
    try {
        const validatedData = createPOCSchema.parse(req.body);
        const poc = await pocRepo.createPOCRequest(validatedData);
        res.status(201).json({
            success: true,
            data: poc,
            message: `POC request created with Reference ID: ${poc.reference_id}`,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        else {
            console.error('Error creating POC request:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create POC request',
            });
        }
    }
});
/**
 * GET /api/poc-requests
 * Get all POC requests (admin)
 */
exports.pocRouter.get('/', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            region: req.query.region,
            searchTerm: req.query.search,
            dealSize: req.query.dealSize,
        };
        const requests = await pocRepo.getAllPOCRequests(filters);
        res.json({
            success: true,
            data: requests,
            count: requests.length,
        });
    }
    catch (error) {
        console.error('Error fetching POC requests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch POC requests',
        });
    }
});
/**
 * GET /api/poc-requests/stats
 * Get POC statistics
 */
exports.pocRouter.get('/stats', async (req, res) => {
    try {
        const stats = await pocRepo.getPOCStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        console.error('Error fetching POC stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch POC statistics',
        });
    }
});
/**
 * GET /api/poc-requests/search/:referenceId
 * Search POC by Reference ID (public)
 */
exports.pocRouter.get('/search/:referenceId', async (req, res) => {
    try {
        const { referenceId } = req.params;
        const poc = await pocRepo.getPOCByReferenceId(referenceId);
        if (!poc) {
            res.status(404).json({
                success: false,
                error: 'POC request not found',
            });
            return;
        }
        res.json({
            success: true,
            data: poc,
        });
    }
    catch (error) {
        console.error('Error searching POC request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search POC request',
        });
    }
});
/**
 * GET /api/poc-requests/:id
 * Get POC by ID
 */
exports.pocRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const poc = await pocRepo.getPOCById(id);
        if (!poc) {
            res.status(404).json({
                success: false,
                error: 'POC request not found',
            });
            return;
        }
        res.json({
            success: true,
            data: poc,
        });
    }
    catch (error) {
        console.error('Error fetching POC request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch POC request',
        });
    }
});
/**
 * PATCH /api/poc-requests/:id/status
 * Update POC status (admin)
 */
exports.pocRouter.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateStatusSchema.parse(req.body);
        const poc = await pocRepo.updatePOCStatus(id, validatedData.status, validatedData.approvedBy, validatedData.comment);
        if (!poc) {
            res.status(404).json({
                success: false,
                error: 'POC request not found',
            });
            return;
        }
        res.json({
            success: true,
            data: poc,
            message: `POC status updated to ${validatedData.status}`,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            });
        }
        else {
            console.error('Error updating POC status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update POC status',
            });
        }
    }
});
/**
 * GET /api/poc-requests/:id/audit
 * Get audit log for a POC
 */
exports.pocRouter.get('/:id/audit', async (req, res) => {
    try {
        const { id } = req.params;
        const auditLog = await pocRepo.getAuditLog(id);
        res.json({
            success: true,
            data: auditLog,
        });
    }
    catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit log',
        });
    }
});
/**
 * DELETE /api/poc-requests/:id
 * Soft delete a POC request (admin)
 */
exports.pocRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBy = req.body.deletedBy || 'admin@hpe.com';
        const poc = await pocRepo.softDeletePOCRequest(id, deletedBy);
        if (!poc) {
            res.status(404).json({
                success: false,
                error: 'POC request not found or already deleted',
            });
            return;
        }
        res.json({
            success: true,
            message: `POC ${poc.reference_id} has been deleted`,
            data: poc,
        });
    }
    catch (error) {
        console.error('Error deleting POC request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete POC request',
        });
    }
});
/**
 * POST /api/poc-requests/reset
 * Reset all data - soft delete all records (admin)
 */
exports.pocRouter.post('/reset', async (req, res) => {
    try {
        const deletedBy = req.body.deletedBy || 'admin@hpe.com';
        const confirmReset = req.body.confirmReset;
        // Require confirmation
        if (confirmReset !== 'RESET_ALL_DATA') {
            res.status(400).json({
                success: false,
                error: 'Invalid confirmation. Send confirmReset: "RESET_ALL_DATA" to confirm.',
            });
            return;
        }
        const count = await pocRepo.resetAllData(deletedBy);
        res.json({
            success: true,
            message: `Successfully reset all data. ${count} records have been soft deleted.`,
            deletedCount: count,
        });
    }
    catch (error) {
        console.error('Error resetting data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset data',
        });
    }
});
//# sourceMappingURL=pocRoutes.js.map