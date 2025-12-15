/**
 * Admin Dashboard - Password Protected with PDF Export
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ArrowLeft,
  Building2,
  User,
  Server,
  Cloud,
  Container,
  Calendar,
  MessageSquare,
  Loader2,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  Workflow,
  X,
  Lock,
  Download,
  Target,
  Cpu,
  MapPin,
  DollarSign,
  CheckSquare,
  Award,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { 
  updatePOCStatus, 
  updatePOCStatusAsync,
  getPOCStats,
  getPOCStatsAsync,
  loadDemoData,
  type POCFilters as Filters,
  getFilteredPOCRequests,
  getFilteredPOCRequestsAsync,
  isAPIMode,
  deletePOCRequestAsync,
  resetAllDataAsync,
} from '../lib/dataStore';
import { exportPOCToPDF } from '../lib/pdfExport';
import type { POCRequest, POCStatus } from '../types';
import { formatDate, formatNumber } from '../lib/utils';
import { 
  POC_STATUS_OPTIONS, 
  REGION_OPTIONS,
  AUTOMATION_OPTIONS,
  ITSM_OPTIONS,
  LOAD_BALANCER_OPTIONS,
  DNS_IPAM_OPTIONS,
  K8S_DISTRIBUTION_OPTIONS,
  K8S_LOCATION_OPTIONS,
  HYPERVISOR_OPTIONS,
  INDUSTRY_OPTIONS,
  REQUESTOR_TYPE_OPTIONS,
  DEAL_SIZE_OPTIONS,
} from '../data/constants';

// Admin password - In production, this should be handled by proper authentication
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'morpheuspassword';

interface AdminPageProps {
  onBack: () => void;
}

// Helper to get label from value
const getLabel = (options: { value: string; label: string }[], value: string): string => {
  return options.find(o => o.value === value)?.label || value;
};

export function AdminPage({ onBack }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [requests, setRequests] = useState<POCRequest[]>([]);
  const [stats, setStats] = useState(getPOCStats());
  const [selectedRequest, setSelectedRequest] = useState<POCRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [_isLoading, setIsLoading] = useState(false);

  // Check if already authenticated in session
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('morpheus_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDemoData();
      refreshData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [filters, searchTerm, isAuthenticated]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAPIMode()) {
        const [filteredRequests, newStats] = await Promise.all([
          getFilteredPOCRequestsAsync({ ...filters, searchTerm }),
          getPOCStatsAsync()
        ]);
        setRequests(filteredRequests);
        setStats(newStats);
      } else {
        const filteredRequests = getFilteredPOCRequests({ ...filters, searchTerm });
        setRequests(filteredRequests);
        setStats(getPOCStats());
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('morpheus_admin_auth', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('morpheus_admin_auth');
    setPassword('');
  };

  const handleStatusUpdate = async (id: string, status: POCStatus, comment: string) => {
    console.log('handleStatusUpdate called:', { id, status, comment });
    try {
      if (isAPIMode()) {
        console.log('Using API mode for status update');
        const result = await updatePOCStatusAsync(id, status, comment, 'admin@hpe.com');
        console.log('API update result:', result);
      } else {
        console.log('Using localStorage mode for status update');
        updatePOCStatus(id, status, comment, 'admin@hpe.com');
      }
      await refreshData();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (id: string, referenceId: string) => {
    if (!confirm(`Are you sure you want to delete POC ${referenceId}?\n\nThis action will remove the request from the dashboard.`)) {
      return;
    }
    
    console.log('handleDelete called:', { id, referenceId });
    try {
      const success = await deletePOCRequestAsync(id, 'admin@hpe.com');
      if (success) {
        alert(`POC ${referenceId} has been deleted.`);
        await refreshData();
        setSelectedRequest(null);
      } else {
        alert('Failed to delete POC. It may have already been deleted.');
      }
    } catch (error) {
      console.error('Failed to delete POC:', error);
      alert('Failed to delete POC. Please try again.');
    }
  };

  const handleResetAll = async () => {
    const confirmText = prompt(
      '⚠️ WARNING: This will reset ALL POC data!\n\n' +
      'All POC requests will be soft-deleted and removed from the dashboard.\n' +
      'The data will remain in the database but won\'t be visible.\n\n' +
      'Type "RESET" to confirm:'
    );
    
    if (confirmText !== 'RESET') {
      if (confirmText !== null) {
        alert('Reset cancelled. You must type "RESET" exactly to confirm.');
      }
      return;
    }
    
    console.log('handleResetAll called');
    try {
      const result = await resetAllDataAsync('admin@hpe.com');
      if (result.success) {
        alert(`✅ Reset complete!\n\n${result.deletedCount} POC request(s) have been soft-deleted.`);
        await refreshData();
      } else {
        alert('Failed to reset data. Please try again.');
      }
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('Failed to reset data. Please try again.');
    }
  };

  // Password Login Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 
                           flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Access</h1>
            <p className="text-gray-400 mt-2">Enter password to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                placeholder="Enter admin password"
                className={`input-field ${passwordError ? 'border-red-500/50 focus:border-red-500' : ''}`}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">Incorrect password. Please try again.</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Access Admin Dashboard
            </motion.button>
          </form>

          <p className="text-xs text-gray-600 text-center mt-6">
            Contact your administrator if you've forgotten the password.
          </p>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard (authenticated)
  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button & Logout */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
        >
          <Lock className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 
                         flex items-center justify-center shadow-lg shadow-red-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Manage POC license requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refreshData} className="btn-ghost flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={handleResetAll} 
            className="btn-ghost flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6"
      >
        <StatCard label="Total" value={stats.total} icon={<BarChart3 />} color="gray" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock />} color="yellow" />
        <StatCard label="Active" value={stats.active} icon={<CheckCircle2 />} color="green" />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 />} color="purple" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle />} color="red" />
        <StatCard label="Total Sockets" value={stats.totalSockets} icon={<Server />} color="blue" />
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Reference ID, Customer, or Requestor..."
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-morpheus-700/60' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-morpheus-800/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Status</label>
                  <select
                    value={filters.status?.[0] || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value as POCStatus] : undefined })}
                    className="select-field"
                  >
                    <option value="">All Statuses</option>
                    {POC_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Region</label>
                  <select
                    value={filters.region?.[0] || ''}
                    onChange={(e) => setFilters({ ...filters, region: e.target.value ? [e.target.value] : undefined })}
                    className="select-field"
                  >
                    <option value="">All Regions</option>
                    {REGION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setFilters({}); setSearchTerm(''); }} className="btn-ghost text-sm">
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Request List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-4 border-b border-morpheus-800/50">
          <h2 className="font-semibold text-gray-200">POC Requests ({requests.length})</h2>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No POC requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-morpheus-800/50">
            {requests.map((request) => (
              <RequestRow key={request.id} request={request} onView={() => setSelectedRequest(request)} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <RequestDetailModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onStatusUpdate={handleStatusUpdate}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-500/10 text-gray-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    red: 'bg-red-500/10 text-red-400',
    blue: 'bg-blue-500/10 text-blue-400',
  };
  return (
    <div className={`p-4 rounded-xl ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">{icon}<span className="text-xs">{label}</span></div>
      <div className="text-2xl font-bold">{formatNumber(value)}</div>
    </div>
  );
}

function RequestRow({ request, onView }: { request: POCRequest; onView: () => void }) {
  const statusColors: Record<POCStatus, string> = {
    'Draft': 'bg-gray-500/20 text-gray-400',
    'Pending Review': 'bg-yellow-500/20 text-yellow-400',
    'Approved': 'bg-blue-500/20 text-blue-400',
    'Active': 'bg-green-500/20 text-green-400',
    'Extended': 'bg-orange-500/20 text-orange-400',
    'Completed': 'bg-purple-500/20 text-purple-400',
    'Expired': 'bg-red-500/20 text-red-400',
    'Cancelled': 'bg-red-500/20 text-red-400',
  };
  return (
    <div className="p-4 hover:bg-morpheus-800/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-mono text-hpe-green-400 font-medium">{request.referenceId}</div>
            <div className="text-sm text-gray-400">{request.customer.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-sm text-gray-300">{request.requestor.name}</div>
            <div className="text-xs text-gray-500">{formatDate(request.createdAt)}</div>
          </div>
          <div className="text-right hidden lg:block">
            <div className="text-lg font-semibold text-gray-300">{request.calculations.totalSockets}</div>
            <div className="text-xs text-gray-500">sockets</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
            {request.status}
          </span>
          <button onClick={onView} className="p-2 rounded-lg hover:bg-morpheus-700/50 text-gray-400 hover:text-gray-200 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestDetailModal({ 
  request, 
  onClose, 
  onStatusUpdate,
  onDelete
}: { 
  request: POCRequest; 
  onClose: () => void; 
  onStatusUpdate: (id: string, status: POCStatus, comment: string) => Promise<void>;
  onDelete: (id: string, referenceId: string) => Promise<void>;
}) {
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (status: POCStatus) => {
    console.log('handleAction called:', { requestId: request.id, status, comment });
    setIsProcessing(true);
    try {
      await onStatusUpdate(request.id, status, comment);
    } catch (error) {
      console.error('handleAction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete(request.id, request.referenceId);
    } catch (error) {
      console.error('handleDelete error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = () => {
    exportPOCToPDF(request);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-morpheus-800/50 flex items-center justify-between sticky top-0 bg-morpheus-900/95 backdrop-blur-xl z-10">
          <div>
            <div className="font-mono text-xl text-hpe-green-400 font-bold">{request.referenceId}</div>
            <div className="text-gray-400">{request.customer.name}</div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </motion.button>
            <button onClick={onClose} className="p-2 hover:bg-morpheus-800/50 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoItem icon={<User />} label="Requestor" value={request.requestor.name} subValue={request.requestor.email} />
            <InfoItem icon={<Building2 />} label="Customer" value={request.customer.name} subValue={getLabel(INDUSTRY_OPTIONS, request.customer.industry)} />
            <InfoItem icon={<Clock />} label="Duration" value={`${request.pocDetails.duration} Days`} />
            <InfoItem icon={<Calendar />} label="Submitted" value={formatDate(request.createdAt)} />
          </div>

          {/* Deal Size & Environment Ready */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-morpheus-900/50 border border-morpheus-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <DollarSign className="w-4 h-4" />
                Deal Size / Budget
              </div>
              <div className="text-lg font-semibold text-hpe-green-400">
                {request.pocDetails.dealSize ? getLabel(DEAL_SIZE_OPTIONS, request.pocDetails.dealSize) : 'Not specified'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-morpheus-900/50 border border-morpheus-800/50">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <CheckSquare className="w-4 h-4" />
                POC Environment Ready
              </div>
              <div className={`text-lg font-semibold flex items-center gap-2 ${
                request.pocDetails.environmentReady ? 'text-green-400' : 'text-amber-400'
              }`}>
                {request.pocDetails.environmentReady ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Yes - Ready
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    No - Not Ready
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Requestor Details */}
          <div className="p-4 rounded-xl bg-morpheus-900/50">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Requestor Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Type:</span> <span className="text-gray-300 ml-2">{getLabel(REQUESTOR_TYPE_OPTIONS, request.requestor.type)}</span></div>
              <div><span className="text-gray-500">Region:</span> <span className="text-gray-300 ml-2">{getLabel(REGION_OPTIONS, request.requestor.region)}</span></div>
              {request.requestor.company && <div><span className="text-gray-500">Company:</span> <span className="text-gray-300 ml-2">{request.requestor.company}</span></div>}
              {request.requestor.opportunityId && <div><span className="text-gray-500">Opp ID:</span> <span className="text-hpe-green-400 ml-2">{request.requestor.opportunityId}</span></div>}
            </div>
          </div>

          {/* Use Case & Success Criteria */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Workflow className="w-4 h-4" />Use Case</div>
              <p className="text-gray-300 bg-morpheus-900/50 p-3 rounded-lg">{request.pocDetails.useCaseDescription}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-hpe-green-400 mb-2"><Target className="w-4 h-4" />Success Criteria</div>
              <p className="text-gray-300 bg-hpe-green-500/10 border border-hpe-green-500/20 p-3 rounded-lg">{request.pocDetails.successCriteria}</p>
            </div>
          </div>

          {/* Infrastructure Summary */}
          <div>
            <div className="text-sm text-gray-500 mb-3">Infrastructure Summary</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                <Server className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-purple-400">{request.calculations.onPremSockets}</div>
                <div className="text-xs text-gray-500">On-Prem</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-500/10 text-center">
                <Cloud className="w-5 h-5 text-sky-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-sky-400">{request.calculations.publicCloudSockets}</div>
                <div className="text-xs text-gray-500">Cloud</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                <Container className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-orange-400">{request.calculations.kubernetesSockets}</div>
                <div className="text-xs text-gray-500">K8s</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-hpe-green-500/10 flex items-center justify-between">
              <span className="text-gray-400">Total Sockets Required</span>
              <span className="text-2xl font-bold text-hpe-green-400">{request.calculations.totalSockets}</span>
            </div>
          </div>

          {/* Datacenter Details - with workloads support */}
          {request.datacenters.filter(dc => {
            if (dc.workloads && dc.workloads.length > 0) {
              return dc.workloads.some(w => (w.hosts || 0) > 0);
            }
            return (dc.hosts || 0) > 0;
          }).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Server className="w-4 h-4" /> Datacenters</h4>
              <div className="space-y-2">
                {request.datacenters.map((dc, i) => {
                  // Handle new workloads format
                  if (dc.workloads && dc.workloads.length > 0) {
                    const validWorkloads = dc.workloads.filter(w => (w.hosts || 0) > 0);
                    if (validWorkloads.length === 0) return null;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-morpheus-900/50 space-y-2">
                        <div className="text-gray-200 font-medium">{dc.name || `Datacenter ${i + 1}`}</div>
                        {validWorkloads.map((w, wi) => (
                          <div key={wi} className="pl-4 flex items-center justify-between text-sm border-l-2 border-purple-500/30">
                            <span className="text-gray-500">{getLabel(HYPERVISOR_OPTIONS, w.hypervisor || '')}</span>
                            <div className="text-gray-400">{w.hosts} hosts × {w.socketsPerHost} = <span className="text-purple-400">{(w.hosts || 0) * (w.socketsPerHost || 0)}</span></div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  // Legacy format
                  if ((dc.hosts || 0) <= 0) return null;
                  return (
                    <div key={i} className="p-3 rounded-lg bg-morpheus-900/50 flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-200">{dc.name || `Datacenter ${i + 1}`}</span>
                        <span className="text-gray-500 ml-2">({getLabel(HYPERVISOR_OPTIONS, dc.hypervisor || '')})</span>
                      </div>
                      <div className="text-gray-400">{dc.hosts} hosts × {dc.socketsPerHost} = <span className="text-purple-400">{(dc.hosts || 0) * (dc.socketsPerHost || 0)}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kubernetes */}
          {request.kubernetesClusters.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Container className="w-4 h-4" /> Kubernetes Clusters</h4>
              <div className="space-y-2">
                {request.kubernetesClusters.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-morpheus-900/50 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-200">{c.name || `Cluster ${i + 1}`}</span>
                      <span className="px-2 py-0.5 rounded bg-morpheus-800 text-gray-400 text-xs">{getLabel(K8S_DISTRIBUTION_OPTIONS, c.distribution)}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{getLabel(K8S_LOCATION_OPTIONS, c.location)}</span>
                    </div>
                    <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-gray-500" /><span className="text-orange-400">{c.workers} workers</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Workflow className="w-4 h-4" /> Integrations</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Automation:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.integrations.automation.filter(a => a !== 'none').map((a, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs">{getLabel(AUTOMATION_OPTIONS, a)}</span>
                  ))}
                  {request.integrations.automation.filter(a => a !== 'none').length === 0 && <span className="text-gray-500">None</span>}
                </div>
              </div>
              <div>
                <span className="text-gray-500">ITSM:</span>
                <span className="text-gray-300 ml-2">{request.integrations.itsm !== 'none' ? getLabel(ITSM_OPTIONS, request.integrations.itsm) : 'None'}</span>
              </div>
              <div>
                <span className="text-gray-500">Load Balancers:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.integrations.loadBalancer.filter(l => l !== 'none').map((l, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-violet-500/10 text-violet-400 text-xs">{getLabel(LOAD_BALANCER_OPTIONS, l)}</span>
                  ))}
                  {request.integrations.loadBalancer.filter(l => l !== 'none').length === 0 && <span className="text-gray-500">None</span>}
                </div>
              </div>
              <div>
                <span className="text-gray-500">DNS/IPAM:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.integrations.dnsIpam.filter(d => d !== 'none').map((d, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs">{getLabel(DNS_IPAM_OPTIONS, d)}</span>
                  ))}
                  {request.integrations.dnsIpam.filter(d => d !== 'none').length === 0 && <span className="text-gray-500">None</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Comment */}
          {(request.status === 'Pending Review' || request.status === 'Draft') && (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><MessageSquare className="w-4 h-4" />Admin Comment (optional)</div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment for the requestor..." className="input-field resize-none" rows={3} />
            </div>
          )}

          {request.internalNotes && (
            <div>
              <div className="text-sm text-gray-500 mb-2">Notes History</div>
              <pre className="text-sm text-gray-400 bg-morpheus-900/50 p-3 rounded-lg whitespace-pre-wrap">{request.internalNotes}</pre>
            </div>
          )}
        </div>

        {/* Actions */}
        {(request.status === 'Pending Review' || request.status === 'Draft') && (
          <div className="p-6 border-t border-morpheus-800/50 flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAction('Approved')} disabled={isProcessing}
              className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors disabled:opacity-50">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}Approve
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAction('Cancelled')} disabled={isProcessing}
              className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors disabled:opacity-50">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}Reject
            </motion.button>
          </div>
        )}

        {request.status === 'Approved' && (
          <div className="p-6 border-t border-morpheus-800/50">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAction('Active')} disabled={isProcessing}
              className="w-full bg-hpe-green-500/20 text-hpe-green-400 border border-hpe-green-500/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-hpe-green-500/30 transition-colors disabled:opacity-50">
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}Mark as Active (License Issued)
            </motion.button>
          </div>
        )}

        {request.status === 'Active' && (
          <div className="p-6 border-t border-morpheus-800/50">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MessageSquare className="w-4 h-4" />
              Completion Notes (optional)
            </div>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Add notes about POC outcome, customer feedback, lessons learned..." 
              className="input-field resize-none mb-4" 
              rows={3} 
            />
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleAction('Completed')} 
                disabled={isProcessing}
                className="flex-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />}
                Mark as Completed
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => handleAction('Cancelled')} 
                disabled={isProcessing}
                className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                Cancel POC
              </motion.button>
            </div>
          </div>
        )}

        {/* Delete Section - Always visible */}
        <div className="p-6 border-t border-red-900/30 bg-red-950/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-red-400 font-medium">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Delete this POC request. This removes it from the dashboard but keeps the record in the database.
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={handleDelete} 
              disabled={isProcessing}
              className="bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-red-600/30 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete POC
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: string; subValue?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">{icon}{label}</div>
      <div className="text-gray-200 font-medium truncate">{value}</div>
      {subValue && <div className="text-xs text-gray-500 truncate">{subValue}</div>}
    </div>
  );
}
