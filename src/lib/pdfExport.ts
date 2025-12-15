/**
 * PDF Export Utility for POC Requests
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { POCRequest } from '../types';
import { formatDate } from './utils';
import { 
  AUTOMATION_OPTIONS, 
  ITSM_OPTIONS, 
  LOAD_BALANCER_OPTIONS, 
  DNS_IPAM_OPTIONS,
  K8S_DISTRIBUTION_OPTIONS,
  HYPERVISOR_OPTIONS,
  INDUSTRY_OPTIONS,
  REGION_OPTIONS,
  REQUESTOR_TYPE_OPTIONS,
  DEAL_SIZE_OPTIONS,
} from '../data/constants';

// Helper to get label from value
const getLabel = (options: { value: string; label: string }[], value: string): string => {
  return options.find(o => o.value === value)?.label || value;
};

export function exportPOCToPDF(request: POCRequest): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Colors
  const hpeGreen = [1, 169, 130] as [number, number, number];
  const darkGray = [50, 50, 50] as [number, number, number];
  const lightGray = [120, 120, 120] as [number, number, number];

  // Header
  doc.setFillColor(...hpeGreen);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HPE Morpheus POC License Request', 14, 18);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reference ID: ${request.referenceId}`, 14, 30);
  
  // Status badge
  doc.setFontSize(10);
  doc.text(`Status: ${request.status}`, pageWidth - 50, 30);

  yPos = 50;

  // Helper function to add a section
  const addSection = (title: string, content: [string, string][]) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(...hpeGreen);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, yPos);
    yPos += 2;
    
    doc.setDrawColor(...hpeGreen);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 6;

    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    
    content.forEach(([label, value]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...lightGray);
      doc.text(`${label}:`, 14, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkGray);
      
      // Handle long text wrapping
      const maxWidth = pageWidth - 70;
      const lines = doc.splitTextToSize(value || 'N/A', maxWidth);
      doc.text(lines, 60, yPos);
      yPos += Math.max(lines.length * 5, 6);
    });
    
    yPos += 6;
  };

  // Request Info
  addSection('Request Information', [
    ['Reference ID', request.referenceId],
    ['Created', formatDate(request.createdAt)],
    ['Status', request.status],
    ['Approved By', request.approvedBy || 'Pending'],
    ['Approved Date', request.approvedAt ? formatDate(request.approvedAt) : 'Pending'],
  ]);

  // Requestor Information
  addSection('Requestor Information', [
    ['Name', request.requestor.name],
    ['Email', request.requestor.email],
    ['Type', getLabel(REQUESTOR_TYPE_OPTIONS, request.requestor.type)],
    ['Company', request.requestor.company || 'N/A'],
    ['Region', getLabel(REGION_OPTIONS, request.requestor.region)],
    ['Opportunity ID', request.requestor.opportunityId || 'N/A'],
  ]);

  // Customer Information
  addSection('Customer Information', [
    ['Customer Name', request.customer.name],
    ['Industry', getLabel(INDUSTRY_OPTIONS, request.customer.industry)],
    ['Country', request.customer.country || 'N/A'],
    ['Contact Name', request.customer.contactName || 'N/A'],
    ['Contact Email', request.customer.contactEmail || 'N/A'],
  ]);

  // POC Details
  addSection('POC Details', [
    ['Duration', `${request.pocDetails.duration} Days`],
    ['Start Date', request.pocDetails.startDate ? formatDate(request.pocDetails.startDate) : 'TBD'],
    ['End Date', request.pocDetails.expectedEndDate ? formatDate(request.pocDetails.expectedEndDate) : 'TBD'],
    ['Deal Size / Budget', getLabel(DEAL_SIZE_OPTIONS, request.pocDetails.dealSize || 'unknown')],
    ['Environment Ready', request.pocDetails.environmentReady ? 'Yes' : 'No'],
    ['Use Case', request.pocDetails.useCaseDescription],
    ['Business Justification', request.pocDetails.businessJustification || 'N/A'],
    ['Success Criteria', request.pocDetails.successCriteria],
  ]);

  // Infrastructure Summary
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setTextColor(...hpeGreen);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Infrastructure Summary', 14, yPos);
  yPos += 8;

  // Socket summary table
  autoTable(doc, {
    startY: yPos,
    head: [['Category', 'Details', 'Sockets']],
    body: [
      ['On-Premises', `${request.datacenters.length} datacenter(s)`, String(request.calculations.onPremSockets)],
      ['Public Cloud', `${request.publicCloud.filter(p => p.vms > 0).length} provider(s)`, String(request.calculations.publicCloudSockets)],
      ['Kubernetes', `${request.kubernetesClusters.length} cluster(s)`, String(request.calculations.kubernetesSockets)],
      ['TOTAL', '', String(request.calculations.totalSockets)],
    ],
    theme: 'striped',
    headStyles: { fillColor: hpeGreen },
    footStyles: { fillColor: [240, 240, 240], textColor: darkGray, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Datacenter Details
  if (request.datacenters.length > 0 && request.datacenters.some(dc => dc.hosts > 0)) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(...hpeGreen);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Datacenter Details', 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Hypervisor', 'Hosts', 'Sockets/Host', 'Total Sockets']],
      body: request.datacenters
        .filter(dc => dc.hosts > 0)
        .map(dc => [
          dc.name || 'Unnamed',
          getLabel(HYPERVISOR_OPTIONS, dc.hypervisor),
          String(dc.hosts),
          String(dc.socketsPerHost),
          String(dc.hosts * dc.socketsPerHost),
        ]),
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 180] },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Kubernetes Clusters
  if (request.kubernetesClusters.length > 0) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(...hpeGreen);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Kubernetes Clusters', 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Distribution', 'Location', 'Workers']],
      body: request.kubernetesClusters.map(c => [
        c.name || 'Unnamed',
        getLabel(K8S_DISTRIBUTION_OPTIONS, c.distribution),
        c.location,
        String(c.workers),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [200, 100, 50] },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Integrations
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  const automationLabels = request.integrations.automation
    .filter(a => a !== 'none')
    .map(a => getLabel(AUTOMATION_OPTIONS, a))
    .join(', ') || 'None';

  const lbLabels = request.integrations.loadBalancer
    .filter(l => l !== 'none')
    .map(l => getLabel(LOAD_BALANCER_OPTIONS, l))
    .join(', ') || 'None';

  const dnsLabels = request.integrations.dnsIpam
    .filter(d => d !== 'none')
    .map(d => getLabel(DNS_IPAM_OPTIONS, d))
    .join(', ') || 'None';

  addSection('Tool Integrations', [
    ['Automation/IAM', automationLabels],
    ['ITSM Platform', getLabel(ITSM_OPTIONS, request.integrations.itsm)],
    ['ITSM Details', request.integrations.itsmDetails || 'N/A'],
    ['Load Balancers', lbLabels],
    ['DNS/IPAM', dnsLabels],
    ['Other Integrations', request.integrations.otherIntegrations || 'N/A'],
  ]);

  // Internal Notes
  if (request.internalNotes) {
    addSection('Internal Notes', [
      ['Notes', request.internalNotes],
    ]);
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text(
      `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'HPE Morpheus POC License Request Tool - Internal Use Only',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `${request.referenceId}-${request.customer.name.replace(/\s+/g, '-')}.pdf`;
  doc.save(fileName);
}
