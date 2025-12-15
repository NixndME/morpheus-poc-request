/**
 * Summary Section - POC Request
 * Displays Reference ID prominently, infrastructure summary, and submission actions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  FileText, 
  Download,
  Server,
  Cloud,
  Container,
  Layers,
  AlertCircle,
  Send,
  Copy,
  Check,
  Clock,
  User,
  Building2,
  Hash,
  Clipboard,
} from 'lucide-react';
import { useState } from 'react';
import type { Calculations, POCRequest, RequestorInfo, CustomerInfo, POCDetails } from '../../types';
import { formatNumber, formatDate } from '../../lib/utils';

interface SummarySectionProps {
  referenceId: string;
  requestor: RequestorInfo;
  customer: CustomerInfo;
  pocDetails: POCDetails;
  calculations: Calculations;
  totalPublicCloudVMs: number;
  totalK8sWorkers: number;
  canSubmitRequest: boolean;
  onGetPOCRequest: () => POCRequest;
  onSubmit?: () => void;
}

export function SummarySection({
  referenceId,
  requestor,
  customer,
  pocDetails,
  calculations,
  totalPublicCloudVMs,
  totalK8sWorkers,
  canSubmitRequest,
  onGetPOCRequest,
  onSubmit,
}: SummarySectionProps) {
  const [copied, setCopied] = useState(false);
  const [copiedRefId, setCopiedRefId] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { onPremSockets, publicCloudSockets, kubernetesSockets, totalSockets } = calculations;

  const handleCopyRefId = async () => {
    await navigator.clipboard.writeText(referenceId);
    setCopiedRefId(true);
    setTimeout(() => setCopiedRefId(false), 2000);
  };

  const handleCopyJSON = async () => {
    const data = onGetPOCRequest();
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowExportMenu(false);
  };

  const handleExport = (format: 'json' | 'console') => {
    const data = onGetPOCRequest();
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${referenceId}-${customer.name.replace(/\s+/g, '-').toLowerCase() || 'request'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.log('=== POC License Request Data ===');
      console.log('Reference ID:', referenceId);
      console.log(data);
    }
    
    setShowExportMenu(false);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    } else {
      const data = onGetPOCRequest();
      console.log('=== POC License Request Submitted ===');
      console.log('Reference ID:', referenceId);
      console.log(JSON.stringify(data, null, 2));
      alert(
        `✅ POC License Request Submitted!\n\n` +
        `📋 Reference ID: ${referenceId}\n\n` +
        `Requestor: ${requestor.name}\n` +
        `Customer: ${customer.name}\n` +
        `Duration: ${pocDetails.duration} days\n` +
        `Total Sockets: ${totalSockets}\n` +
        `${requestor.opportunityId ? `Opportunity ID: ${requestor.opportunityId}\n` : ''}` +
        `\n💡 This Reference ID will be used to track this POC.\n` +
        `Save it for future reference and PO mapping.\n\n` +
        `Check browser console for full JSON data.`
      );
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-card-elevated p-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-hpe-green-500/5 rounded-full blur-3xl" />
      </div>

      {/* Reference ID - Most Important */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-hpe-green-500/10 to-hpe-green-600/5 
                   border border-hpe-green-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-hpe-green-400 font-medium mb-1">
              <Hash className="w-3 h-3" />
              POC Reference ID
            </div>
            <div className="text-2xl font-mono font-bold text-hpe-green-400 tracking-wider">
              {referenceId}
            </div>
          </div>
          <button
            onClick={handleCopyRefId}
            className="p-2 rounded-lg bg-hpe-green-500/10 hover:bg-hpe-green-500/20 
                     text-hpe-green-400 transition-colors"
            title="Copy Reference ID"
          >
            {copiedRefId ? <Check className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Use this ID to track the POC and link to future PO
        </p>
      </motion.div>

      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-morpheus-800/50 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-300">Request Summary</h3>
      </div>

      {/* Requestor & Customer Quick View */}
      {(requestor.name || customer.name) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {requestor.name && (
            <div className="p-3 rounded-lg bg-morpheus-900/40 border border-morpheus-800/40">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <User className="w-3 h-3" />
                Requestor
              </div>
              <div className="text-sm font-medium text-gray-200 truncate">{requestor.name}</div>
              <div className="text-xs text-gray-500 truncate">{requestor.email}</div>
              {requestor.opportunityId && (
                <div className="text-xs text-hpe-green-400 mt-1">OPP: {requestor.opportunityId}</div>
              )}
            </div>
          )}
          {customer.name && (
            <div className="p-3 rounded-lg bg-morpheus-900/40 border border-morpheus-800/40">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <Building2 className="w-3 h-3" />
                Customer
              </div>
              <div className="text-sm font-medium text-gray-200 truncate">{customer.name}</div>
              <div className="text-xs text-gray-500">{customer.industry || 'Industry not specified'}</div>
            </div>
          )}
        </div>
      )}

      {/* POC Duration */}
      {pocDetails.duration > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{pocDetails.duration} Day POC</span>
            {pocDetails.startDate && (
              <span className="text-xs text-amber-400/70 ml-auto">
                {formatDate(pocDetails.startDate)} → {formatDate(pocDetails.expectedEndDate)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Socket Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <SocketCard icon={<Server className="w-3.5 h-3.5" />} label="On-Prem" sockets={onPremSockets} color="purple" />
        <SocketCard icon={<Cloud className="w-3.5 h-3.5" />} label="Cloud" sockets={publicCloudSockets} detail={`${totalPublicCloudVMs} VMs`} color="sky" />
        <SocketCard icon={<Container className="w-3.5 h-3.5" />} label="K8s" sockets={kubernetesSockets} detail={`${totalK8sWorkers} nodes`} color="orange" />
      </div>

      {/* Total Sockets */}
      <motion.div className="p-4 rounded-xl bg-gradient-to-br from-morpheus-800/50 to-morpheus-900/50 border border-morpheus-700/30 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-hpe-green-400" />
            <div>
              <div className="text-xs text-gray-500">Total POC Sockets</div>
              <motion.div key={totalSockets} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-2xl font-display font-bold text-hpe-green-400">
                {formatNumber(totalSockets)}
              </motion.div>
            </div>
          </div>
          <div className="text-xs text-gray-600 text-right font-mono">
            {onPremSockets} + {publicCloudSockets} + {kubernetesSockets}
          </div>
        </div>
      </motion.div>

      {/* Validation Status */}
      <AnimatePresence>
        {!canSubmitRequest && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Complete all required fields to submit</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: canSubmitRequest ? 1.02 : 1 }}
          whileTap={{ scale: canSubmitRequest ? 0.98 : 1 }}
          disabled={!canSubmitRequest}
          onClick={handleSubmit}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitted ? (<><Check className="w-5 h-5" />Request Submitted!</>) : (<><Send className="w-5 h-5" />Submit POC Request</>)}
        </motion.button>

        <div className="relative">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowExportMenu(!showExportMenu)} className="w-full btn-secondary flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </motion.button>

          <AnimatePresence>
            {showExportMenu && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 right-0 mt-2 py-2 rounded-xl bg-morpheus-800 border border-morpheus-700/50 shadow-xl z-50">
                <button onClick={() => handleExport('json')} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-morpheus-700/50 flex items-center gap-2">
                  <FileText className="w-4 h-4" />Download JSON
                </button>
                <button onClick={handleCopyJSON} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-morpheus-700/50 flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button onClick={() => handleExport('console')} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-morpheus-700/50 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />Log to Console
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-4 border-t border-morpheus-800/50 text-xs text-gray-600">
        POC licenses: 45-90 days. Reference ID is stored with all request data for tracking and PO mapping.
      </div>
    </motion.section>
  );
}

function SocketCard({ icon, label, sockets, detail, color }: { icon: React.ReactNode; label: string; sockets: number; detail?: string; color: 'purple' | 'sky' | 'orange' }) {
  const colors = {
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  };
  return (
    <div className={`p-2.5 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center gap-1 mb-1">{icon}<span className="text-xs text-gray-400">{label}</span></div>
      <div className="text-xl font-display font-bold">{formatNumber(sockets)}</div>
      {detail && <div className="text-[10px] text-gray-600">{detail}</div>}
    </div>
  );
}
