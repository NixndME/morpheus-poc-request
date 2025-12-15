/**
 * Header Component - POC License Request Tool
 */

import { motion } from 'framer-motion';
import { FileKey, Shield } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-8"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-hpe-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hpe-green-500 to-hpe-green-700 flex items-center justify-center shadow-lg shadow-hpe-green-500/30">
              <FileKey className="w-7 h-7 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 rounded-2xl border border-hpe-green-500/20"
            />
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs font-semibold text-hpe-green-400 tracking-wider uppercase">
                HPE Morpheus
              </span>
              <span className="badge-green text-[10px]">
                <Shield className="w-2.5 h-2.5 mr-1" />
                Internal Tool
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl sm:text-3xl font-display font-bold text-white mt-0.5"
            >
              POC License Request
            </motion.h1>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden sm:flex items-center gap-4 text-sm"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-2 h-2 rounded-full bg-hpe-green-500 animate-pulse" />
            POC Duration: 45-90 Days
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-4 text-gray-400 max-w-3xl"
      >
        Submit POC license requests with complete infrastructure details. Track active POCs, 
        monitor outcomes, and capture feedback for product engineering.
      </motion.p>
    </motion.header>
  );
}
