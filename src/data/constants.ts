/**
 * Morpheus POC License Request Tool - Static Data
 * Version 3.0 - Enhanced with integrations
 */

import type { 
  HypervisorOption, 
  CloudProviderOption, 
  RequestorType, 
  POCStatus, 
  POCOutcome,
  AutomationType,
  ITSMType,
  LoadBalancerType,
  DNSIPAMType,
  K8sDistribution,
  DealSize,
} from '../types';

// ============================================================================
// REQUESTOR TYPE OPTIONS
// ============================================================================

export const REQUESTOR_TYPE_OPTIONS: { value: RequestorType; label: string }[] = [
  { value: 'hpe-sales-engineer', label: 'HPE Sales Engineer' },
  { value: 'partner-engineer', label: 'Partner Engineer' },
  { value: 'gsi-partner', label: 'GSI Partner' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'internal-team', label: 'Internal Team' },
];

// ============================================================================
// REGION OPTIONS
// ============================================================================

export const REGION_OPTIONS = [
  { value: 'apac', label: 'APAC (Asia Pacific)' },
  { value: 'anz', label: 'ANZ (Australia & New Zealand)' },
  { value: 'asean', label: 'ASEAN' },
  { value: 'india', label: 'India' },
  { value: 'japan', label: 'Japan' },
  { value: 'korea', label: 'Korea' },
  { value: 'greater-china', label: 'Greater China' },
  { value: 'emea', label: 'EMEA (Europe, Middle East, Africa)' },
  { value: 'americas', label: 'Americas' },
];

// ============================================================================
// INDUSTRY OPTIONS
// ============================================================================

