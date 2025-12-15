/**
 * Kubernetes Section - Multiple Clusters Support
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Container,
  Calculator,
  Plus,
  Trash2,
  Copy,
  MapPin,
  Cpu,
} from 'lucide-react';
import type { KubernetesCluster } from '../../types';
import { LICENSING_ASSUMPTIONS } from '../../types';
import { K8S_DISTRIBUTION_OPTIONS, K8S_LOCATION_OPTIONS } from '../../data/constants';
import { formatNumber } from '../../lib/utils';

interface KubernetesSectionProps {
  clusters: KubernetesCluster[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof KubernetesCluster, value: string | number) => void;
  onDuplicate: (id: string) => void;
  totalWorkers: number;
  totalSockets: number;
}

export function KubernetesSection({
  clusters,
  onAdd,
  onRemove,
  onUpdate,
  onDuplicate,
  totalWorkers,
  totalSockets,
}: KubernetesSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Container className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="section-title text-lg">Kubernetes Clusters</h2>
            <p className="section-subtitle">Add all K8s clusters to be managed</p>
          </div>
        </div>
        
        {totalWorkers > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{formatNumber(totalWorkers)} workers</span>
            <motion.div
              key={totalSockets}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="badge bg-orange-500/15 text-orange-400 border border-orange-500/30"
            >
              <Cpu className="w-3 h-3 mr-1" />
              {formatNumber(totalSockets)} sockets
            </motion.div>
          </div>
        )}
      </div>

      {/* Clusters List */}
      {clusters.length > 0 ? (
        <div className="space-y-3 mb-4">
          <AnimatePresence mode="popLayout">
            {clusters.map((cluster, index) => (
              <K8sClusterCard
                key={cluster.id}
                cluster={cluster}
                index={index}
                onRemove={() => onRemove(cluster.id)}
                onUpdate={(field, value) => onUpdate(cluster.id, field, value)}
                onDuplicate={() => onDuplicate(cluster.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mb-4 p-4 rounded-xl bg-morpheus-900/30 border border-dashed border-morpheus-700/50 text-center">
          <p className="text-gray-500 text-sm">No Kubernetes clusters added yet</p>
          <p className="text-gray-600 text-xs mt-1">Click "Add Cluster" if the customer has K8s environments</p>
        </div>
      )}

      {/* Add Cluster Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onAdd}
        className="w-full py-3 border-2 border-dashed border-morpheus-700/50 rounded-xl
                   text-gray-400 font-medium flex items-center justify-center gap-2
                   hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5
                   transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
        Add Kubernetes Cluster
      </motion.button>

      {/* Calculation Info */}
      <div className="mt-4 p-3 rounded-lg bg-morpheus-900/50 border border-morpheus-800/50">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Calculator className="w-4 h-4 mt-0.5 text-gray-600" />
          <div>
            <strong className="text-gray-400">Assumption:</strong>{' '}
            {LICENSING_ASSUMPTIONS.K8S_WORKERS_PER_SOCKET} worker nodes ≈ 1 socket license
            <span className="mx-2 text-gray-600">•</span>
            Supports EKS, AKS, GKE, OpenShift, Rancher, Tanzu, MKS, and more
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ============================================================================
// K8S CLUSTER CARD COMPONENT
// ============================================================================

interface K8sClusterCardProps {
  cluster: KubernetesCluster;
  index: number;
  onRemove: () => void;
  onUpdate: (field: keyof KubernetesCluster, value: string | number) => void;
  onDuplicate: () => void;
}

function K8sClusterCard({
  cluster,
  index,
  onRemove,
  onUpdate,
  onDuplicate,
}: K8sClusterCardProps) {
  const clusterSockets = cluster.workers > 0 
    ? Math.ceil(cluster.workers / LICENSING_ASSUMPTIONS.K8S_WORKERS_PER_SOCKET) 
    : 0;

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
          <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 
                          text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-300">
            {cluster.name || `Cluster ${index + 1}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {formatNumber(clusterSockets)} sockets
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 
                       hover:bg-morpheus-800/50 transition-colors"
              title="Duplicate cluster"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 
                       hover:bg-red-500/10 transition-colors"
              title="Remove cluster"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Cluster Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Cluster Name
          </label>
          <input
            type="text"
            value={cluster.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Production EKS"
            className="input-field-compact"
          />
        </div>

        {/* Distribution */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Distribution
          </label>
          <select
            value={cluster.distribution}
            onChange={(e) => onUpdate('distribution', e.target.value)}
            className="select-field py-2.5 text-sm"
          >
            {K8S_DISTRIBUTION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Location
          </label>
          <select
            value={cluster.location}
            onChange={(e) => onUpdate('location', e.target.value)}
            className="select-field py-2.5 text-sm"
          >
            {K8S_LOCATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Worker Nodes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Worker Nodes
          </label>
          <input
            type="number"
            min="0"
            value={cluster.workers || ''}
            onChange={(e) => onUpdate('workers', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="input-field-compact no-spinners"
          />
        </div>
      </div>
    </motion.div>
  );
}
