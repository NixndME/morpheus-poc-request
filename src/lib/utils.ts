/**
 * Morpheus POC License Request Tool - Utility Functions
 * Version 3.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Datacenter, PublicCloudEntry, KubernetesCluster, POCDuration } from '../types';
import { LICENSING_ASSUMPTIONS } from '../types';

// ============================================================================
// STYLING UTILITIES
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// REFERENCE ID GENERATION
// ============================================================================

/**
 * Generate a unique, human-readable reference ID
 * Format: POC-YYYY-XXXXXX (e.g., POC-2024-A3F8K2)
 */
export function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `POC-${year}-${code}`;
}

/**
 * Generate a UUID for database primary key
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

export function calculateOnPremSockets(datacenters: Datacenter[]): number {
  return datacenters.reduce((total, dc) => {
    const hosts = Math.max(0, dc.hosts || 0);
    const sockets = Math.max(0, dc.socketsPerHost || 0);
    return total + (hosts * sockets);
  }, 0);
}

export function calculatePublicCloudSockets(publicCloud: PublicCloudEntry[]): number {
  const totalVMs = publicCloud.reduce((total, entry) => {
    return total + Math.max(0, entry.vms || 0);
  }, 0);
  
  if (totalVMs === 0) return 0;
  return Math.ceil(totalVMs / LICENSING_ASSUMPTIONS.VMS_PER_SOCKET);
}

export function calculateKubernetesSockets(clusters: KubernetesCluster[]): number {
  const totalWorkers = clusters.reduce((total, cluster) => {
    return total + Math.max(0, cluster.workers || 0);
  }, 0);
  
  if (totalWorkers === 0) return 0;
  return Math.ceil(totalWorkers / LICENSING_ASSUMPTIONS.K8S_WORKERS_PER_SOCKET);
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function calculateExpectedEndDate(startDate: string, duration: POCDuration): string {
  if (!startDate) return '';
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + duration);
  return end.toISOString().split('T')[0];
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysRemaining(endDate: string): number {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// FORMATTING
// ============================================================================

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

// ============================================================================
// ID GENERATION (for datacenter/cluster items)
// ============================================================================

export function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
