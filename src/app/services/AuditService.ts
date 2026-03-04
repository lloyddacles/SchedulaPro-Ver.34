/**
 * AUDIT TRAIL & VERSION CONTROL SERVICE
 * Enterprise-grade governance and compliance tracking
 * 
 * Compliance: SOX, FERPA, Internal Audit Requirements
 * Retention: 7 years (configurable)
 */

import type { Schedule, ScheduleItem, UserRole, ScheduleStatus } from '../types';
import { VALIDATION_RULES } from './ValidationService';

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'lock'
  | 'unlock'
  | 'send_to_faculty'
  | 'add_item'
  | 'remove_item'
  | 'update_item'
  | 'override_validation';

export type AuditEntityType = 'schedule' | 'schedule_item' | 'approval' | 'override';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  beforeState?: any;
  afterState?: any;
  changes?: FieldChange[];
  ipAddress?: string;
  userAgent?: string;
  justification?: string;
  metadata?: Record<string, any>;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

// ============================================================================
// VERSION CONTROL TYPES
// ============================================================================

export interface ScheduleVersion {
  id: string;
  scheduleId: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  createdByRole: UserRole;
  snapshot: Schedule;
  changesSummary: string;
  previousVersionId?: string;
  reasonForChange?: string;
  isCurrentVersion: boolean;
}

export interface VersionComparison {
  scheduleName: string;
  version1: ScheduleVersion;
  version2: ScheduleVersion;
  itemsAdded: ScheduleItem[];
  itemsRemoved: ScheduleItem[];
  itemsModified: Array<{
    before: ScheduleItem;
    after: ScheduleItem;
    changes: FieldChange[];
  }>;
  statusChanged: boolean;
  oldStatus?: ScheduleStatus;
  newStatus?: ScheduleStatus;
}

// ============================================================================
// AUDIT SERVICE CLASS
// ============================================================================

export class AuditService {
  private auditLog: AuditEntry[] = [];
  private versionHistory: Map<string, ScheduleVersion[]> = new Map();
  
  // ==========================================================================
  // AUDIT LOGGING
  // ==========================================================================
  
  /**
   * Log any action for governance compliance
   */
  logAction(params: {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    userId: string;
    userName: string;
    userRole: UserRole;
    beforeState?: any;
    afterState?: any;
    justification?: string;
    metadata?: Record<string, any>;
  }): AuditEntry {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      beforeState: params.beforeState,
      afterState: params.afterState,
      justification: params.justification,
      metadata: params.metadata,
      ipAddress: this.getCurrentIPAddress(),
      userAgent: this.getCurrentUserAgent(),
    };
    
    // Calculate field-level changes if before/after states provided
    if (params.beforeState && params.afterState) {
      entry.changes = this.calculateChanges(params.beforeState, params.afterState);
    }
    
    this.auditLog.push(entry);
    
    // In production: Send to backend for permanent storage
    // await this.persistAuditEntry(entry);
    
    console.log(`[AUDIT] ${entry.action} by ${entry.userName} (${entry.userRole}) on ${entry.entityType} ${entry.entityId}`);
    
