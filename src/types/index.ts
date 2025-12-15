/**
 * Morpheus POC License Request Tool - Type Definitions
 * Version 3.0 - Enhanced with integrations tracking
 */

// ============================================================================
// REQUESTOR INFORMATION
// ============================================================================

export type RequestorType = 
  | 'hpe-sales-engineer'
  | 'partner-engineer'
  | 'gsi-partner'
  | 'distributor'
  | 'internal-team';

export interface RequestorInfo {
  name: string;
  email: string;
  type: RequestorType;
  company: string;
  region: string;
  opportunityId: string; // Optional - Sales opportunity ID
}

// ============================================================================
// CUSTOMER INFORMATION
// ============================================================================

export interface CustomerInfo {
  name: string;
  industry: string;
  country: string;
  contactName: string;
  contactEmail: string;
}

// ============================================================================
// POC DETAILS
// ============================================================================

export type POCDuration = 45 | 60 | 90;

export type DealSize = 
  | 'less-than-50k'
  | '50k-100k'
  | '100k-250k'
  | '250k-500k'
  | '500k-plus'
  | 'unknown';

export interface POCDetails {
  useCaseDescription: string;
  businessJustification: string;
  duration: POCDuration;
  startDate: string;
  expectedEndDate: string;
  successCriteria: string;
  dealSize: DealSize;
  environmentReady: boolean;
}

// ============================================================================
// ON-PREM / PRIVATE CLOUD DATACENTER
// ============================================================================

export type HypervisorType =
  | 'vmware-vsphere'
  | 'nutanix-ahv'
  | 'microsoft-hyperv'
  | 'microsoft-scvmm'
  | 'openstack'
  | 'kvm'
  | 'oracle-vm'
  | 'vcloud-director'
  | 'ucs-manager'
  | 'hpe-hvm'
  | 'xen-server'
  | 'macstadium';

export interface HypervisorOption {
  value: HypervisorType;
  label: string;
  category: 'enterprise' | 'cloud' | 'specialized';
}

// A workload is a hypervisor environment within a datacenter
export interface DatacenterWorkload {
  id: string;
  hypervisor: HypervisorType | '';
  hosts: number;
  socketsPerHost: number;
}

// A datacenter/location can have multiple workloads
export interface Datacenter {
  id: string;
  name: string;
  workloads: DatacenterWorkload[];
  // Legacy fields for backward compatibility (single workload)
  hypervisor?: HypervisorType | '';
  hosts?: number;
  socketsPerHost?: number;
}

// ============================================================================
// PUBLIC CLOUD PROVIDERS
// ============================================================================

export type CloudProviderType =
  | 'aws'
  | 'azure'
  | 'azure-stack'
  | 'google-cloud'
  | 'alibaba-cloud'
  | 'ibm-cloud'
  | 'oracle-cloud'
  | 'digitalocean'
  | 'huawei-cloud'
  | 'upcloud'
  | 'open-telekom';

export interface CloudProviderOption {
  value: CloudProviderType;
  label: string;
  shortLabel: string;
  color: string;
}

export interface PublicCloudEntry {
  provider: CloudProviderType;
  vms: number;
}

// ============================================================================
// KUBERNETES - Multiple Clusters Support
// ============================================================================

export type K8sDistribution =
  | 'eks'
  | 'aks'
  | 'gke'
  | 'openshift'
  | 'rancher'
  | 'tanzu'
  | 'mks'
  | 'vanilla'
  | 'k3s'
  | 'rke'
  | 'dke'
  | 'other';

export interface KubernetesCluster {
  id: string;
  name: string;
  distribution: K8sDistribution | '';
  workers: number;
  location: string; // on-prem, aws, azure, etc.
}

// ============================================================================
// INTEGRATIONS - Automation, ITSM, Load Balancers
// ============================================================================

export type AutomationType =
  | 'ansible-tower'
  | 'ansible-awx'
  | 'puppet'
  | 'chef'
  | 'saltstack'
  | 'terraform'
  | 'vra'
  | 'vro'
  | 'bash'
  | 'powershell'
  | 'python'
  | 'none'
  | 'other';

export type ITSMType =
  | 'servicenow'
  | 'bmc-remedy'
  | 'cherwell'
  | 'jira-service'
  | 'zendesk'
  | 'freshservice'
  | 'none'
  | 'other';

export type LoadBalancerType =
  | 'f5-bigip'
  | 'citrix-netscaler'
  | 'haproxy'
  | 'nginx'
  | 'aws-alb'
  | 'aws-elb'
  | 'azure-lb'
  | 'gcp-lb'
  | 'nsx-alb'
  | 'avi'
  | 'none'
  | 'other';

export type DNSIPAMType =
  | 'infoblox'
  | 'bluecat'
  | 'microsoft-dns'
  | 'aws-route53'
  | 'phpipam'
  | 'solarwinds'
  | 'none'
  | 'other';

export interface IntegrationConfig {
  automation: AutomationType[];
  itsm: ITSMType;
  itsmDetails: string;
  loadBalancer: LoadBalancerType[];
  dnsIpam: DNSIPAMType[];
  otherIntegrations: string;
}

// ============================================================================
// CALCULATIONS
// ============================================================================

export interface Calculations {
  onPremSockets: number;
  publicCloudSockets: number;
  kubernetesSockets: number;
  totalSockets: number;
}

// ============================================================================
// POC STATUS & OUTCOME
// ============================================================================

export type POCStatus = 
  | 'Draft'
  | 'Pending Review'
  | 'Approved'
  | 'Active'
  | 'Extended'
  | 'Completed'
  | 'Expired'
  | 'Cancelled';

export type POCOutcome =
  | 'Success - PO Expected'
  | 'Success - PO Received'
  | 'Partial Success'
  | 'Failed - Technical'
  | 'Failed - Business'
  | 'Failed - No Budget'
  | 'Failed - Competition'
  | 'Pending'
  | 'N/A';

export interface POCOutcomeDetails {
  outcome: POCOutcome;
  actualEndDate?: string;
  feedbackNotes?: string;
  featureGaps?: string[];
  competitorMentioned?: string;
  lessonsLearned?: string;
}

// ============================================================================
// LICENSING ASSUMPTIONS
// ============================================================================

export const LICENSING_ASSUMPTIONS = {
  VMS_PER_SOCKET: 15,
  K8S_WORKERS_PER_SOCKET: 10,
} as const;

// ============================================================================
// COMPLETE POC REQUEST DATA MODEL
// ============================================================================

export interface POCRequest {
  // Unique Reference ID - This is the key identifier
  id: string;
  referenceId: string; // Human-readable: POC-2024-XXXX
  createdAt: string;
  updatedAt?: string;
  
  // Requestor & Customer
  requestor: RequestorInfo;
  customer: CustomerInfo;
  pocDetails: POCDetails;
  
  // Infrastructure
  datacenters: Datacenter[];
  publicCloud: PublicCloudEntry[];
  kubernetesClusters: KubernetesCluster[];
  
  // Integrations
  integrations: IntegrationConfig;
  
  // Calculations
  calculations: Calculations;
  
  // Status & Tracking
  status: POCStatus;
  outcomeDetails?: POCOutcomeDetails;
  
  // License info (filled after approval)
  licenseKey?: string;
  approvedBy?: string;
  approvedAt?: string;
  
  // Notes
  internalNotes?: string;
}

// ============================================================================
// FILTER & SEARCH
// ============================================================================

export interface POCFilters {
  status?: POCStatus[];
  outcome?: POCOutcome[];
  requestorType?: RequestorType[];
  region?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
