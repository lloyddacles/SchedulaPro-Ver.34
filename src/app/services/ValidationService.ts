/**
 * PRODUCTION VALIDATION ENGINE
 * Enterprise-grade validation service for academic scheduling
 * 
 * Compliance: Fire Safety, HR/Labor Law, Academic Policy, Data Integrity
 * Enforcement Level: BLOCKING (no manual overrides without audit)
 */

import type { 
  ScheduleItem, Schedule, Room, Faculty, Section, Course, 
  Conflict, UserRole 
} from '../types';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationCategory = 
  | 'capacity' 
  | 'faculty_load' 
  | 'room_type' 
  | 'conflict' 
  | 'lock' 
  | 'policy';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  blockers: string[]; // Human-readable blocking issues
}

export interface ValidationError {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;
  affectedItems: string[];
  suggestion?: string;
  canOverride: boolean;
  overrideRequiresRole?: UserRole;
  complianceRisk: 'fire_safety' | 'labor_law' | 'academic_policy' | 'data_integrity';
}

export interface ValidationWarning {
  id: string;
  message: string;
  recommendation: string;
}

export interface OverrideRequest {
  validationErrorId: string;
  justification: string;
  requestedBy: string;
  requestedByRole: UserRole;
  timestamp: Date;
}

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

export const VALIDATION_RULES = {
  // Room capacity safety margin (for fire code compliance)
  CAPACITY_SAFETY_MARGIN: 0, // 0 = strict, no overcapacity allowed
  
  // Faculty load limits (contact hours per week)
  FACULTY_MAX_LOAD_FULL_TIME: 24,
  FACULTY_MAX_LOAD_PART_TIME: 18,
  FACULTY_MAX_DAILY_HOURS: 8,
  FACULTY_MIN_BREAK_HOURS: 1, // Minimum break between classes
  
  // Building travel time (minutes)
  MIN_TRAVEL_TIME_SAME_BUILDING: 0,
  MIN_TRAVEL_TIME_DIFFERENT_BUILDING: 10,
  
  // Schedule locking rules
  LOCK_AFTER_APPROVAL: true,
  ALLOW_EMERGENCY_UNLOCK: true, // Admin only, with audit
  
  // Audit retention (days)
  AUDIT_RETENTION_DAYS: 2555, // 7 years for compliance
} as const;

// ============================================================================
// VALIDATION SERVICE CLASS
// ============================================================================

export class ValidationService {
  
  // ==========================================================================
  // 1️⃣ ROOM CAPACITY VALIDATION (Fire & Safety Compliance)
  // ==========================================================================
  
