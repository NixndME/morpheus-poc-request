/**
 * POC Details Section
 * 
 * Captures POC-specific information: use case, duration, success criteria.
 */

import { motion } from 'framer-motion';
import { FileText, Calendar, Target, Clock, AlertTriangle, DollarSign, CheckCircle, Info } from 'lucide-react';
import type { POCDetails } from '../../types';
import { POC_DURATION_OPTIONS, DEAL_SIZE_OPTIONS } from '../../data/constants';
import { cn, formatDate, getDaysRemaining } from '../../lib/utils';

interface POCDetailsSectionProps {
  pocDetails: POCDetails;
  onUpdate: (field: keyof POCDetails, value: string | number | boolean) => void;
  isValid: boolean;
}

export function POCDetailsSection({ pocDetails, onUpdate, isValid }: POCDetailsSectionProps) {
  const daysRemaining = pocDetails.expectedEndDate ? getDaysRemaining(pocDetails.expectedEndDate) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="section-title text-lg">POC Details</h2>
          <p className="section-subtitle">Describe the proof of concept requirements</p>
        </div>
        {!isValid && (
          <span className="ml-auto text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
            Required fields missing
          </span>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Use Case Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Target className="w-4 h-4 text-gray-500" />
            Use Case Description
            <span className="text-red-400">*</span>
          </label>
          <textarea
            value={pocDetails.useCaseDescription}
            onChange={(e) => onUpdate('useCaseDescription', e.target.value)}
            placeholder="Describe what the customer wants to achieve with Morpheus. E.g., VMware migration, multi-cloud management, self-service portal, Kubernetes orchestration..."
            rows={3}
            className={cn(
              'input-field resize-none',
              pocDetails.useCaseDescription.trim() === '' && 'border-amber-500/30'
            )}
          />
        </div>

        {/* Business Justification */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <FileText className="w-4 h-4 text-gray-500" />
            Business Justification
          </label>
          <textarea
            value={pocDetails.businessJustification}
            onChange={(e) => onUpdate('businessJustification', e.target.value)}
            placeholder="Why does the customer need this POC? What business problem are they solving? Is there an existing budget?"
            rows={2}
            className="input-field resize-none"
          />
        </div>

        {/* Duration, Start Date, End Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* POC Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Clock className="w-4 h-4 text-gray-500" />
              POC Duration
              <span className="text-red-400">*</span>
            </label>
            <select
              value={pocDetails.duration}
              onChange={(e) => onUpdate('duration', parseInt(e.target.value))}
              className="select-field"
            >
              {POC_DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500" />
              Requested Start Date
            </label>
            <input
              type="date"
              value={pocDetails.startDate}
              onChange={(e) => onUpdate('startDate', e.target.value)}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Expected End Date (auto-calculated) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500" />
              Expected End Date
            </label>
            <div className="input-field bg-morpheus-900/70 text-gray-400 flex items-center justify-between">
              <span>{pocDetails.expectedEndDate ? formatDate(pocDetails.expectedEndDate) : 'Auto-calculated'}</span>
              {daysRemaining !== null && daysRemaining > 0 && (
                <span className="text-xs text-hpe-green-400">{daysRemaining} days</span>
              )}
            </div>
          </div>
        </div>

        {/* Deal Size and Environment Ready */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deal Size / Budget */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <DollarSign className="w-4 h-4 text-gray-500" />
              Deal Size / Budget
              <span className="text-red-400">*</span>
            </label>
            <select
              value={pocDetails.dealSize}
              onChange={(e) => onUpdate('dealSize', e.target.value)}
              className={cn(
                'select-field',
                !pocDetails.dealSize && 'border-amber-500/30'
              )}
            >
              <option value="">Select deal size...</option>
              {DEAL_SIZE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* POC Environment Ready */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              POC Environment Ready?
              <span className="text-red-400">*</span>
              {/* Info Tooltip */}
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-500 hover:text-hpe-green-400 cursor-help transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 rounded-lg 
                                bg-morpheus-800 border border-morpheus-700 shadow-xl
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                transition-all duration-200 z-50">
                  <div className="text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-hpe-green-400 mb-2">Environment Ready Criteria:</p>
                    <ul className="space-y-1 text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-hpe-green-400 mt-0.5">✓</span>
                        <span>Hypervisor infrastructure provisioned</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-hpe-green-400 mt-0.5">✓</span>
                        <span>Network connectivity configured</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-hpe-green-400 mt-0.5">✓</span>
                        <span>Required credentials available</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-hpe-green-400 mt-0.5">✓</span>
                        <span>Firewall rules / ports opened</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-hpe-green-400 mt-0.5">✓</span>
                        <span>Customer resources allocated</span>
                      </li>
                    </ul>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 
                                  border-l-8 border-r-8 border-t-8 
                                  border-l-transparent border-r-transparent border-t-morpheus-700" />
                </div>
              </div>
            </label>
            <div className="flex gap-4 pt-2">
              <label className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all',
                pocDetails.environmentReady === true
                  ? 'border-hpe-green-500 bg-hpe-green-500/10 text-hpe-green-400'
                  : 'border-morpheus-700 hover:border-morpheus-600 text-gray-400'
              )}>
                <input
                  type="radio"
                  name="environmentReady"
                  checked={pocDetails.environmentReady === true}
                  onChange={() => onUpdate('environmentReady', true)}
                  className="sr-only"
                />
                <CheckCircle className={cn(
                  'w-4 h-4',
                  pocDetails.environmentReady === true ? 'text-hpe-green-400' : 'text-gray-500'
                )} />
                Yes
              </label>
              <label className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all',
                pocDetails.environmentReady === false
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-morpheus-700 hover:border-morpheus-600 text-gray-400'
              )}>
                <input
                  type="radio"
                  name="environmentReady"
                  checked={pocDetails.environmentReady === false}
                  onChange={() => onUpdate('environmentReady', false)}
                  className="sr-only"
                />
                <AlertTriangle className={cn(
                  'w-4 h-4',
                  pocDetails.environmentReady === false ? 'text-amber-400' : 'text-gray-500'
                )} />
                No
              </label>
            </div>
            {pocDetails.environmentReady === false && (
              <p className="text-xs text-amber-400 mt-1">
                Note: POC may be delayed until environment is ready
              </p>
            )}
          </div>
        </div>

        {/* Success Criteria */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Target className="w-4 h-4 text-gray-500" />
            Success Criteria
            <span className="text-red-400">*</span>
          </label>
          <textarea
            value={pocDetails.successCriteria}
            onChange={(e) => onUpdate('successCriteria', e.target.value)}
            placeholder="Define what success looks like for this POC. E.g., successful VM migration, cost savings demonstrated, self-service portal deployed..."
            rows={2}
            className={cn(
              'input-field resize-none',
              pocDetails.successCriteria.trim() === '' && 'border-amber-500/30'
            )}
          />
        </div>

        {/* Duration Warning */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2 text-xs text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <div>
              <strong>POC Duration Policy:</strong> Standard POCs are 45 days. Extensions beyond 90 days require 
              additional approval. Please ensure the customer is committed to evaluating within the requested timeframe.
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