    return entry;
  }
  
  /**
   * Calculate field-level changes between two states
   */
  private calculateChanges(before: any, after: any): FieldChange[] {
    const changes: FieldChange[] = [];
    
    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(before || {}),
      ...Object.keys(after || {}),
    ]);
    
    allKeys.forEach(key => {
      const oldValue = before?.[key];
      const newValue = after?.[key];
      
      // Skip internal fields
      if (key === 'updatedAt' || key === 'createdAt') return;
      
      // Detect change type
      if (oldValue === undefined && newValue !== undefined) {
        changes.push({
          field: key,
          oldValue: null,
          newValue,
          changeType: 'added',
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({
          field: key,
          oldValue,
          newValue: null,
          changeType: 'removed',
        });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          changeType: 'modified',
        });
      }
    });
    
    return changes;
  }
  
  /**
   * Get audit trail for a specific entity
   */
  getAuditTrail(entityId: string, entityType?: AuditEntityType): AuditEntry[] {
    let filtered = this.auditLog.filter(entry => entry.entityId === entityId);
    
    if (entityType) {
      filtered = filtered.filter(entry => entry.entityType === entityType);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Get all actions by a specific user
   */
  getUserActions(userId: string, startDate?: Date, endDate?: Date): AuditEntry[] {
    let filtered = this.auditLog.filter(entry => entry.userId === userId);
    
    if (startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= startDate);
    }
    
    if (endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= endDate);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Search audit log by action type
   */
  getActionsByType(action: AuditAction, limit?: number): AuditEntry[] {
    const filtered = this.auditLog.filter(entry => entry.action === action);
    const sorted = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  /**
   * Generate compliance report
   */
  generateComplianceReport(startDate: Date, endDate: Date): {
    totalActions: number;
    actionsByType: Record<AuditAction, number>;
    actionsByUser: Record<string, number>;
    criticalActions: AuditEntry[];
    overrideActions: AuditEntry[];
  } {
    const filtered = this.auditLog.filter(
      entry => entry.timestamp >= startDate && entry.timestamp <= endDate
    );
    
    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};
    
    filtered.forEach(entry => {
      actionsByType[entry.action] = (actionsByType[entry.action] || 0) + 1;
      actionsByUser[entry.userName] = (actionsByUser[entry.userName] || 0) + 1;
    });
    
    const criticalActions = filtered.filter(entry =>
      ['unlock', 'delete', 'override_validation'].includes(entry.action)
    );
    
    const overrideActions = filtered.filter(entry =>
      entry.action === 'override_validation'
    );
    
    return {
      totalActions: filtered.length,
      actionsByType: actionsByType as Record<AuditAction, number>,
      actionsByUser,
      criticalActions,
      overrideActions,
    };
  }
  
  // ==========================================================================
  // VERSION CONTROL
  // ==========================================================================
  
  /**
   * Create a new version snapshot
   */
  createVersion(params: {
    schedule: Schedule;
    userId: string;
    userRole: UserRole;
    reasonForChange?: string;
  }): ScheduleVersion {
    const scheduleId = params.schedule.id;
    const existingVersions = this.versionHistory.get(scheduleId) || [];
    
    // Mark all previous versions as not current
    existingVersions.forEach(v => v.isCurrentVersion = false);
    
    const newVersion: ScheduleVersion = {
      id: `version_${scheduleId}_${Date.now()}`,
      scheduleId,
      versionNumber: existingVersions.length + 1,
      createdAt: new Date(),
      createdBy: params.userId,
      createdByRole: params.userRole,
      snapshot: JSON.parse(JSON.stringify(params.schedule)), // Deep copy
      changesSummary: this.generateChangesSummary(existingVersions[existingVersions.length - 1], params.schedule),
      previousVersionId: existingVersions[existingVersions.length - 1]?.id,
      reasonForChange: params.reasonForChange,
      isCurrentVersion: true,
    };
    
    existingVersions.push(newVersion);
    this.versionHistory.set(scheduleId, existingVersions);
    
    // Log the versioning action
    this.logAction({
      action: 'update',
      entityType: 'schedule',
      entityId: scheduleId,
      userId: params.userId,
      userName: params.schedule.createdByName, // In real app, get from user context
      userRole: params.userRole,
      beforeState: existingVersions[existingVersions.length - 2]?.snapshot,
      afterState: params.schedule,
      justification: params.reasonForChange,
      metadata: {
        versionNumber: newVersion.versionNumber,
      },
    });
    
    console.log(`[VERSION] Created version ${newVersion.versionNumber} for schedule ${scheduleId}`);
    
    return newVersion;
  }
  
  /**
   * Generate human-readable changes summary
   */
  private generateChangesSummary(previousVersion: ScheduleVersion | undefined, currentSchedule: Schedule): string {
    if (!previousVersion) {
      return 'Initial version created';
    }
    
    const changes: string[] = [];
    const prev = previousVersion.snapshot;
    
    // Check status change
    if (prev.status !== currentSchedule.status) {
      changes.push(`Status changed from ${prev.status} to ${currentSchedule.status}`);
    }
    
    // Check items changes
    const itemsAdded = currentSchedule.items.length - prev.items.length;
    if (itemsAdded > 0) {
      changes.push(`Added ${itemsAdded} class(es)`);
    } else if (itemsAdded < 0) {
      changes.push(`Removed ${Math.abs(itemsAdded)} class(es)`);
    }
    
    // Check lock change
    if (prev.isLocked !== currentSchedule.isLocked) {
      changes.push(currentSchedule.isLocked ? 'Schedule locked' : 'Schedule unlocked');
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Minor updates';
  }
  
  /**
   * Get version history for a schedule
   */
  getVersionHistory(scheduleId: string): ScheduleVersion[] {
    return this.versionHistory.get(scheduleId) || [];
  }
  
  /**
   * Get a specific version
   */
  getVersion(scheduleId: string, versionNumber: number): ScheduleVersion | undefined {
    const versions = this.versionHistory.get(scheduleId) || [];
    return versions.find(v => v.versionNumber === versionNumber);
  }
  
  /**
   * Get current version
   */
  getCurrentVersion(scheduleId: string): ScheduleVersion | undefined {
    const versions = this.versionHistory.get(scheduleId) || [];
    return versions.find(v => v.isCurrentVersion);
  }
  
  /**
   * Rollback to a previous version (admin only)
   */
  rollbackToVersion(params: {
    scheduleId: string;
    targetVersionNumber: number;
    userId: string;
    userRole: UserRole;
    justification: string;
  }): ScheduleVersion | null {
    if (params.userRole !== 'admin') {
      throw new Error('UNAUTHORIZED: Only administrators can rollback versions');
    }
    
    const targetVersion = this.getVersion(params.scheduleId, params.targetVersionNumber);
    if (!targetVersion) {
      throw new Error(`Version ${params.targetVersionNumber} not found`);
    }
    
    // Create new version from the rollback target
    const rolledBackVersion = this.createVersion({
      schedule: targetVersion.snapshot,
      userId: params.userId,
      userRole: params.userRole,
      reasonForChange: `ROLLBACK to version ${params.targetVersionNumber}: ${params.justification}`,
    });
    
    this.logAction({
      action: 'update',
      entityType: 'schedule',
      entityId: params.scheduleId,
      userId: params.userId,
      userName: 'Admin', // In real app, get from user context
      userRole: params.userRole,
      justification: `Rollback to version ${params.targetVersionNumber}: ${params.justification}`,
      metadata: {
        rollbackFrom: this.getCurrentVersion(params.scheduleId)?.versionNumber,
        rollbackTo: params.targetVersionNumber,
      },
    });
    
    return rolledBackVersion;
  }
  
  /**
   * Compare two versions
   */
  compareVersions(
    scheduleId: string,
    version1Number: number,
    version2Number: number
  ): VersionComparison | null {
    const v1 = this.getVersion(scheduleId, version1Number);
    const v2 = this.getVersion(scheduleId, version2Number);
    
    if (!v1 || !v2) return null;
    
    const itemsAdded: ScheduleItem[] = [];
    const itemsRemoved: ScheduleItem[] = [];
    const itemsModified: Array<{ before: ScheduleItem; after: ScheduleItem; changes: FieldChange[] }> = [];
    
    // Find added items (in v2 but not in v1)
    v2.snapshot.items.forEach(item2 => {
      const existsInV1 = v1.snapshot.items.some(item1 => item1.id === item2.id);
      if (!existsInV1) {
        itemsAdded.push(item2);
      }
    });
    
    // Find removed items (in v1 but not in v2)
    v1.snapshot.items.forEach(item1 => {
      const existsInV2 = v2.snapshot.items.some(item2 => item2.id === item1.id);
      if (!existsInV2) {
        itemsRemoved.push(item1);
      }
    });
    
    // Find modified items
    v1.snapshot.items.forEach(item1 => {
      const item2 = v2.snapshot.items.find(i => i.id === item1.id);
      if (item2 && JSON.stringify(item1) !== JSON.stringify(item2)) {
        itemsModified.push({
          before: item1,
          after: item2,
          changes: this.calculateChanges(item1, item2),
        });
      }
    });
    
    return {
      scheduleName: v1.snapshot.name,
      version1: v1,
      version2: v2,
      itemsAdded,
      itemsRemoved,
      itemsModified,
      statusChanged: v1.snapshot.status !== v2.snapshot.status,
      oldStatus: v1.snapshot.status,
      newStatus: v2.snapshot.status,
    };
  }
  
  // ==========================================================================
  // RETENTION & CLEANUP
  // ==========================================================================
  
  /**
   * Clean up old audit entries based on retention policy
   */
  cleanupOldAuditEntries(): number {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - VALIDATION_RULES.AUDIT_RETENTION_DAYS);
    
    const beforeCount = this.auditLog.length;
    this.auditLog = this.auditLog.filter(entry => entry.timestamp >= retentionDate);
    const removed = beforeCount - this.auditLog.length;
    
    console.log(`[AUDIT CLEANUP] Removed ${removed} audit entries older than ${VALIDATION_RULES.AUDIT_RETENTION_DAYS} days`);
    
    return removed;
  }
  
  /**
   * Archive old versions (keep last 10 versions per schedule)
   */
  archiveOldVersions(scheduleId: string, keepCount: number = 10): number {
    const versions = this.versionHistory.get(scheduleId) || [];
    
    if (versions.length <= keepCount) {
      return 0;
    }
    
    // Sort by version number descending
    const sorted = versions.sort((a, b) => b.versionNumber - a.versionNumber);
    
    // Keep only the latest versions
    const toKeep = sorted.slice(0, keepCount);
    const archived = sorted.slice(keepCount);
    
    this.versionHistory.set(scheduleId, toKeep);
    
    // In production: Move archived versions to cold storage
    // await this.moveToArchiveStorage(archived);
    
    console.log(`[VERSION CLEANUP] Archived ${archived.length} old versions for schedule ${scheduleId}`);
    
    return archived.length;
  }
  
  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  private getCurrentIPAddress(): string {
    // In browser, this would come from backend
    // In production, backend captures real IP
    return '127.0.0.1';
  }
  
  private getCurrentUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }
  
  /**
   * Get all audit entries (for admin/compliance officer)
   */
  getAllAuditEntries(limit?: number): AuditEntry[] {
    const sorted = this.auditLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  /**
   * Export audit log for external compliance systems
   */
  exportAuditLog(startDate: Date, endDate: Date): string {
    const filtered = this.auditLog.filter(
      entry => entry.timestamp >= startDate && entry.timestamp <= endDate
    );
    
    // In production: Format as CSV or send to compliance system
    return JSON.stringify(filtered, null, 2);
  }
}

// Singleton instance
export const auditService = new AuditService();
