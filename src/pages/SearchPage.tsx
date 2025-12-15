/**
 * Search Page - Full POC Details View with PDF Export
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Hash, 
  Clock, 
  User, 
  Building2, 
  Server, 
  Cloud, 
  Container,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Workflow,
  ArrowLeft,
  FileText,
  Download,
  Target,
  Globe,
  Network,
  Ticket,
  Cpu,
  MapPin,
  Briefcase,
  Mail,
} from 'lucide-react';
import { getPOCByReferenceId, getPOCByReferenceIdAsync, isAPIMode } from '../lib/dataStore';
import { exportPOCToPDF } from '../lib/pdfExport';
import { formatDate, formatNumber } from '../lib/utils';
import { 
  AUTOMATION_OPTIONS, 
  ITSM_OPTIONS, 
  LOAD_BALANCER_OPTIONS, 
  DNS_IPAM_OPTIONS,
  K8S_DISTRIBUTION_OPTIONS,
  K8S_LOCATION_OPTIONS,
  HYPERVISOR_OPTIONS,
  INDUSTRY_OPTIONS,
  REGION_OPTIONS,
  REQUESTOR_TYPE_OPTIONS,
} from '../data/constants';
import type { POCRequest, POCStatus } from '../types';

interface SearchPageProps {
  onBack: () => void;
}

// Helper to get label from value
const getLabel = (options: { value: string; label: string }[], value: string): string => {
  return options.find(o => o.value === value)?.label || value;
};

export function SearchPage({ onBack }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<POCRequest | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setSearchResult(null);
    
    try {
      let result: POCRequest | null = null;
      
      if (isAPIMode()) {
        result = await getPOCByReferenceIdAsync(searchTerm.trim().toUpperCase());
      } else {
        // Simulate async for consistency
        await new Promise(resolve => setTimeout(resolve, 500));
        result = getPOCByReferenceId(searchTerm.trim().toUpperCase());
      }
      
      if (result) {
        setSearchResult(result);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExportPDF = () => {
    if (searchResult) {
      exportPOCToPDF(searchResult);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to New Request
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 
                       flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white">Search POC Request</h1>
        <p className="text-gray-400 mt-2">Enter your POC Reference ID to view complete details</p>
      </motion.div>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="e.g., POC-2024-ABC123"
              className="input-field pl-12 font-mono text-lg tracking-wider"
              autoFocus
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isSearching}
            className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </motion.button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8 text-center"
          >
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-200 mb-2">POC Not Found</h2>
            <p className="text-gray-400">
              No POC request found with Reference ID: <span className="font-mono text-gray-300">{searchTerm}</span>
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Please check the ID and try again.
            </p>
          </motion.div>
        )}

        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Status Card with Export */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Reference ID</div>
                  <div className="text-2xl font-mono font-bold text-hpe-green-400">
                    {searchResult.referenceId}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Submitted {formatDate(searchResult.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={searchResult.status} large />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExportPDF}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </motion.button>
                </div>
              </div>

              {/* Status Message */}
              <div className={`p-4 rounded-xl ${getStatusBgColor(searchResult.status)}`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(searchResult.status)}
                  <div>
                    <div className="font-medium text-gray-200">
                      {getStatusMessage(searchResult.status)}
                    </div>
                    {searchResult.approvedBy && (
                      <div className="text-sm text-gray-400 mt-1">
                        Processed by {searchResult.approvedBy}
                        {searchResult.approvedAt && ` on ${formatDate(searchResult.approvedAt)}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Requestor & Customer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailCard title="Requestor Information" icon={<User className="w-5 h-5" />}>
                <DetailRow icon={<User />} label="Name" value={searchResult.requestor.name} />
                <DetailRow icon={<Mail />} label="Email" value={searchResult.requestor.email} />
                <DetailRow icon={<Briefcase />} label="Type" value={getLabel(REQUESTOR_TYPE_OPTIONS, searchResult.requestor.type)} />
                {searchResult.requestor.company && (
                  <DetailRow icon={<Building2 />} label="Company" value={searchResult.requestor.company} />
                )}
                <DetailRow icon={<Globe />} label="Region" value={getLabel(REGION_OPTIONS, searchResult.requestor.region)} />
                {searchResult.requestor.opportunityId && (
                  <DetailRow icon={<Hash />} label="Opportunity ID" value={searchResult.requestor.opportunityId} highlight />
                )}
              </DetailCard>

              <DetailCard title="Customer Information" icon={<Building2 className="w-5 h-5" />}>
                <DetailRow icon={<Building2 />} label="Customer" value={searchResult.customer.name} />
                <DetailRow icon={<Briefcase />} label="Industry" value={getLabel(INDUSTRY_OPTIONS, searchResult.customer.industry)} />
                {searchResult.customer.country && (
                  <DetailRow icon={<Globe />} label="Country" value={searchResult.customer.country} />
                )}
                {searchResult.customer.contactName && (
                  <DetailRow icon={<User />} label="Contact" value={searchResult.customer.contactName} />
                )}
                {searchResult.customer.contactEmail && (
                  <DetailRow icon={<Mail />} label="Contact Email" value={searchResult.customer.contactEmail} />
                )}
              </DetailCard>
            </div>

            {/* POC Details */}
            <DetailCard title="POC Details" icon={<FileText className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <DetailRow icon={<Clock />} label="Duration" value={`${searchResult.pocDetails.duration} Days`} />
                <DetailRow icon={<Calendar />} label="Start Date" value={searchResult.pocDetails.startDate ? formatDate(searchResult.pocDetails.startDate) : 'TBD'} />
                <DetailRow icon={<Calendar />} label="End Date" value={searchResult.pocDetails.expectedEndDate ? formatDate(searchResult.pocDetails.expectedEndDate) : 'TBD'} />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-morpheus-800/50">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Workflow className="w-4 h-4" />
                    Use Case Description
                  </div>
                  <p className="text-gray-300 bg-morpheus-900/50 p-3 rounded-lg">
                    {searchResult.pocDetails.useCaseDescription}
                  </p>
                </div>
                
                {searchResult.pocDetails.businessJustification && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Briefcase className="w-4 h-4" />
                      Business Justification
                    </div>
                    <p className="text-gray-300 bg-morpheus-900/50 p-3 rounded-lg">
                      {searchResult.pocDetails.businessJustification}
                    </p>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 text-sm text-hpe-green-400 mb-2">
                    <Target className="w-4 h-4" />
                    Success Criteria
                  </div>
                  <p className="text-gray-300 bg-hpe-green-500/10 border border-hpe-green-500/20 p-3 rounded-lg">
                    {searchResult.pocDetails.successCriteria}
                  </p>
                </div>
              </div>
            </DetailCard>

            {/* Infrastructure */}
            <DetailCard title="Infrastructure Summary" icon={<Server className="w-5 h-5" />}>
              {/* Socket Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <Server className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">{formatNumber(searchResult.calculations.onPremSockets)}</div>
                  <div className="text-xs text-gray-500">On-Prem Sockets</div>
                </div>
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                  <Cloud className="w-6 h-6 text-sky-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-sky-400">{formatNumber(searchResult.calculations.publicCloudSockets)}</div>
                  <div className="text-xs text-gray-500">Cloud Sockets</div>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                  <Container className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">{formatNumber(searchResult.calculations.kubernetesSockets)}</div>
                  <div className="text-xs text-gray-500">K8s Sockets</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-hpe-green-500/10 border border-hpe-green-500/20 flex items-center justify-between mb-6">
                <span className="text-gray-300 font-medium">Total POC Sockets Required</span>
                <span className="text-3xl font-bold text-hpe-green-400">{formatNumber(searchResult.calculations.totalSockets)}</span>
              </div>

              {/* Datacenter Details - with workloads support */}
              {searchResult.datacenters.filter(dc => {
                if (dc.workloads && dc.workloads.length > 0) {
                  return dc.workloads.some(w => (w.hosts || 0) > 0);
                }
                return (dc.hosts || 0) > 0;
              }).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Datacenters
                  </h4>
                  <div className="space-y-2">
                    {searchResult.datacenters.map((dc, i) => {
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
                        <div key={i} className="p-3 rounded-lg bg-morpheus-900/50 flex items-center justify-between">
                          <div>
                            <span className="text-gray-200">{dc.name || `Datacenter ${i + 1}`}</span>
                            <span className="text-gray-500 text-sm ml-2">({getLabel(HYPERVISOR_OPTIONS, dc.hypervisor || '')})</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {dc.hosts} hosts × {dc.socketsPerHost} sockets = <span className="text-purple-400 font-medium">{(dc.hosts || 0) * (dc.socketsPerHost || 0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Public Cloud Details */}
              {searchResult.publicCloud.filter(pc => pc.vms > 0).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4" /> Public Cloud
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.publicCloud.filter(pc => pc.vms > 0).map((pc, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-morpheus-900/50 text-sm">
                        <span className="text-gray-300">{pc.provider.toUpperCase()}</span>
                        <span className="text-sky-400 ml-2 font-medium">{pc.vms} VMs</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kubernetes Clusters */}
              {searchResult.kubernetesClusters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <Container className="w-4 h-4" /> Kubernetes Clusters
                  </h4>
                  <div className="space-y-2">
                    {searchResult.kubernetesClusters.map((cluster, i) => (
                      <div key={i} className="p-3 rounded-lg bg-morpheus-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-200">{cluster.name || `Cluster ${i + 1}`}</span>
                          <span className="text-xs px-2 py-1 rounded bg-morpheus-800/50 text-gray-400">
                            {getLabel(K8S_DISTRIBUTION_OPTIONS, cluster.distribution)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getLabel(K8S_LOCATION_OPTIONS, cluster.location)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Cpu className="w-4 h-4 text-gray-500" />
                          <span className="text-orange-400 font-medium">{cluster.workers} workers</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DetailCard>

            {/* Integrations */}
            <DetailCard title="Tool Integrations" icon={<Workflow className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Automation */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Workflow className="w-4 h-4" />
                    Automation / IAM
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.integrations.automation.filter(a => a !== 'none').length > 0 ? (
                      searchResult.integrations.automation.filter(a => a !== 'none').map((a, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20">
                          {getLabel(AUTOMATION_OPTIONS, a)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">None specified</span>
                    )}
                  </div>
                </div>

                {/* ITSM */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Ticket className="w-4 h-4" />
                    ITSM Platform
                  </div>
                  <div className="text-gray-300">
                    {searchResult.integrations.itsm !== 'none' 
                      ? getLabel(ITSM_OPTIONS, searchResult.integrations.itsm)
                      : <span className="text-gray-500">None specified</span>}
                    {searchResult.integrations.itsmDetails && (
                      <p className="text-sm text-gray-500 mt-1">{searchResult.integrations.itsmDetails}</p>
                    )}
                  </div>
                </div>

                {/* Load Balancers */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Network className="w-4 h-4" />
                    Load Balancers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.integrations.loadBalancer.filter(l => l !== 'none').length > 0 ? (
                      searchResult.integrations.loadBalancer.filter(l => l !== 'none').map((l, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 text-sm border border-violet-500/20">
                          {getLabel(LOAD_BALANCER_OPTIONS, l)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">None specified</span>
                    )}
                  </div>
                </div>

                {/* DNS/IPAM */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Globe className="w-4 h-4" />
                    DNS / IPAM
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.integrations.dnsIpam.filter(d => d !== 'none').length > 0 ? (
                      searchResult.integrations.dnsIpam.filter(d => d !== 'none').map((d, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                          {getLabel(DNS_IPAM_OPTIONS, d)}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">None specified</span>
                    )}
                  </div>
                </div>
              </div>

              {searchResult.integrations.otherIntegrations && (
                <div className="mt-4 pt-4 border-t border-morpheus-800/50">
                  <div className="text-sm text-gray-500 mb-2">Other Integrations</div>
                  <p className="text-gray-300">{searchResult.integrations.otherIntegrations}</p>
                </div>
              )}
            </DetailCard>

            {/* Internal Notes */}
            {searchResult.internalNotes && (
              <DetailCard title="Admin Notes" icon={<FileText className="w-5 h-5" />}>
                <pre className="text-gray-300 whitespace-pre-wrap text-sm bg-morpheus-900/50 p-4 rounded-lg">
                  {searchResult.internalNotes}
                </pre>
              </DetailCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function DetailCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-morpheus-800/50">
        <div className="text-hpe-green-400">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-gray-500 mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`${highlight ? 'text-hpe-green-400 font-medium' : 'text-gray-300'}`}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status, large }: { status: POCStatus; large?: boolean }) {
  const colors: Record<POCStatus, string> = {
    'Draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Pending Review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Approved': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Active': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Extended': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Completed': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Expired': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full border font-medium
                     ${colors[status]} ${large ? 'text-sm' : 'text-xs'}`}>
      {status}
    </span>
  );
}

function getStatusIcon(status: POCStatus) {
  switch (status) {
    case 'Approved':
    case 'Active':
    case 'Completed':
      return <CheckCircle2 className="w-6 h-6 text-green-400" />;
    case 'Cancelled':
    case 'Expired':
      return <XCircle className="w-6 h-6 text-red-400" />;
    default:
      return <AlertCircle className="w-6 h-6 text-yellow-400" />;
  }
}

function getStatusMessage(status: POCStatus): string {
  const messages: Record<POCStatus, string> = {
    'Draft': 'This request is still in draft and has not been submitted.',
    'Pending Review': 'Your request is being reviewed. You will be notified once a decision is made.',
    'Approved': 'Your POC request has been approved! License details will be sent to your email.',
    'Active': 'Your POC is currently active. Good luck with your evaluation!',
    'Extended': 'Your POC has been extended. Please check the new end date.',
    'Completed': 'This POC has been completed. Thank you for using Morpheus!',
    'Expired': 'This POC has expired. Contact admin if you need an extension.',
    'Cancelled': 'This POC request was cancelled or rejected.',
  };
  return messages[status];
}

function getStatusBgColor(status: POCStatus): string {
  switch (status) {
    case 'Approved':
    case 'Active':
    case 'Completed':
      return 'bg-green-500/10 border border-green-500/20';
    case 'Cancelled':
    case 'Expired':
      return 'bg-red-500/10 border border-red-500/20';
    default:
      return 'bg-yellow-500/10 border border-yellow-500/20';
  }
}
