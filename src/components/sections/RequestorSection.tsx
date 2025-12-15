/**
 * Requestor Information Section
 * Includes optional Opportunity ID field
 */

import { motion } from 'framer-motion';
import { UserCircle, Mail, Building, Globe, Briefcase, Hash } from 'lucide-react';
import type { RequestorInfo } from '../../types';
import { REQUESTOR_TYPE_OPTIONS, REGION_OPTIONS } from '../../data/constants';
import { cn } from '../../lib/utils';

interface RequestorSectionProps {
  requestor: RequestorInfo;
  onUpdate: (field: keyof RequestorInfo, value: string) => void;
  isValid: boolean;
}

export function RequestorSection({ requestor, onUpdate, isValid }: RequestorSectionProps) {
  const showCompanyField = ['partner-engineer', 'gsi-partner', 'distributor'].includes(requestor.type);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="section-title text-lg">Requestor Information</h2>
          <p className="section-subtitle">Who is requesting this POC license?</p>
        </div>
        {!isValid && (
          <span className="ml-auto text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
            Required fields missing
          </span>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Requestor Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <UserCircle className="w-4 h-4 text-gray-500" />
            Your Name
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={requestor.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., John Smith"
            className={cn(
              'input-field',
              requestor.name.trim() === '' && 'border-amber-500/30'
            )}
          />
        </div>

        {/* Requestor Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Mail className="w-4 h-4 text-gray-500" />
            Your Email
            <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={requestor.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            placeholder="e.g., john.smith@hpe.com"
            className={cn(
              'input-field',
              requestor.email.trim() === '' && 'border-amber-500/30'
            )}
          />
        </div>

        {/* Requestor Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Requestor Type
            <span className="text-red-400">*</span>
          </label>
          <select
            value={requestor.type}
            onChange={(e) => onUpdate('type', e.target.value)}
            className="select-field"
          >
            {REQUESTOR_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Company/Partner Name (conditional) */}
        {showCompanyField && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Building className="w-4 h-4 text-gray-500" />
              Partner/Company Name
            </label>
            <input
              type="text"
              value={requestor.company}
              onChange={(e) => onUpdate('company', e.target.value)}
              placeholder="e.g., AC3, DXC, Kyndryl"
              className="input-field"
            />
          </div>
        )}

        {/* Region */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Globe className="w-4 h-4 text-gray-500" />
            Region
          </label>
          <select
            value={requestor.region}
            onChange={(e) => onUpdate('region', e.target.value)}
            className="select-field"
          >
            {REGION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Opportunity ID (Optional) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Hash className="w-4 h-4 text-gray-500" />
            Opportunity ID
            <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={requestor.opportunityId}
            onChange={(e) => onUpdate('opportunityId', e.target.value)}
            placeholder="e.g., OPP-123456"
            className="input-field"
          />
          <p className="text-xs text-gray-600">Sales opportunity ID if available</p>
        </div>
      </div>
    </motion.section>
  );
}