export const INDUSTRY_OPTIONS = [
  { value: 'financial-services', label: 'Financial Services / Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'government', label: 'Government / Public Sector' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail / E-commerce' },
  { value: 'energy-utilities', label: 'Energy & Utilities' },
  { value: 'education', label: 'Education' },
  { value: 'media-entertainment', label: 'Media & Entertainment' },
  { value: 'technology', label: 'Technology / Software' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// POC DURATION OPTIONS
// ============================================================================

export const POC_DURATION_OPTIONS = [
  { value: 45, label: '45 Days (Standard)' },
  { value: 60, label: '60 Days (Extended)' },
  { value: 90, label: '90 Days (Maximum)' },
];

// ============================================================================
// DEAL SIZE OPTIONS
// ============================================================================

export const DEAL_SIZE_OPTIONS = [
  { value: 'less-than-50k', label: 'Less than $50K' },
  { value: '50k-100k', label: '$50K - $100K' },
  { value: '100k-250k', label: '$100K - $250K' },
  { value: '250k-500k', label: '$250K - $500K' },
  { value: '500k-plus', label: '$500K+' },
  { value: 'unknown', label: 'Unknown / TBD' },
];

// ============================================================================
// POC STATUS OPTIONS
// ============================================================================

export const POC_STATUS_OPTIONS: { value: POCStatus; label: string; color: string }[] = [
  { value: 'Draft', label: 'Draft', color: 'gray' },
  { value: 'Pending Review', label: 'Pending Review', color: 'yellow' },
  { value: 'Approved', label: 'Approved', color: 'blue' },
  { value: 'Active', label: 'Active', color: 'green' },
  { value: 'Extended', label: 'Extended', color: 'orange' },
  { value: 'Completed', label: 'Completed', color: 'purple' },
  { value: 'Expired', label: 'Expired', color: 'red' },
  { value: 'Cancelled', label: 'Cancelled', color: 'gray' },
];

// ============================================================================
// POC OUTCOME OPTIONS
// ============================================================================

export const POC_OUTCOME_OPTIONS: { value: POCOutcome; label: string; color: string }[] = [
  { value: 'Success - PO Expected', label: 'Success - PO Expected', color: 'green' },
  { value: 'Success - PO Received', label: 'Success - PO Received', color: 'green' },
  { value: 'Partial Success', label: 'Partial Success', color: 'yellow' },
  { value: 'Failed - Technical', label: 'Failed - Technical Issue', color: 'red' },
  { value: 'Failed - Business', label: 'Failed - Business Reason', color: 'red' },
  { value: 'Failed - No Budget', label: 'Failed - No Budget', color: 'red' },
  { value: 'Failed - Competition', label: 'Failed - Lost to Competition', color: 'red' },
  { value: 'Pending', label: 'Pending', color: 'blue' },
  { value: 'N/A', label: 'N/A', color: 'gray' },
];

// ============================================================================
// KUBERNETES DISTRIBUTION OPTIONS
// ============================================================================

export const K8S_DISTRIBUTION_OPTIONS: { value: K8sDistribution | ''; label: string }[] = [
  { value: '', label: 'Select distribution...' },
  { value: 'eks', label: 'Amazon EKS' },
  { value: 'aks', label: 'Azure AKS' },
  { value: 'gke', label: 'Google GKE' },
  { value: 'openshift', label: 'Red Hat OpenShift' },
  { value: 'rancher', label: 'Rancher / RKE2' },
  { value: 'tanzu', label: 'VMware Tanzu' },
  { value: 'mks', label: 'Morpheus Kubernetes Service' },
  { value: 'vanilla', label: 'Vanilla Kubernetes' },
  { value: 'k3s', label: 'K3s / Lightweight' },
  { value: 'rke', label: 'Rancher RKE' },
  { value: 'dke', label: 'Docker Kubernetes' },
  { value: 'other', label: 'Other' },
];

export const K8S_LOCATION_OPTIONS = [
  { value: 'on-prem', label: 'On-Premises' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'Google Cloud' },
  { value: 'hybrid', label: 'Hybrid / Multi-Cloud' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// AUTOMATION / IAM TOOL OPTIONS
// ============================================================================

export const AUTOMATION_OPTIONS: { value: AutomationType; label: string }[] = [
  { value: 'none', label: 'None / Not Required' },
  { value: 'ansible-tower', label: 'Ansible Automation Platform / Tower' },
  { value: 'ansible-awx', label: 'Ansible AWX' },
  { value: 'puppet', label: 'Puppet Enterprise' },
  { value: 'chef', label: 'Chef Infra' },
  { value: 'saltstack', label: 'SaltStack' },
  { value: 'terraform', label: 'Terraform / OpenTofu' },
  { value: 'vra', label: 'VMware vRealize Automation (vRA)' },
  { value: 'vro', label: 'VMware vRealize Orchestrator (vRO)' },
  { value: 'bash', label: 'Bash Scripts' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'python', label: 'Python Scripts' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// ITSM OPTIONS
// ============================================================================

export const ITSM_OPTIONS: { value: ITSMType; label: string }[] = [
  { value: 'none', label: 'None / Not Required' },
  { value: 'servicenow', label: 'ServiceNow' },
  { value: 'bmc-remedy', label: 'BMC Remedy' },
  { value: 'cherwell', label: 'Cherwell' },
  { value: 'jira-service', label: 'Jira Service Management' },
  { value: 'zendesk', label: 'Zendesk' },
  { value: 'freshservice', label: 'Freshservice' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// LOAD BALANCER OPTIONS
// ============================================================================

export const LOAD_BALANCER_OPTIONS: { value: LoadBalancerType; label: string }[] = [
  { value: 'none', label: 'None / Not Required' },
  { value: 'f5-bigip', label: 'F5 BIG-IP' },
  { value: 'citrix-netscaler', label: 'Citrix NetScaler / ADC' },
  { value: 'haproxy', label: 'HAProxy' },
  { value: 'nginx', label: 'NGINX / NGINX Plus' },
  { value: 'nsx-alb', label: 'VMware NSX Advanced Load Balancer' },
  { value: 'avi', label: 'Avi Networks (VMware)' },
  { value: 'aws-alb', label: 'AWS ALB / ELB' },
  { value: 'azure-lb', label: 'Azure Load Balancer' },
  { value: 'gcp-lb', label: 'GCP Load Balancer' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// DNS / IPAM OPTIONS
// ============================================================================

export const DNS_IPAM_OPTIONS: { value: DNSIPAMType; label: string }[] = [
  { value: 'none', label: 'None / Not Required' },
  { value: 'infoblox', label: 'Infoblox' },
  { value: 'bluecat', label: 'BlueCat' },
  { value: 'microsoft-dns', label: 'Microsoft DNS' },
  { value: 'aws-route53', label: 'AWS Route 53' },
  { value: 'phpipam', label: 'phpIPAM' },
  { value: 'solarwinds', label: 'SolarWinds IPAM' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// HYPERVISOR OPTIONS
// ============================================================================

export const HYPERVISOR_OPTIONS: HypervisorOption[] = [
  { value: 'vmware-vsphere', label: 'VMware vSphere', category: 'enterprise' },
  { value: 'nutanix-ahv', label: 'Nutanix AHV', category: 'enterprise' },
  { value: 'microsoft-hyperv', label: 'Microsoft Hyper-V', category: 'enterprise' },
  { value: 'microsoft-scvmm', label: 'Microsoft SCVMM', category: 'enterprise' },
  { value: 'hpe-hvm', label: 'HPE HVM (KVM)', category: 'enterprise' },
  { value: 'openstack', label: 'OpenStack', category: 'cloud' },
  { value: 'vcloud-director', label: 'VMware vCloud Director', category: 'cloud' },
  { value: 'kvm', label: 'KVM (Standalone)', category: 'cloud' },
  { value: 'oracle-vm', label: 'Oracle VM', category: 'specialized' },
  { value: 'xen-server', label: 'Citrix XenServer', category: 'specialized' },
  { value: 'ucs-manager', label: 'Cisco UCS Manager', category: 'specialized' },
  { value: 'macstadium', label: 'MacStadium', category: 'specialized' },
];

export const HYPERVISOR_GROUPS = {
  enterprise: HYPERVISOR_OPTIONS.filter(h => h.category === 'enterprise'),
  cloud: HYPERVISOR_OPTIONS.filter(h => h.category === 'cloud'),
  specialized: HYPERVISOR_OPTIONS.filter(h => h.category === 'specialized'),
};

// ============================================================================
// PUBLIC CLOUD PROVIDER OPTIONS
// ============================================================================

export const CLOUD_PROVIDER_OPTIONS: CloudProviderOption[] = [
  { value: 'aws', label: 'Amazon Web Services', shortLabel: 'AWS', color: '#FF9900' },
  { value: 'azure', label: 'Microsoft Azure', shortLabel: 'Azure', color: '#0078D4' },
  { value: 'azure-stack', label: 'Microsoft Azure Stack', shortLabel: 'Azure Stack', color: '#5EA0EF' },
  { value: 'google-cloud', label: 'Google Cloud Platform', shortLabel: 'GCP', color: '#4285F4' },
  { value: 'alibaba-cloud', label: 'Alibaba Cloud', shortLabel: 'Alibaba', color: '#FF6A00' },
  { value: 'ibm-cloud', label: 'IBM Cloud', shortLabel: 'IBM', color: '#1F70C1' },
  { value: 'oracle-cloud', label: 'Oracle Cloud Infrastructure', shortLabel: 'OCI', color: '#F80000' },
  { value: 'digitalocean', label: 'DigitalOcean', shortLabel: 'DO', color: '#0080FF' },
  { value: 'huawei-cloud', label: 'Huawei Cloud', shortLabel: 'Huawei', color: '#FF0000' },
  { value: 'upcloud', label: 'UpCloud', shortLabel: 'UpCloud', color: '#7B42BC' },
  { value: 'open-telekom', label: 'Open Telekom Cloud', shortLabel: 'OTC', color: '#E20074' },
];

// ============================================================================
// SOCKET PRESETS
// ============================================================================

export const SOCKET_PRESETS = [
  { label: 'Single Socket', value: 1 },
  { label: 'Dual Socket', value: 2 },
  { label: 'Quad Socket', value: 4 },
  { label: 'Octa Socket', value: 8 },
];

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_REQUESTOR = {
  name: '',
  email: '',
  type: 'partner-engineer' as RequestorType,
  company: '',
  region: 'apac',
  opportunityId: '',
};

export const DEFAULT_CUSTOMER = {
  name: '',
  industry: '',
  country: '',
  contactName: '',
  contactEmail: '',
};

export const DEFAULT_POC_DETAILS: {
  useCaseDescription: string;
  businessJustification: string;
  duration: 45;
  startDate: string;
  expectedEndDate: string;
  successCriteria: string;
  dealSize: DealSize;
  environmentReady: boolean;
} = {
  useCaseDescription: '',
  businessJustification: '',
  duration: 45,
  startDate: '',
  expectedEndDate: '',
  successCriteria: '',
  dealSize: 'unknown',
  environmentReady: false,
};

export const DEFAULT_INTEGRATIONS = {
  automation: ['none'] as AutomationType[],
  itsm: 'none' as ITSMType,
  itsmDetails: '',
  loadBalancer: ['none'] as LoadBalancerType[],
  dnsIpam: ['none'] as DNSIPAMType[],
  otherIntegrations: '',
};
