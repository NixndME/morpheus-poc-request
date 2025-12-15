/**
 * Customer Information Section
 * 
 * Captures end-customer details for the POC.
 */

import { motion } from 'framer-motion';
import { Building2, Mail, User, Globe, Factory } from 'lucide-react';
import type { CustomerInfo } from '../../types';
import { INDUSTRY_OPTIONS } from '../../data/constants';
import { cn } from '../../lib/utils';

interface CustomerSectionProps {
  customer: CustomerInfo;
  onUpdate: (field: keyof CustomerInfo, value: string) => void;
  isValid: boolean;
}

export function CustomerSection({ customer, onUpdate, isValid }: CustomerSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass-card p-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="section-title text-lg">Customer Information</h2>
          <p className="section-subtitle">End-customer details for the POC</p>
        </div>
        {!isValid && (
          <span className="ml-auto text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
            Required fields missing
          </span>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Building2 className="w-4 h-4 text-gray-500" />
            Customer / Account Name
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="e.g., Sydney Water Corporation"
            className={cn(
              'input-field',
              customer.name.trim() === '' && 'border-amber-500/30'
            )}
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Factory className="w-4 h-4 text-gray-500" />
            Industry
            <span className="text-red-400">*</span>
          </label>
          <select
            value={customer.industry}
            onChange={(e) => onUpdate('industry', e.target.value)}
            className={cn(
              'select-field',
              customer.industry === '' && 'border-amber-500/30'
            )}
          >
            <option value="">Select industry...</option>
            {INDUSTRY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Globe className="w-4 h-4 text-gray-500" />
            Country
          </label>
          <input
            type="text"
            value={customer.country}
            onChange={(e) => onUpdate('country', e.target.value)}
            placeholder="e.g., Australia"
            className="input-field"
          />
        </div>

        {/* Contact Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <User className="w-4 h-4 text-gray-500" />
            Customer Contact Name
          </label>
          <input
            type="text"
            value={customer.contactName}
            onChange={(e) => onUpdate('contactName', e.target.value)}
            placeholder="e.g., Jane Doe"
            className="input-field"
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Mail className="w-4 h-4 text-gray-500" />
            Customer Contact Email
          </label>
          <input
            type="email"
            value={customer.contactEmail}
            onChange={(e) => onUpdate('contactEmail', e.target.value)}
            placeholder="e.g., jane.doe@customer.com"
            className="input-field"
          />
        </div>
      </div>
    </motion.section>
  );
}
