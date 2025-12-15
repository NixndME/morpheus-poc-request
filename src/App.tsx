/**
 * Morpheus POC License Request Tool - Main Application
 * Version 4.0 - With Search and Admin Dashboard
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePOCRequest } from './hooks/usePOCRequest';
import { Header } from './components/layout/Header';
import { RequestorSection } from './components/sections/RequestorSection';
import { CustomerSection } from './components/sections/CustomerSection';
import { POCDetailsSection } from './components/sections/POCDetailsSection';
import { DatacenterSection } from './components/sections/DatacenterSection';
import { PublicCloudSection } from './components/sections/PublicCloudSection';
import { KubernetesSection } from './components/sections/KubernetesSection';
import { IntegrationsSection } from './components/sections/IntegrationsSection';
import { SummarySection } from './components/sections/SummarySection';
import { SearchPage } from './pages/SearchPage';
import { AdminPage } from './pages/AdminPage';
import { savePOCRequest, savePOCRequestAsync, isAPIMode } from './lib/dataStore';
import { RotateCcw, Server, Workflow, Search, Shield, FileKey, Plus } from 'lucide-react';

type Page = 'new-request' | 'search' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('new-request');
  
  const {
    referenceId,
    requestor,
    customer,
    pocDetails,
    datacenters,
    publicCloud,
    kubernetesClusters,
    integrations,
    calculations,
    totalPublicCloudVMs,
    totalK8sWorkers,
    isRequestorValid,
    isCustomerValid,
    isPOCDetailsValid,
    canSubmitRequest,
    updateRequestor,
    updateCustomer,
    updatePOCDetails,
    addDatacenter,
    removeDatacenter,
    updateDatacenter,
    duplicateDatacenter,
    updatePublicCloudVMs,
    clearPublicCloud,
    addK8sCluster,
    removeK8sCluster,
    updateK8sCluster,
    duplicateK8sCluster,
    updateIntegration,
    toggleAutomation,
    toggleLoadBalancer,
    toggleDnsIpam,
    resetForm,
    getPOCRequest,
  } = usePOCRequest();

  // Handle form submission with database save
  const handleSubmit = async () => {
    const request = getPOCRequest();
    try {
      let savedRequest;
      if (isAPIMode()) {
        savedRequest = await savePOCRequestAsync(request);
      } else {
        savedRequest = savePOCRequest(request);
      }
      alert(
        `✅ POC License Request Submitted Successfully!\n\n` +
        `📋 Reference ID: ${savedRequest.referenceId}\n\n` +
        `Your request has been saved and is now pending review.\n` +
        `You can track the status using the Search feature.\n\n` +
        `Requestor: ${requestor.name}\n` +
        `Customer: ${customer.name}\n` +
        `Total Sockets: ${calculations.totalSockets}`
      );
      resetForm();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save request'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-dark">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-hpe-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="border-b border-morpheus-800/50 bg-morpheus-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hpe-green-500 to-hpe-green-700 
                             flex items-center justify-center">
                <FileKey className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Morpheus POC</div>
                <div className="text-xs text-gray-500">License Request Tool</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-morpheus-900/50 p-1 rounded-xl">
              <NavButton
                active={currentPage === 'new-request'}
                onClick={() => setCurrentPage('new-request')}
                icon={<Plus className="w-4 h-4" />}
                label="New Request"
              />
              <NavButton
                active={currentPage === 'search'}
                onClick={() => setCurrentPage('search')}
                icon={<Search className="w-4 h-4" />}
                label="Search"
              />
              <NavButton
                active={currentPage === 'admin'}
                onClick={() => setCurrentPage('admin')}
                icon={<Shield className="w-4 h-4" />}
                label="Admin"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        {currentPage === 'new-request' && (
          <motion.div
            key="new-request"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16"
          >
            <Header />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Input Sections */}
              <div className="lg:col-span-2 space-y-6">
                <RequestorSection
                  requestor={requestor}
                  onUpdate={updateRequestor}
                  isValid={isRequestorValid}
                />

                <CustomerSection
                  customer={customer}
                  onUpdate={updateCustomer}
                  isValid={isCustomerValid}
                />

                <POCDetailsSection
                  pocDetails={pocDetails}
                  onUpdate={updatePOCDetails}
                  isValid={isPOCDetailsValid}
                />

                {/* Infrastructure Section Divider */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-morpheus-700/50 to-transparent" />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Server className="w-4 h-4" />
                    <span>Customer Infrastructure</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-morpheus-700/50 to-transparent" />
                </div>

                <DatacenterSection
                  datacenters={datacenters}
                  onAdd={addDatacenter}
                  onRemove={removeDatacenter}
                  onUpdate={updateDatacenter}
                  onDuplicate={duplicateDatacenter}
                  totalSockets={calculations.onPremSockets}
                />

                <PublicCloudSection
                  publicCloud={publicCloud}
                  onUpdateVMs={updatePublicCloudVMs}
                  onClear={clearPublicCloud}
                  totalVMs={totalPublicCloudVMs}
                  totalSockets={calculations.publicCloudSockets}
                />

                <KubernetesSection
                  clusters={kubernetesClusters}
                  onAdd={addK8sCluster}
                  onRemove={removeK8sCluster}
                  onUpdate={updateK8sCluster}
                  onDuplicate={duplicateK8sCluster}
                  totalWorkers={totalK8sWorkers}
                  totalSockets={calculations.kubernetesSockets}
                />

                {/* Integrations Section Divider */}
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-morpheus-700/50 to-transparent" />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Workflow className="w-4 h-4" />
                    <span>Tool Integrations</span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-morpheus-700/50 to-transparent" />
                </div>

                <IntegrationsSection
                  integrations={integrations}
                  onUpdateIntegration={updateIntegration}
                  onToggleAutomation={toggleAutomation}
                  onToggleLoadBalancer={toggleLoadBalancer}
                  onToggleDnsIpam={toggleDnsIpam}
                />
              </div>

              {/* Right Column - Summary (Sticky) */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-4">
                  <SummarySection
                    referenceId={referenceId}
                    requestor={requestor}
                    customer={customer}
                    pocDetails={pocDetails}
                    calculations={calculations}
                    totalPublicCloudVMs={totalPublicCloudVMs}
                    totalK8sWorkers={totalK8sWorkers}
                    canSubmitRequest={canSubmitRequest}
                    onGetPOCRequest={getPOCRequest}
                    onSubmit={handleSubmit}
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm('Reset all fields? This cannot be undone.')) {
                        resetForm();
                      }
                    }}
                    className="w-full btn-ghost flex items-center justify-center gap-2 text-gray-500"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Form
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16"
          >
            <SearchPage onBack={() => setCurrentPage('new-request')} />
          </motion.div>
        )}

        {currentPage === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16"
          >
            <AdminPage onBack={() => setCurrentPage('new-request')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-morpheus-800/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div>© {new Date().getFullYear()} HPE Morpheus Enterprise</div>
            <div>POC Duration: 45-90 days • Internal Use Only</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Navigation Button Component
function NavButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                 ${active 
                   ? 'bg-hpe-green-500/20 text-hpe-green-400' 
                   : 'text-gray-400 hover:text-gray-200 hover:bg-morpheus-800/50'}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
