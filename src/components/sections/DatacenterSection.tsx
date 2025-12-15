/**
 * On-Premises / Private Cloud Datacenter Section
 * 
 * Allows adding multiple datacenters with hypervisor selection,
 * host count, and sockets per host configuration.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Plus, 
  Trash2, 
  Copy, 
  HardDrive,
  Cpu,
  Info,
} from 'lucide-react';
import type { Datacenter } from '../../types';
import { HYPERVISOR_GROUPS, SOCKET_PRESETS } from '../../data/constants';
import { formatNumber } from '../../lib/utils';

interface DatacenterSectionProps {
  datacenters: Datacenter[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Datacenter, value: string | number) => void;
  onDuplicate: (id: string) => void;
  totalSockets: number;
}

export function DatacenterSection({
  datacenters,
  onAdd,
  onRemove,
  onUpdate,
  onDuplicate,
  totalSockets,
}: DatacenterSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Server className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="section-title text-lg">On-Premises / Private Cloud</h2>
            <p className="section-subtitle">Configure datacenters and hypervisor hosts</p>
          </div>
        </div>
        
        {/* Socket Count Badge */}
        <div className="flex items-center gap-2">
          <motion.div
            key={totalSockets}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="badge-purple"
          >
            <Cpu className="w-3 h-3 mr-1" />
            {formatNumber(totalSockets)} sockets
          </motion.div>
        </div>
      </div>

      {/* Datacenters List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {datacenters.map((dc, index) => (
            <DatacenterCard
              key={dc.id}
              datacenter={dc}
              index={index}
              isOnly={datacenters.length === 1}
              onRemove={() => onRemove(dc.id)}
              onUpdate={(field, value) => onUpdate(dc.id, field, value)}
              onDuplicate={() => onDuplicate(dc.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add Datacenter Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onAdd}
        className="mt-4 w-full py-3 border-2 border-dashed border-morpheus-700/50 rounded-xl
                   text-gray-400 font-medium flex items-center justify-center gap-2
                   hover:border-hpe-green-500/40 hover:text-hpe-green-400 hover:bg-hpe-green-500/5
                   transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        Add Datacenter
      </motion.button>

      {/* Calculation Info */}
      <div className="mt-4 p-3 rounded-lg bg-morpheus-900/50 border border-morpheus-800/50">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4 mt-0.5 text-gray-600" />
          <span>
            <strong className="text-gray-400">Calculation:</strong>{' '}
            On-Prem Sockets = Σ (Hosts × Sockets per Host) across all datacenters
          </span>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================================
// DATACENTER CARD COMPONENT
// ============================================================================

interface DatacenterCardProps {
  datacenter: Datacenter;
  index: number;
  isOnly: boolean;
  onRemove: () => void;
  onUpdate: (field: keyof Datacenter, value: string | number) => void;
  onDuplicate: () => void;
}

function DatacenterCard({
  datacenter,
  index,
  isOnly,
  onRemove,
  onUpdate,
  onDuplicate,
}: DatacenterCardProps) {
  const dcSockets = (datacenter.hosts || 0) * (datacenter.socketsPerHost || 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      transition={{ duration: 0.2 }}
      className="p-4 rounded-xl bg-morpheus-900/40 border border-morpheus-800/40 
                 hover:border-morpheus-700/50 transition-colors"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 
                          text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-300">
            {datacenter.name || `Datacenter ${index + 1}`}
          </span>
        </div>
        
        {/* Socket count for this DC */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {formatNumber(dcSockets)} sockets
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 
                       hover:bg-morpheus-800/50 transition-colors"
              title="Duplicate datacenter"
            >
              <Copy className="w-4 h-4" />
            </button>
            {!isOnly && (
              <button
                onClick={onRemove}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 
                         hover:bg-red-500/10 transition-colors"
                title="Remove datacenter"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Datacenter Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Name
          </label>
          <input
            type="text"
            value={datacenter.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Sydney DC1"
            className="input-field-compact"
          />
        </div>

        {/* Hypervisor */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Hypervisor
          </label>
          <select
            value={datacenter.hypervisor}
            onChange={(e) => onUpdate('hypervisor', e.target.value)}
            className="select-field py-2.5 text-sm"
          >
            <option value="">Select hypervisor...</option>
            <optgroup label="Enterprise">
              {HYPERVISOR_GROUPS.enterprise.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </optgroup>
            <optgroup label="Cloud Infrastructure">
              {HYPERVISOR_GROUPS.cloud.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </optgroup>
            <optgroup label="Specialized">
              {HYPERVISOR_GROUPS.specialized.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Number of Hosts */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            Hosts
          </label>
          <input
            type="number"
            min="0"
            value={datacenter.hosts || ''}
            onChange={(e) => onUpdate('hosts', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="input-field-compact no-spinners"
          />
        </div>

        {/* Sockets per Host */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Sockets/Host
          </label>
          <div className="flex gap-2">
            <select
              value={datacenter.socketsPerHost}
              onChange={(e) => onUpdate('socketsPerHost', parseInt(e.target.value))}
              className="select-field py-2.5 text-sm flex-1"
            >
              {SOCKET_PRESETS.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.value} ({preset.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
