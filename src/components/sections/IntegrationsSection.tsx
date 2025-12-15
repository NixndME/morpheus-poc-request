/**
 * Integrations Section
 * Captures Automation/IAM, ITSM, Load Balancer, DNS/IPAM requirements
 */

import { motion } from 'framer-motion';
import { 
  Workflow,
  Ticket,
  Network,
  Globe,
  Info,
  Check,
} from 'lucide-react';
import type { IntegrationConfig, AutomationType, ITSMType, LoadBalancerType, DNSIPAMType } from '../../types';
import { 
  AUTOMATION_OPTIONS, 
  ITSM_OPTIONS, 
  LOAD_BALANCER_OPTIONS,
  DNS_IPAM_OPTIONS,
} from '../../data/constants';
import { cn } from '../../lib/utils';

interface IntegrationsSectionProps {
  integrations: IntegrationConfig;
  onUpdateIntegration: <K extends keyof IntegrationConfig>(field: K, value: IntegrationConfig[K]) => void;
  onToggleAutomation: (tool: AutomationType) => void;
  onToggleLoadBalancer: (lb: LoadBalancerType) => void;
  onToggleDnsIpam: (dns: DNSIPAMType) => void;
}

export function IntegrationsSection({
  integrations,
  onUpdateIntegration,
  onToggleAutomation,
  onToggleLoadBalancer,
  onToggleDnsIpam,
}: IntegrationsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <Workflow className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="section-title text-lg">Integrations</h2>
          <p className="section-subtitle">Current or planned tool integrations</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Automation / IAM Tools */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Workflow className="w-4 h-4 text-gray-500" />
            Automation / Configuration Management
            <span className="text-xs text-gray-500 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {AUTOMATION_OPTIONS.map(opt => {
              const isSelected = integrations.automation.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => onToggleAutomation(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-morpheus-800/40 text-gray-500 border border-morpheus-700/30 hover:text-gray-300 hover:border-morpheus-600/50'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ITSM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Ticket className="w-4 h-4 text-gray-500" />
              ITSM Platform
            </label>
            <select
              value={integrations.itsm}
              onChange={(e) => onUpdateIntegration('itsm', e.target.value as ITSMType)}
              className="select-field"
            >
              {ITSM_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {integrations.itsm !== 'none' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                ITSM Details
                <span className="text-xs text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={integrations.itsmDetails}
                onChange={(e) => onUpdateIntegration('itsmDetails', e.target.value)}
                placeholder="e.g., Instance URL, integration scope"
                className="input-field"
              />
            </div>
          )}
        </div>

        {/* Load Balancers */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Network className="w-4 h-4 text-gray-500" />
            Load Balancers
            <span className="text-xs text-gray-500 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LOAD_BALANCER_OPTIONS.map(opt => {
              const isSelected = integrations.loadBalancer.includes(opt.value);
              
              return (
                <button
                  key={opt.value}
                  onClick={() => onToggleLoadBalancer(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    isSelected
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                      : 'bg-morpheus-800/40 text-gray-500 border border-morpheus-700/30 hover:text-gray-300 hover:border-morpheus-600/50'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DNS / IPAM */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
            <Globe className="w-4 h-4 text-gray-500" />
            DNS / IPAM
            <span className="text-xs text-gray-500 font-normal">(select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DNS_IPAM_OPTIONS.map(opt => {
              const isSelected = integrations.dnsIpam.includes(opt.value);
              
              return (
                <button
                  key={opt.value}
                  onClick={() => onToggleDnsIpam(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-morpheus-800/40 text-gray-500 border border-morpheus-700/30 hover:text-gray-300 hover:border-morpheus-600/50'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Other Integrations */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            Other Integrations
            <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={integrations.otherIntegrations}
            onChange={(e) => onUpdateIntegration('otherIntegrations', e.target.value)}
            placeholder="Any other tools or integrations the customer needs (e.g., Splunk, Datadog, custom APIs...)"
            rows={2}
            className="input-field resize-none"
          />
        </div>

        {/* Info Note */}
        <div className="p-3 rounded-lg bg-morpheus-900/50 border border-morpheus-800/50">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info className="w-4 h-4 mt-0.5 text-gray-600" />
            <span>
              This helps us understand the customer's environment and ensure Morpheus can integrate 
              with their existing toolchain. Not all integrations require special licensing.
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