  /**
   * P0 CRITICAL: Validates room capacity against section enrollment
   * Compliance: Fire safety codes, building occupancy limits
   * Enforcement: BLOCKING - Cannot save, approve, or publish if violated
   */
  validateRoomCapacity(
    scheduleItem: ScheduleItem,
    room: Room,
    section: Section,
    existingOverrides: OverrideRequest[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check if section size exceeds room capacity
    const capacityExcess = section.studentCount - room.capacity;
    
    if (capacityExcess > VALIDATION_RULES.CAPACITY_SAFETY_MARGIN) {
      const errorId = `capacity_violation_${scheduleItem.id}`;
      
      // Check if there's a valid override for this specific error
      const hasValidOverride = existingOverrides.some(
        override => override.validationErrorId === errorId
      );
      
      if (!hasValidOverride) {
        errors.push({
          id: errorId,
          severity: 'error',
          category: 'capacity',
          message: `FIRE SAFETY VIOLATION: Section ${section.code} has ${section.studentCount} students but room ${room.code} capacity is ${room.capacity}`,
          affectedItems: [scheduleItem.id, room.id, section.id],
          suggestion: `Assign to a larger room (min capacity: ${section.studentCount}) or split section into smaller groups`,
          canOverride: true,
          overrideRequiresRole: 'admin',
          complianceRisk: 'fire_safety',
        });
      }
    }
    
    // Warning if capacity is tight (>90% utilization)
    const utilizationPercent = (section.studentCount / room.capacity) * 100;
    if (utilizationPercent > 90 && utilizationPercent <= 100) {
      warnings.push({
        id: `capacity_warning_${scheduleItem.id}`,
        message: `Room ${room.code} is at ${utilizationPercent.toFixed(0)}% capacity (${section.studentCount}/${room.capacity} students)`,
        recommendation: 'Consider using a larger room to allow for late enrollments or special accommodations',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      blockers: errors.map(e => e.message),
    };
  }
  
  // ==========================================================================
  // 2️⃣ FACULTY LOAD ENFORCEMENT (Legal & HR Compliance)
  // ==========================================================================
  
  /**
   * P0 CRITICAL: Validates faculty teaching load limits
   * Compliance: Labor law, union contracts, HR policies
   * Enforcement: BLOCKING - Prevents faculty overload
   */
  validateFacultyLoad(
    scheduleItem: ScheduleItem,
    faculty: Faculty,
    allSchedules: Schedule[],
    existingOverrides: OverrideRequest[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Calculate total weekly hours for this faculty across all approved/pending schedules
    const totalWeeklyHours = this.calculateFacultyWeeklyLoad(faculty.id, allSchedules, scheduleItem);
    
    // Calculate daily hours for the new item's day
    const dailyHours = this.calculateFacultyDailyLoad(
      faculty.id, 
      scheduleItem.day, 
      allSchedules, 
      scheduleItem
    );
    
    // Check weekly load limit
    if (totalWeeklyHours > faculty.maxLoad) {
      const errorId = `faculty_overload_${faculty.id}_${scheduleItem.id}`;
      const hasValidOverride = existingOverrides.some(o => o.validationErrorId === errorId);
      
      if (!hasValidOverride) {
        errors.push({
          id: errorId,
          severity: 'error',
          category: 'faculty_load',
          message: `LABOR LAW VIOLATION: ${faculty.name} would exceed maximum teaching load (${totalWeeklyHours}/${faculty.maxLoad} hours/week)`,
          affectedItems: [scheduleItem.id, faculty.id],
          suggestion: `Assign this class to a different faculty member or increase ${faculty.name}'s approved load limit`,
          canOverride: true,
          overrideRequiresRole: 'admin',
          complianceRisk: 'labor_law',
        });
      }
    }
    
    // Check daily load limit
    if (dailyHours > VALIDATION_RULES.FACULTY_MAX_DAILY_HOURS) {
      errors.push({
        id: `faculty_daily_overload_${faculty.id}_${scheduleItem.day}`,
        severity: 'error',
        category: 'faculty_load',
        message: `DAILY OVERLOAD: ${faculty.name} would teach ${dailyHours} hours on ${scheduleItem.day} (max: ${VALIDATION_RULES.FACULTY_MAX_DAILY_HOURS})`,
        affectedItems: [scheduleItem.id, faculty.id],
        suggestion: `Distribute classes across different days`,
        canOverride: true,
        overrideRequiresRole: 'admin',
        complianceRisk: 'labor_law',
      });
    }
    
    // Warning if approaching load limit (>90%)
    const loadPercent = (totalWeeklyHours / faculty.maxLoad) * 100;
    if (loadPercent > 90 && loadPercent <= 100) {
      warnings.push({
        id: `faculty_load_warning_${faculty.id}`,
        message: `${faculty.name} will be at ${loadPercent.toFixed(0)}% of maximum teaching load (${totalWeeklyHours}/${faculty.maxLoad} hours)`,
        recommendation: 'Faculty is near maximum capacity - avoid additional assignments',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      blockers: errors.map(e => e.message),
    };
  }
  
  /**
   * Calculate total weekly contact hours for a faculty member
   */
  private calculateFacultyWeeklyLoad(
    facultyId: string,
    allSchedules: Schedule[],
    newItem?: ScheduleItem
  ): number {
    let totalHours = 0;
    
    // Get all non-rejected schedules
    const activeSchedules = allSchedules.filter(
      s => s.status !== 'rejected'
    );
    
    // Collect all schedule items for this faculty
    const facultyItems: ScheduleItem[] = [];
    activeSchedules.forEach(schedule => {
      schedule.items
        .filter(item => item.facultyId === facultyId)
        .forEach(item => facultyItems.push(item));
    });
    
    // Add the new item if provided
    if (newItem && newItem.facultyId === facultyId) {
      facultyItems.push(newItem);
    }
    
    // Calculate unique class hours (avoid double-counting same class on different days)
    const uniqueClasses = new Map<string, number>();
    
    facultyItems.forEach(item => {
      const classKey = `${item.courseId}_${item.sectionId}_${item.startTime}_${item.endTime}`;
      
      if (!uniqueClasses.has(classKey)) {
        const startHour = parseInt(item.startTime.split(':')[0]);
        const endHour = parseInt(item.endTime.split(':')[0]);
        const hours = endHour - startHour;
        uniqueClasses.set(classKey, hours);
      }
    });
    
    // Sum up unique class hours
    uniqueClasses.forEach(hours => {
      totalHours += hours;
    });
    
    return totalHours;
  }
  
  /**
   * Calculate daily contact hours for a faculty member on a specific day
   */
  private calculateFacultyDailyLoad(
    facultyId: string,
    day: string,
    allSchedules: Schedule[],
    newItem?: ScheduleItem
  ): number {
    let totalHours = 0;
    
    const activeSchedules = allSchedules.filter(s => s.status !== 'rejected');
    const dayItems: ScheduleItem[] = [];
    
    activeSchedules.forEach(schedule => {
      schedule.items
        .filter(item => item.facultyId === facultyId && item.day === day)
        .forEach(item => dayItems.push(item));
    });
    
    if (newItem && newItem.facultyId === facultyId && newItem.day === day) {
      dayItems.push(newItem);
    }
    
    dayItems.forEach(item => {
      const startHour = parseInt(item.startTime.split(':')[0]);
      const endHour = parseInt(item.endTime.split(':')[0]);
      totalHours += (endHour - startHour);
    });
    
    return totalHours;
  }
  
  // ==========================================================================
  // 3️⃣ LAB VS LECTURE ROOM MATCHING (Academic Policy Compliance)
  // ==========================================================================
  
  /**
   * P0 CRITICAL: Validates room type matches course requirements
   * Compliance: Academic policy, curriculum standards
   * Enforcement: BLOCKING - Prevents mismatched assignments
   */
  validateRoomTypeMatch(
    scheduleItem: ScheduleItem,
    course: Course,
    room: Room,
    existingOverrides: OverrideRequest[] = []
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check if lab course is assigned to non-lab room
    if (course.requiresLab && room.type === 'lecture') {
      const errorId = `room_type_mismatch_${scheduleItem.id}`;
      const hasValidOverride = existingOverrides.some(o => o.validationErrorId === errorId);
      
      if (!hasValidOverride) {
        errors.push({
          id: errorId,
          severity: 'error',
          category: 'room_type',
          message: `ACADEMIC POLICY VIOLATION: Course ${course.code} requires laboratory facilities but room ${room.code} is a lecture hall`,
          affectedItems: [scheduleItem.id, course.id, room.id],
          suggestion: `Assign to a laboratory room with required equipment and workstations`,
          canOverride: true,
          overrideRequiresRole: 'admin',
          complianceRisk: 'academic_policy',
        });
      }
    }
    
    // Check if lecture course is in expensive lab (inefficient resource use)
    if (!course.requiresLab && room.type === 'laboratory') {
      warnings.push({
        id: `inefficient_room_use_${scheduleItem.id}`,
        message: `Lecture course ${course.code} assigned to laboratory ${room.code}`,
        recommendation: 'Consider using a standard lecture room to free up lab space for courses that require it',
      });
    }
    
    // Hybrid rooms can accommodate both
    if (room.type === 'hybrid') {
      warnings.push({
        id: `hybrid_room_${scheduleItem.id}`,
        message: `Using hybrid room ${room.code} for ${course.type} course`,
        recommendation: 'Hybrid room provides flexibility - ensure equipment availability matches course needs',
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      blockers: errors.map(e => e.message),
    };
  }
  
  // ==========================================================================
  // 4️⃣ COMPREHENSIVE CONFLICT DETECTION
  // ==========================================================================
  
  /**
   * Enhanced conflict detection with performance optimization
   * Detects: Room conflicts, Faculty conflicts, Section conflicts, Building travel time
   */
  validateConflicts(
    newItem: ScheduleItem,
    existingItems: ScheduleItem[],
    rooms: Room[],
    faculty: Faculty[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Filter items for the same day (optimization)
    const sameDayItems = existingItems.filter(item => item.day === newItem.day);
    
    for (const existingItem of sameDayItems) {
      // Check time overlap
      if (this.hasTimeOverlap(newItem, existingItem)) {
        
        // Room conflict
        if (newItem.roomId === existingItem.roomId) {
          errors.push({
            id: `room_conflict_${newItem.roomId}_${newItem.day}_${newItem.startTime}`,
            severity: 'error',
            category: 'conflict',
            message: `ROOM CONFLICT: Room ${newItem.roomCode} is already booked on ${newItem.day} at ${newItem.startTime}-${newItem.endTime}`,
            affectedItems: [newItem.id, existingItem.id],
            suggestion: `Choose a different room or time slot`,
            canOverride: false,
            complianceRisk: 'data_integrity',
          });
        }
        
        // Faculty conflict
        if (newItem.facultyId === existingItem.facultyId) {
          errors.push({
            id: `faculty_conflict_${newItem.facultyId}_${newItem.day}_${newItem.startTime}`,
            severity: 'error',
            category: 'conflict',
            message: `FACULTY CONFLICT: ${newItem.facultyName} is already scheduled on ${newItem.day} at ${newItem.startTime}-${newItem.endTime}`,
            affectedItems: [newItem.id, existingItem.id],
            suggestion: `Choose a different faculty member or time slot`,
            canOverride: false,
            complianceRisk: 'data_integrity',
          });
        }
        
        // Section conflict
        if (newItem.sectionId === existingItem.sectionId) {
          errors.push({
            id: `section_conflict_${newItem.sectionId}_${newItem.day}_${newItem.startTime}`,
            severity: 'error',
            category: 'conflict',
            message: `SECTION CONFLICT: Section ${newItem.sectionName} already has a class on ${newItem.day} at ${newItem.startTime}-${newItem.endTime}`,
            affectedItems: [newItem.id, existingItem.id],
            suggestion: `Choose a different time slot`,
            canOverride: false,
            complianceRisk: 'data_integrity',
          });
        }
      }
      
      // Check back-to-back building travel time
      if (newItem.facultyId === existingItem.facultyId) {
        const travelWarning = this.validateTravelTime(newItem, existingItem, rooms);
        if (travelWarning) {
          warnings.push(travelWarning);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      blockers: errors.map(e => e.message),
    };
  }
  
  /**
   * Check if two schedule items have overlapping times
   */
  private hasTimeOverlap(item1: ScheduleItem, item2: ScheduleItem): boolean {
    if (item1.day !== item2.day) return false;
    
    const start1 = this.timeToMinutes(item1.startTime);
    const end1 = this.timeToMinutes(item1.endTime);
    const start2 = this.timeToMinutes(item2.startTime);
    const end2 = this.timeToMinutes(item2.endTime);
    
    return start1 < end2 && end1 > start2;
  }
  
  /**
   * Convert time string (HH:mm) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  /**
   * Validate travel time between buildings
   */
  private validateTravelTime(
    item1: ScheduleItem,
    item2: ScheduleItem,
    rooms: Room[]
  ): ValidationWarning | null {
    const room1 = rooms.find(r => r.id === item1.roomId);
    const room2 = rooms.find(r => r.id === item2.roomId);
    
    if (!room1 || !room2) return null;
    
    // Check if classes are back-to-back
    const end1 = this.timeToMinutes(item1.endTime);
    const start2 = this.timeToMinutes(item2.startTime);
    const end2 = this.timeToMinutes(item2.endTime);
    const start1 = this.timeToMinutes(item1.startTime);
    
    const gap1to2 = start2 - end1;
    const gap2to1 = start1 - end2;
    
    const isBackToBack = gap1to2 === 0 || gap2to1 === 0;
    
    if (isBackToBack && room1.building !== room2.building) {
      return {
        id: `travel_time_${item1.id}_${item2.id}`,
        message: `NO TRAVEL TIME: ${item1.facultyName} has back-to-back classes in different buildings (${room1.building} → ${room2.building})`,
        recommendation: `Add at least ${VALIDATION_RULES.MIN_TRAVEL_TIME_DIFFERENT_BUILDING} minutes between classes in different buildings`,
      };
    }
    
    return null;
  }
  
  // ==========================================================================
  // 5️⃣ SCHEDULE LOCK ENFORCEMENT (Data Integrity)
  // ==========================================================================
  
  /**
   * P0 CRITICAL: Validates that locked schedules cannot be modified
   * Compliance: Data integrity, audit trail, governance
   * Enforcement: BLOCKING - Immutable after approval
   */
  validateScheduleLock(
    schedule: Schedule,
    requestedBy: UserRole,
    isEmergencyUnlock: boolean = false
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (schedule.isLocked) {
      // Only admin can unlock in emergencies
      if (!isEmergencyUnlock || requestedBy !== 'admin') {
        errors.push({
          id: `schedule_locked_${schedule.id}`,
          severity: 'error',
          category: 'lock',
          message: `DATA INTEGRITY VIOLATION: Schedule "${schedule.name}" is locked and cannot be modified`,
          affectedItems: [schedule.id],
          suggestion: `This schedule has been approved and locked. To make changes, request emergency unlock from administration.`,
          canOverride: true,
          overrideRequiresRole: 'admin',
          complianceRisk: 'data_integrity',
        });
      }
      
      if (isEmergencyUnlock && requestedBy === 'admin') {
        warnings.push({
          id: `emergency_unlock_${schedule.id}`,
          message: `EMERGENCY UNLOCK: Admin is modifying locked schedule "${schedule.name}"`,
          recommendation: 'This action will create a new version and require re-approval. All changes will be audited.',
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      blockers: errors.map(e => e.message),
    };
  }
  
  // ==========================================================================
  // COMPREHENSIVE VALIDATION ORCHESTRATOR
  // ==========================================================================
  
  /**
   * Master validation function - runs all validations
   * Used before: Save, Approval, Publishing
   */
  validateScheduleItem(
    item: ScheduleItem,
    context: {
      schedule: Schedule;
      room: Room;
      faculty: Faculty;
      section: Section;
      course: Course;
      allSchedules: Schedule[];
      allRooms: Room[];
      allFaculty: Faculty[];
      existingOverrides?: OverrideRequest[];
      requestedBy: UserRole;
    }
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    
    // 1. Check schedule lock
    const lockResult = this.validateScheduleLock(context.schedule, context.requestedBy);
    allErrors.push(...lockResult.errors);
    allWarnings.push(...lockResult.warnings);
    
    // If locked and no override, stop here
    if (!lockResult.isValid) {
      return {
        isValid: false,
        errors: allErrors,
        warnings: allWarnings,
        blockers: allErrors.map(e => e.message),
      };
    }
    
    // 2. Room capacity validation
    const capacityResult = this.validateRoomCapacity(
      item,
      context.room,
      context.section,
      context.existingOverrides
    );
    allErrors.push(...capacityResult.errors);
    allWarnings.push(...capacityResult.warnings);
    
    // 3. Faculty load validation
    const loadResult = this.validateFacultyLoad(
      item,
      context.faculty,
      context.allSchedules,
      context.existingOverrides
    );
    allErrors.push(...loadResult.errors);
    allWarnings.push(...loadResult.warnings);
    
    // 4. Room type matching
    const roomTypeResult = this.validateRoomTypeMatch(
      item,
      context.course,
      context.room,
      context.existingOverrides
    );
    allErrors.push(...roomTypeResult.errors);
    allWarnings.push(...roomTypeResult.warnings);
    
    // 5. Conflict detection
    const conflictResult = this.validateConflicts(
      item,
      context.schedule.items.filter(i => i.id !== item.id), // Exclude self if editing
      context.allRooms,
      context.allFaculty
    );
    allErrors.push(...conflictResult.errors);
    allWarnings.push(...conflictResult.warnings);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      blockers: allErrors.map(e => e.message),
    };
  }
  
  /**
   * Batch validation for entire schedule
   * Used before approval/publishing
   */
  validateEntireSchedule(
    schedule: Schedule,
    context: {
      allRooms: Room[];
      allFaculty: Faculty[];
      allSections: Section[];
      allCourses: Course[];
      allSchedules: Schedule[];
      requestedBy: UserRole;
    }
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    
    // Validate each item
    schedule.items.forEach(item => {
      const room = context.allRooms.find(r => r.id === item.roomId);
      const faculty = context.allFaculty.find(f => f.id === item.facultyId);
      const section = context.allSections.find(s => s.id === item.sectionId);
      const course = context.allCourses.find(c => c.id === item.courseId);
      
      if (!room || !faculty || !section || !course) {
        allErrors.push({
          id: `missing_reference_${item.id}`,
          severity: 'error',
          category: 'policy',
          message: `Data integrity error: Schedule item ${item.id} has invalid references`,
          affectedItems: [item.id],
          canOverride: false,
          complianceRisk: 'data_integrity',
        });
        return;
      }
      
      const result = this.validateScheduleItem(item, {
        schedule,
        room,
        faculty,
        section,
        course,
        allSchedules: context.allSchedules,
        allRooms: context.allRooms,
        allFaculty: context.allFaculty,
        requestedBy: context.requestedBy,
      });
      
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      blockers: [...new Set(allErrors.map(e => e.message))], // Deduplicate
    };
  }
}

// Singleton instance
export const validationService = new ValidationService();
