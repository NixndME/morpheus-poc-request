/**
 * Morpheus POC License Request Tool - State Management Hook
 * Version 3.0 - Multiple K8s clusters, integrations
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  RequestorInfo,
  CustomerInfo,
  POCDetails,
  Datacenter,
  PublicCloudEntry,
  KubernetesCluster,
  IntegrationConfig,
  Calculations,
  POCRequest,
  POCStatus,
  CloudProviderType,
  POCDuration,
  AutomationType,
  LoadBalancerType,
  DNSIPAMType,
} from '../types';
import {
  calculateOnPremSockets,
  calculatePublicCloudSockets,
  calculateKubernetesSockets,
  generateId,
  generateReferenceId,
  generateUUID,
  calculateExpectedEndDate,
} from '../lib/utils';
import { 
  DEFAULT_REQUESTOR, 
  DEFAULT_CUSTOMER, 
  DEFAULT_POC_DETAILS,
  DEFAULT_INTEGRATIONS,
  CLOUD_PROVIDER_OPTIONS 
} from '../data/constants';

// ============================================================================
// INITIAL STATE HELPERS
// ============================================================================

const createInitialDatacenter = (): Datacenter => ({
  id: generateId(),
  name: '',
  hypervisor: '',
  hosts: 0,
  socketsPerHost: 2,
});

const createInitialK8sCluster = (): KubernetesCluster => ({
  id: generateId(),
  name: '',
  distribution: '',
  workers: 0,
  location: 'on-prem',
});

const createInitialPublicCloud = (): PublicCloudEntry[] => 
  CLOUD_PROVIDER_OPTIONS.map(provider => ({
    provider: provider.value,
    vms: 0,
  }));

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function usePOCRequest() {
  // Reference ID - generated once and stays constant
  const [referenceId] = useState<string>(() => generateReferenceId());
  
  // Requestor information
  const [requestor, setRequestor] = useState<RequestorInfo>({ ...DEFAULT_REQUESTOR });
  
  // Customer information
  const [customer, setCustomer] = useState<CustomerInfo>({ ...DEFAULT_CUSTOMER });
  
  // POC details
  const [pocDetails, setPocDetails] = useState<POCDetails>({ ...DEFAULT_POC_DETAILS });
  
  // Infrastructure state
  const [datacenters, setDatacenters] = useState<Datacenter[]>([createInitialDatacenter()]);
  const [publicCloud, setPublicCloud] = useState<PublicCloudEntry[]>(createInitialPublicCloud());
  const [kubernetesClusters, setKubernetesClusters] = useState<KubernetesCluster[]>([]);
  
  // Integrations
  const [integrations, setIntegrations] = useState<IntegrationConfig>({ ...DEFAULT_INTEGRATIONS });
  
  // Status
  const [status, setStatus] = useState<POCStatus>('Draft');
  
  // Notes
  const [internalNotes, setInternalNotes] = useState<string>('');

  // ============================================================================
  // CALCULATED VALUES
  // ============================================================================

  const calculations: Calculations = useMemo(() => {
    const onPremSockets = calculateOnPremSockets(datacenters);
    const publicCloudSockets = calculatePublicCloudSockets(publicCloud);
    const kubernetesSockets = calculateKubernetesSockets(kubernetesClusters);
    
    return {
      onPremSockets,
      publicCloudSockets,
      kubernetesSockets,
      totalSockets: onPremSockets + publicCloudSockets + kubernetesSockets,
    };
  }, [datacenters, publicCloud, kubernetesClusters]);

  const totalPublicCloudVMs = useMemo(() => {
    return publicCloud.reduce((sum, entry) => sum + (entry.vms || 0), 0);
  }, [publicCloud]);

  const totalK8sWorkers = useMemo(() => {
    return kubernetesClusters.reduce((sum, cluster) => sum + (cluster.workers || 0), 0);
  }, [kubernetesClusters]);

  // ============================================================================
  // REQUESTOR HANDLERS
  // ============================================================================

  const updateRequestor = useCallback((field: keyof RequestorInfo, value: string) => {
    setRequestor(prev => ({ ...prev, [field]: value }));
  }, []);

  // ============================================================================
  // CUSTOMER HANDLERS
  // ============================================================================

  const updateCustomer = useCallback((field: keyof CustomerInfo, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  }, []);

  // ============================================================================
  // POC DETAILS HANDLERS
  // ============================================================================

  const updatePOCDetails = useCallback((field: keyof POCDetails, value: string | number | boolean) => {
    setPocDetails(prev => {
      const updated = { ...prev, [field]: value };
      
      if ((field === 'startDate' || field === 'duration') && updated.startDate) {
        updated.expectedEndDate = calculateExpectedEndDate(
          updated.startDate, 
          updated.duration as POCDuration
        );
      }
      
      return updated;
    });
  }, []);

  // ============================================================================
  // DATACENTER HANDLERS
  // ============================================================================

  const addDatacenter = useCallback(() => {
    setDatacenters(prev => [...prev, createInitialDatacenter()]);
  }, []);

  const removeDatacenter = useCallback((id: string) => {
    setDatacenters(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(dc => dc.id !== id);
    });
  }, []);

  const updateDatacenter = useCallback((id: string, field: keyof Datacenter, value: string | number) => {
    setDatacenters(prev => prev.map(dc => {
      if (dc.id !== id) return dc;
      
      if (field === 'name' || field === 'hypervisor') {
        return { ...dc, [field]: value as string };
      } else if (field === 'hosts' || field === 'socketsPerHost') {
        return { ...dc, [field]: Math.max(0, Number(value) || 0) };
      }
      return dc;
    }));
  }, []);

  const duplicateDatacenter = useCallback((id: string) => {
    setDatacenters(prev => {
      const dcToDuplicate = prev.find(dc => dc.id === id);
      if (!dcToDuplicate) return prev;
      
      const newDc: Datacenter = {
        ...dcToDuplicate,
        id: generateId(),
        name: `${dcToDuplicate.name} (Copy)`,
      };
      
      const index = prev.findIndex(dc => dc.id === id);
      const newDatacenters = [...prev];
      newDatacenters.splice(index + 1, 0, newDc);
      return newDatacenters;
    });
  }, []);

  // ============================================================================
  // PUBLIC CLOUD HANDLERS
  // ============================================================================

  const updatePublicCloudVMs = useCallback((provider: CloudProviderType, vms: number) => {
    setPublicCloud(prev => prev.map(entry => {
      if (entry.provider !== provider) return entry;
      return { ...entry, vms: Math.max(0, vms || 0) };
    }));
  }, []);

  const clearPublicCloud = useCallback(() => {
    setPublicCloud(createInitialPublicCloud());
  }, []);

  // ============================================================================
  // KUBERNETES CLUSTER HANDLERS
  // ============================================================================

  const addK8sCluster = useCallback(() => {
    setKubernetesClusters(prev => [...prev, createInitialK8sCluster()]);
  }, []);

  const removeK8sCluster = useCallback((id: string) => {
    setKubernetesClusters(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateK8sCluster = useCallback((id: string, field: keyof KubernetesCluster, value: string | number) => {
    setKubernetesClusters(prev => prev.map(cluster => {
      if (cluster.id !== id) return cluster;
      
      if (field === 'workers') {
        return { ...cluster, workers: Math.max(0, Number(value) || 0) };
      }
      return { ...cluster, [field]: value };
    }));
  }, []);

  const duplicateK8sCluster = useCallback((id: string) => {
    setKubernetesClusters(prev => {
      const clusterToDuplicate = prev.find(c => c.id === id);
      if (!clusterToDuplicate) return prev;
      
      const newCluster: KubernetesCluster = {
        ...clusterToDuplicate,
        id: generateId(),
        name: `${clusterToDuplicate.name} (Copy)`,
      };
      
      const index = prev.findIndex(c => c.id === id);
      const newClusters = [...prev];
      newClusters.splice(index + 1, 0, newCluster);
      return newClusters;
    });
  }, []);

  // ============================================================================
  // INTEGRATIONS HANDLERS
  // ============================================================================

  const updateIntegration = useCallback(<K extends keyof IntegrationConfig>(
    field: K, 
    value: IntegrationConfig[K]
  ) => {
    setIntegrations(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleAutomation = useCallback((tool: AutomationType) => {
    setIntegrations(prev => {
      let newAutomation = [...prev.automation];
      
      if (tool === 'none') {
        newAutomation = ['none'];
      } else {
        newAutomation = newAutomation.filter(t => t !== 'none');
        if (newAutomation.includes(tool)) {
          newAutomation = newAutomation.filter(t => t !== tool);
        } else {
          newAutomation.push(tool);
        }
        if (newAutomation.length === 0) {
          newAutomation = ['none'];
        }
      }
      
      return { ...prev, automation: newAutomation };
    });
  }, []);

  const toggleLoadBalancer = useCallback((lb: LoadBalancerType) => {
    setIntegrations(prev => {
      let newLB = [...prev.loadBalancer];
      
      if (lb === 'none') {
        newLB = ['none'];
      } else {
        newLB = newLB.filter(t => t !== 'none');
        if (newLB.includes(lb)) {
          newLB = newLB.filter(t => t !== lb);
        } else {
          newLB.push(lb);
        }
        if (newLB.length === 0) {
          newLB = ['none'];
        }
      }
      
      return { ...prev, loadBalancer: newLB };
    });
  }, []);

  const toggleDnsIpam = useCallback((dns: DNSIPAMType) => {
    setIntegrations(prev => {
      let newDns = [...prev.dnsIpam];
      
      if (dns === 'none') {
        newDns = ['none'];
      } else {
        newDns = newDns.filter(t => t !== 'none');
        if (newDns.includes(dns)) {
          newDns = newDns.filter(t => t !== dns);
        } else {
          newDns.push(dns);
        }
        if (newDns.length === 0) {
          newDns = ['none'];
        }
      }
      
      return { ...prev, dnsIpam: newDns };
    });
  }, []);

  // ============================================================================
  // FORM ACTIONS
  // ============================================================================

  const resetForm = useCallback(() => {
    setRequestor({ ...DEFAULT_REQUESTOR });
    setCustomer({ ...DEFAULT_CUSTOMER });
    setPocDetails({ ...DEFAULT_POC_DETAILS });
    setDatacenters([createInitialDatacenter()]);
    setPublicCloud(createInitialPublicCloud());
    setKubernetesClusters([]);
    setIntegrations({ ...DEFAULT_INTEGRATIONS });
    setStatus('Draft');
    setInternalNotes('');
  }, []);

  const getPOCRequest = useCallback((): POCRequest => {
    return {
      id: generateUUID(),
      referenceId,
      createdAt: new Date().toISOString(),
      requestor,
      customer,
      pocDetails,
      datacenters: datacenters.filter(dc => dc.hosts > 0 || dc.name),
      publicCloud: publicCloud.filter(entry => entry.vms > 0),
      kubernetesClusters: kubernetesClusters.filter(c => c.workers > 0 || c.name),
      integrations,
      calculations,
      status,
      internalNotes: internalNotes || undefined,
    };
  }, [referenceId, requestor, customer, pocDetails, datacenters, publicCloud, kubernetesClusters, integrations, calculations, status, internalNotes]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const isRequestorValid = useMemo(() => {
    return (
      requestor.name.trim().length > 0 &&
      requestor.email.trim().length > 0 &&
      requestor.type.length > 0
    );
  }, [requestor]);

  const isCustomerValid = useMemo(() => {
    return (
      customer.name.trim().length > 0 &&
      customer.industry.length > 0
    );
  }, [customer]);

  const isPOCDetailsValid = useMemo(() => {
    return (
      pocDetails.useCaseDescription.trim().length > 0 &&
      pocDetails.successCriteria.trim().length > 0 &&
      pocDetails.duration > 0 &&
      pocDetails.dealSize !== 'unknown' &&
      pocDetails.environmentReady !== undefined
    );
  }, [pocDetails]);

  const hasInfrastructure = useMemo(() => {
    const hasDatacenters = datacenters.some(dc => dc.hosts > 0);
    const hasPublicCloud = publicCloud.some(entry => entry.vms > 0);
    const hasKubernetes = kubernetesClusters.some(c => c.workers > 0);
    return hasDatacenters || hasPublicCloud || hasKubernetes;
  }, [datacenters, publicCloud, kubernetesClusters]);

  const canSubmitRequest = useMemo(() => {
    return isRequestorValid && isCustomerValid && isPOCDetailsValid && hasInfrastructure;
  }, [isRequestorValid, isCustomerValid, isPOCDetailsValid, hasInfrastructure]);

  // ============================================================================
  // RETURN VALUE
  // ============================================================================

  return {
    // Reference ID
    referenceId,
    
    // State
    requestor,
    customer,
    pocDetails,
    datacenters,
    publicCloud,
    kubernetesClusters,
    integrations,
    status,
    internalNotes,
    
    // Calculated values
    calculations,
    totalPublicCloudVMs,
    totalK8sWorkers,
    
    // Validation
    isRequestorValid,
    isCustomerValid,
    isPOCDetailsValid,
    hasInfrastructure,
    canSubmitRequest,
    
    // Requestor handlers
    updateRequestor,
    
    // Customer handlers
    updateCustomer,
    
    // POC details handlers
    updatePOCDetails,
    
    // Datacenter handlers
    addDatacenter,
    removeDatacenter,
    updateDatacenter,
    duplicateDatacenter,
    
    // Public cloud handlers
    updatePublicCloudVMs,
    clearPublicCloud,
    
    // Kubernetes handlers
    addK8sCluster,
    removeK8sCluster,
    updateK8sCluster,
    duplicateK8sCluster,
    
    // Integration handlers
    updateIntegration,
    toggleAutomation,
    toggleLoadBalancer,
    toggleDnsIpam,
    
    // Status & notes
    setStatus,
    setInternalNotes,
    
    // Form actions
    resetForm,
    getPOCRequest,
  };
}

export type POCRequestHook = ReturnType<typeof usePOCRequest>;
