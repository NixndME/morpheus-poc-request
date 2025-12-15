/**
 * POC Request API Routes
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as pocRepo from '../db/pocRepository';

export const pocRouter = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPOCSchema = z.object({
  referenceId: z.string().min(1), // Accept referenceId from frontend
  requestor: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    type: z.enum(['hpe-sales-engineer', 'partner-engineer', 'gsi-partner', 'distributor', 'internal-team']),
    company: z.string().optional(),
    region: z.string().min(1),
    opportunityId: z.string().optional(),
  }),
  customer: z.object({
    name: z.string().min(1),
    industry: z.string().min(1),
    country: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
  }),
  pocDetails: z.object({
    useCaseDescription: z.string().min(1),
    businessJustification: z.string().optional(),
    duration: z.number().int().min(45).max(90),
    startDate: z.string().optional(),
    expectedEndDate: z.string().optional(),
    successCriteria: z.string().min(1),
    dealSize: z.enum(['less-than-50k', '50k-100k', '100k-250k', '250k-500k', '500k-plus', 'unknown']),
    environmentReady: z.boolean(),
  }),
  datacenters: z.array(z.any()),
  publicCloud: z.array(z.any()),
  kubernetesClusters: z.array(z.any()),
  integrations: z.any().optional().default({}),
  calculations: z.object({
    onPremSockets: z.number().int().min(0),
    publicCloudSockets: z.number().int().min(0),
    kubernetesSockets: z.number().int().min(0),
    totalSockets: z.number().int().min(0),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(['Draft', 'Pending Review', 'Approved', 'Active', 'Extended', 'Completed', 'Expired', 'Cancelled']),
  approvedBy: z.string().min(1),
  comment: z.string().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/poc-requests
 * Create a new POC request
 */
pocRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createPOCSchema.parse(req.body);
    const poc = await pocRepo.createPOCRequest(validatedData);
    
    res.status(201).json({
      success: true,
      data: poc,
      message: `POC request created with Reference ID: ${poc.reference_id}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    } else {
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
pocRouter.get('/', async (req: Request, res: Response) => {
  try {
    const filters: pocRepo.POCFilters = {
      status: req.query.status as string | undefined,
      region: req.query.region as string | undefined,
      searchTerm: req.query.search as string | undefined,
      dealSize: req.query.dealSize as string | undefined,
    };
    
    const requests = await pocRepo.getAllPOCRequests(filters);
    
    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
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
pocRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await pocRepo.getPOCStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
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
pocRouter.get('/search/:referenceId', async (req: Request, res: Response) => {
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
  } catch (error) {
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
pocRouter.get('/:id', async (req: Request, res: Response) => {
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
  } catch (error) {
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
pocRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);
    
    const poc = await pocRepo.updatePOCStatus(
      id,
      validatedData.status,
      validatedData.approvedBy,
      validatedData.comment
    );
    
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    } else {
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
pocRouter.get('/:id/audit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auditLog = await pocRepo.getAuditLog(id);
    
    res.json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
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
pocRouter.delete('/:id', async (req: Request, res: Response) => {
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
  } catch (error) {
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
pocRouter.post('/reset', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset data',
    });
  }
});
