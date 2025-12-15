/**
 * Public Cloud Section
 * 
 * Grid layout for entering VM counts per cloud provider.
 * Optimized for fast data entry during customer calls.
 */

import { motion } from 'framer-motion';
import { 
  Cloud, 
  RefreshCw,
  Calculator,
} from 'lucide-react';
import type { PublicCloudEntry, CloudProviderType } from '../../types';
import { CLOUD_PROVIDER_OPTIONS } from '../../data/constants';
import { LICENSING_ASSUMPTIONS } from '../../types';
import { formatNumber } from '../../lib/utils';

interface PublicCloudSectionProps {
  publicCloud: PublicCloudEntry[];
  onUpdateVMs: (provider: CloudProviderType, vms: number) => void;
  onClear: () => void;
  totalVMs: number;
  totalSockets: number;
}

export function PublicCloudSection({
  publicCloud,
  onUpdateVMs,
  onClear,
  totalVMs,
  totalSockets,
}: PublicCloudSectionProps) {
  // Check if there are any VMs entered
  const hasVMs = totalVMs > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="section-title text-lg">Public Cloud</h2>
            <p className="section-subtitle">Enter VM counts per cloud provider</p>
          </div>
        </div>
        
        {/* Stats & Clear Button */}
        <div className="flex items-center gap-3">
          {hasVMs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="text-right text-sm">
                <div className="text-gray-400">
                  {formatNumber(totalVMs)} VMs
                </div>
                <motion.div
                  key={totalSockets}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="badge-blue"
                >
                  ≈ {formatNumber(totalSockets)} sockets
                </motion.div>
              </div>
              <button
                onClick={onClear}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-300 
                         hover:bg-morpheus-800/50 transition-colors"
                title="Clear all VM counts"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cloud Providers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {CLOUD_PROVIDER_OPTIONS.map((provider, index) => {
          const entry = publicCloud.find(e => e.provider === provider.value);
          const vms = entry?.vms || 0;
          
          return (
            <CloudProviderCard
              key={provider.value}
              provider={provider}
              vms={vms}
              onUpdate={(value) => onUpdateVMs(provider.value, value)}
              index={index}
            />
          );
        })}
      </div>

      {/* Calculation Info */}
      <div className="mt-4 p-3 rounded-lg bg-morpheus-900/50 border border-morpheus-800/50">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Calculator className="w-4 h-4 mt-0.5 text-gray-600" />
          <div>
            <strong className="text-gray-400">Assumption:</strong>{' '}
            {LICENSING_ASSUMPTIONS.VMS_PER_SOCKET} VMs ≈ 1 socket license
            <span className="mx-2 text-gray-600">•</span>
            <strong className="text-gray-400">Formula:</strong>{' '}
            ⌈ Total VMs ÷ {LICENSING_ASSUMPTIONS.VMS_PER_SOCKET} ⌉
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================================
// CLOUD PROVIDER CARD COMPONENT
// ============================================================================

interface CloudProviderCardProps {
  provider: typeof CLOUD_PROVIDER_OPTIONS[number];
  vms: number;
  onUpdate: (value: number) => void;
  index: number;
}

function CloudProviderCard({ provider, vms, onUpdate, index }: CloudProviderCardProps) {
  const hasValue = vms > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`p-3 rounded-xl border transition-all duration-200 ${
        hasValue 
          ? 'bg-morpheus-900/60 border-sky-500/30' 
          : 'bg-morpheus-900/30 border-morpheus-800/40 hover:border-morpheus-700/50'
      }`}
    >
      {/* Provider Label with Color Indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: provider.color }}
        />
        <span className="text-xs font-medium text-gray-400 truncate" title={provider.label}>
          {provider.shortLabel}
        </span>
      </div>

      {/* VM Count Input */}
      <input
        type="number"
        min="0"
        value={vms || ''}
        onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
        placeholder="0"
        className="w-full bg-morpheus-950/50 border border-morpheus-700/30 rounded-lg px-3 py-2
                   text-lg font-mono text-gray-100 placeholder-gray-600
                   focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20
                   transition-all duration-200 no-spinners text-center"
      />

      {/* VMs label */}
      <div className="mt-1 text-center text-[10px] text-gray-600 uppercase tracking-wide">
        VMs
      </div>
    </motion.div>
  );
}
