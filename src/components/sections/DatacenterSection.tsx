/**
 * On-Premises / Private Cloud Datacenter Section
 * 
 * Allows adding multiple datacenters/locations, each with multiple
 * hypervisor workloads (different hypervisors, host counts, etc.)
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
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import type { Datacenter, DatacenterWorkload } from '../../types';
import { HYPERVISOR_GROUPS, SOCKET_PRESETS } from '../../data/constants';
import { formatNumber } from '../../lib/utils';

interface DatacenterSectionProps {
  datacenters: Datacenter[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onAddWorkload: (datacenterId: string) => void;
  onRemoveWorkload: (datacenterId: string, workloadId: string) => void;
  onUpdateWorkload: (datacenterId: string, workloadId: string, field: keyof DatacenterWorkload, value: string | number) => void;
  totalSockets: number;
}

export function DatacenterSection({
  datacenters,
  onAdd,
  onRemove,
  onUpdateName,
  onDuplicate,
  onAddWorkload,
  onRemoveWorkload,
  onUpdateWorkload,
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
            <p className="section-subtitle">Configure datacenters with multiple workloads</p>
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
              onUpdateName={(name) => onUpdateName(dc.id, name)}
              onDuplicate={() => onDuplicate(dc.id)}
              onAddWorkload={() => onAddWorkload(dc.id)}
              onRemoveWorkload={(workloadId) => onRemoveWorkload(dc.id, workloadId)}
              onUpdateWorkload={(workloadId, field, value) => onUpdateWorkload(dc.id, workloadId, field, value)}
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
        Add Datacenter / Location
      </motion.button>

      {/* Calculation Info */}
      <div className="mt-4 p-3 rounded-lg bg-morpheus-900/50 border border-morpheus-800/50">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Info className="w-4 h-4 mt-0.5 text-gray-600" />
          <span>
            <strong className="text-gray-400">Calculation:</strong>{' '}
            On-Prem Sockets = Σ (Hosts × Sockets per Host) across all workloads in all datacenters
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
  onUpdateName: (name: string) => void;
  onDuplicate: () => void;
  onAddWorkload: () => void;
  onRemoveWorkload: (workloadId: string) => void;
  onUpdateWorkload: (workloadId: string, field: keyof DatacenterWorkload, value: string | number) => void;
}

function DatacenterCard({
  datacenter,
  index,
  isOnly,
  onRemove,
  onUpdateName,
  onDuplicate,
  onAddWorkload,
  onRemoveWorkload,
  onUpdateWorkload,
}: DatacenterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Calculate total sockets for this datacenter
  const dcSockets = (datacenter.workloads || []).reduce((total, w) => {
    return total + ((w.hosts || 0) * (w.socketsPerHost || 0));
  }, 0);

  const workloadCount = datacenter.workloads?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl bg-morpheus-900/40 border border-morpheus-800/40 
                 hover:border-morpheus-700/50 transition-colors overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-4 flex items-center justify-between border-b border-morpheus-800/30">
        <div className="flex items-center gap-3 flex-1">
          <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 
                          text-sm font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          
          {/* Datacenter Name Input */}
          <input
            type="text"
            value={datacenter.name}
            onChange={(e) => onUpdateName(e.target.value)}
            placeholder={`Datacenter ${index + 1} (e.g., Sydney DC1)`}
            className="bg-transparent border-none text-gray-200 font-medium text-sm 
                       placeholder-gray-600 focus:outline-none focus:ring-0 flex-1 min-w-0"
          />
        </div>
        
        {/* Stats and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {workloadCount} workload{workloadCount !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center gap-1 text-purple-400">
              <Cpu className="w-3 h-3" />
              {formatNumber(dcSockets)} sockets
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 
                       hover:bg-morpheus-800/50 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
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

      {/* Workloads Section - Collapsible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Workloads */}
              {(datacenter.workloads || []).map((workload, wIndex) => (
                <WorkloadRow
                  key={workload.id}
                  workload={workload}
                  index={wIndex}
                  isOnly={(datacenter.workloads?.length || 0) <= 1}
                  onRemove={() => onRemoveWorkload(workload.id)}
                  onUpdate={(field, value) => onUpdateWorkload(workload.id, field, value)}
                />
              ))}

              {/* Add Workload Button */}
              <button
                onClick={onAddWorkload}
                className="w-full py-2 border border-dashed border-morpheus-700/40 rounded-lg
                           text-gray-500 text-sm font-medium flex items-center justify-center gap-2
                           hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5
                           transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Workload
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// WORKLOAD ROW COMPONENT
// ============================================================================

interface WorkloadRowProps {
  workload: DatacenterWorkload;
  index: number;
  isOnly: boolean;
  onRemove: () => void;
  onUpdate: (field: keyof DatacenterWorkload, value: string | number) => void;
}

function WorkloadRow({
  workload,
  index,
  isOnly,
  onRemove,
  onUpdate,
}: WorkloadRowProps) {
  const workloadSockets = (workload.hosts || 0) * (workload.socketsPerHost || 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 rounded-lg bg-morpheus-800/30 border border-morpheus-700/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-500">
          Workload {index + 1}
        </span>
        <span className="text-xs text-gray-600">•</span>
        <span className="text-xs text-purple-400">
          {formatNumber(workloadSockets)} sockets
        </span>
        <div className="flex-1" />
        {!isOnly && (
          <button
            onClick={onRemove}
            className="p-1 rounded text-gray-600 hover:text-red-400 
                     hover:bg-red-500/10 transition-colors"
            title="Remove workload"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Hypervisor */}
        <div className="space-y-1">
          <label className="text-xs text-gray-600">Hypervisor</label>
          <select
            value={workload.hypervisor}
            onChange={(e) => onUpdate('hypervisor', e.target.value)}
            className="select-field py-2 text-sm"
          >
            <option value="">Select...</option>
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
        <div className="space-y-1">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            Hosts
          </label>
          <input
            type="number"
            min="0"
            value={workload.hosts || ''}
            onChange={(e) => onUpdate('hosts', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="input-field-compact no-spinners"
          />
        </div>

        {/* Sockets per Host */}
        <div className="space-y-1">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Sockets/Host
          </label>
          <select
            value={workload.socketsPerHost}
            onChange={(e) => onUpdate('socketsPerHost', parseInt(e.target.value))}
            className="select-field py-2 text-sm"
          >
            {SOCKET_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.value} ({preset.label})
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}
