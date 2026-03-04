/**
 * Schedule Optimization Utilities
 * 
 * Helper functions for genetic algorithm-based schedule optimization
 */

import type { 
  ScheduleItem, 
  Course, 
  Faculty, 
  Room, 
  Section, 
  DayOfWeek,
  Conflict
} from '../types';

// ============================================================================
// SCHEDULE ANALYSIS
// ============================================================================

export interface ScheduleAnalysis {
  totalClasses: number;
  totalHours: number;
  roomUtilization: RoomUtilizationStats;
  facultyWorkload: FacultyWorkloadStats;
  sectionDistribution: SectionDistributionStats;
  timeDistribution: TimeDistributionStats;
  conflicts: ConflictStats;
  quality: ScheduleQualityMetrics;
}

export interface RoomUtilizationStats {
  totalRooms: number;
  roomsUsed: number;
  utilizationRate: number;
  averageOccupancy: number;
  mostUsedRooms: Array<{ roomCode: string; count: number }>;
  leastUsedRooms: Array<{ roomCode: string; count: number }>;
}

export interface FacultyWorkloadStats {
  totalFaculty: number;
  averageHours: number;
  minHours: number;
  maxHours: number;
  overloadedFaculty: Array<{ name: string; hours: number; maxLoad: number }>;
  underutilizedFaculty: Array<{ name: string; hours: number; maxLoad: number }>;
  workloadBalance: number; // 0-100, higher is better
}

export interface SectionDistributionStats {
  totalSections: number;
  averageClassesPerSection: number;
  sectionsWithGaps: number;
  averageGapDuration: number;
}

export interface TimeDistributionStats {
  classesByDay: Map<DayOfWeek, number>;
  classesByHour: Map<number, number>;
  peakHours: Array<{ hour: number; count: number }>;
  underutilizedSlots: Array<{ day: DayOfWeek; hour: number }>;
}

export interface ConflictStats {
  roomConflicts: number;
  facultyConflicts: number;
  sectionConflicts: number;
  capacityViolations: number;
  totalConflicts: number;
}

export interface ScheduleQualityMetrics {
  overallScore: number; // 0-100
  conflictScore: number; // 0-100, higher is better (fewer conflicts)
  distributionScore: number; // 0-100, higher is better (more balanced)
  efficiencyScore: number; // 0-100, higher is better (less waste)
  satisfactionScore: number; // 0-100, higher is better (meets preferences)
}

/**
 * Analyze a schedule and return comprehensive statistics
 */
export function analyzeSchedule(
  schedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[]
): ScheduleAnalysis {
  const roomUtil = analyzeRoomUtilization(schedule, rooms);
  const facultyWork = analyzeFacultyWorkload(schedule, faculty);
  const sectionDist = analyzeSectionDistribution(schedule, sections);
  const timeDist = analyzeTimeDistribution(schedule);
  const conflicts = analyzeConflicts(schedule, rooms, sections);
  const quality = calculateQualityMetrics(
    roomUtil,
    facultyWork,
    sectionDist,
    timeDist,
    conflicts
  );

  const totalHours = schedule.reduce((sum, item) => {
    const duration = (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
    return sum + duration;
  }, 0);

  return {
    totalClasses: schedule.length,
    totalHours,
    roomUtilization: roomUtil,
    facultyWorkload: facultyWork,
    sectionDistribution: sectionDist,
    timeDistribution: timeDist,
    conflicts,
    quality,
  };
}

/**
 * Analyze room utilization
 */
function analyzeRoomUtilization(
  schedule: ScheduleItem[],
  rooms: Room[]
): RoomUtilizationStats {
  const roomUsage = new Map<string, number>();
  
  schedule.forEach(item => {
    roomUsage.set(item.roomId, (roomUsage.get(item.roomId) || 0) + 1);
  });

  const roomsUsed = roomUsage.size;
  const totalRooms = rooms.length;
  const utilizationRate = (roomsUsed / totalRooms) * 100;
  
  const totalUsage = Array.from(roomUsage.values()).reduce((sum, count) => sum + count, 0);
  const averageOccupancy = totalUsage / roomsUsed;

  const sortedRooms = Array.from(roomUsage.entries())
    .map(([roomId, count]) => {
      const room = rooms.find(r => r.id === roomId);
      return { roomCode: room?.code || roomId, count };
    })
    .sort((a, b) => b.count - a.count);

  const mostUsedRooms = sortedRooms.slice(0, 5);
  const leastUsedRooms = sortedRooms.slice(-5).reverse();

  return {
    totalRooms,
    roomsUsed,
    utilizationRate,
    averageOccupancy,
    mostUsedRooms,
    leastUsedRooms,
  };
}

/**
 * Analyze faculty workload
 */
function analyzeFacultyWorkload(
  schedule: ScheduleItem[],
  faculty: Faculty[]
): FacultyWorkloadStats {
  const facultyHours = new Map<string, number>();
  
  schedule.forEach(item => {
    const hours = (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
    facultyHours.set(item.facultyId, (facultyHours.get(item.facultyId) || 0) + hours);
  });

  const hours = Array.from(facultyHours.values());
  const averageHours = hours.length > 0 ? hours.reduce((sum, h) => sum + h, 0) / hours.length : 0;
  const minHours = hours.length > 0 ? Math.min(...hours) : 0;
  const maxHours = hours.length > 0 ? Math.max(...hours) : 0;

  const overloadedFaculty: Array<{ name: string; hours: number; maxLoad: number }> = [];
  const underutilizedFaculty: Array<{ name: string; hours: number; maxLoad: number }> = [];

  faculty.forEach(f => {
    const hours = facultyHours.get(f.id) || 0;
    if (hours > f.maxLoad) {
      overloadedFaculty.push({ name: f.name, hours, maxLoad: f.maxLoad });
    } else if (hours < f.maxLoad * 0.5) {
      underutilizedFaculty.push({ name: f.name, hours, maxLoad: f.maxLoad });
    }
  });

  // Calculate workload balance (standard deviation)
  const variance = hours.length > 0
    ? hours.reduce((sum, h) => sum + Math.pow(h - averageHours, 2), 0) / hours.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const workloadBalance = Math.max(0, 100 - (stdDev * 10)); // Lower deviation = better balance

  return {
    totalFaculty: faculty.length,
    averageHours,
    minHours,
    maxHours,
    overloadedFaculty,
    underutilizedFaculty,
    workloadBalance,
  };
}

/**
 * Analyze section distribution
 */
function analyzeSectionDistribution(
  schedule: ScheduleItem[],
  sections: Section[]
): SectionDistributionStats {
  const sectionClasses = new Map<string, ScheduleItem[]>();
  
  schedule.forEach(item => {
    if (!sectionClasses.has(item.sectionId)) {
      sectionClasses.set(item.sectionId, []);
    }
    sectionClasses.get(item.sectionId)!.push(item);
  });

  const totalSections = sectionClasses.size;
  const totalClasses = schedule.length;
  const averageClassesPerSection = totalClasses / totalSections;

  let sectionsWithGaps = 0;
  let totalGapDuration = 0;
  let gapCount = 0;

  sectionClasses.forEach(classes => {
    const daySchedules = new Map<DayOfWeek, ScheduleItem[]>();
    
    classes.forEach(item => {
      if (!daySchedules.has(item.day)) {
        daySchedules.set(item.day, []);
      }
      daySchedules.get(item.day)!.push(item);
    });

    daySchedules.forEach(dayClasses => {
      const sorted = dayClasses.sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = timeToMinutes(sorted[i + 1].startTime) - timeToMinutes(sorted[i].endTime);
        if (gap > 0) {
          totalGapDuration += gap;
          gapCount++;
          sectionsWithGaps++;
          break; // Count section only once
        }
      }
    });
  });

  const averageGapDuration = gapCount > 0 ? totalGapDuration / gapCount : 0;

  return {
    totalSections,
    averageClassesPerSection,
    sectionsWithGaps,
    averageGapDuration,
  };
}

/**
 * Analyze time distribution
 */
function analyzeTimeDistribution(schedule: ScheduleItem[]): TimeDistributionStats {
  const classesByDay = new Map<DayOfWeek, number>();
  const classesByHour = new Map<number, number>();

  schedule.forEach(item => {
    // Count by day
    classesByDay.set(item.day, (classesByDay.get(item.day) || 0) + 1);

    // Count by hour
    const hour = parseInt(item.startTime.split(':')[0]);
    classesByHour.set(hour, (classesByHour.get(hour) || 0) + 1);
  });

  const peakHours = Array.from(classesByHour.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const underutilizedSlots: Array<{ day: DayOfWeek; hour: number }> = [];
  // This would require more complex logic based on available slots

  return {
    classesByDay,
    classesByHour,
    peakHours,
    underutilizedSlots,
  };
}

/**
 * Analyze conflicts in schedule
 */
function analyzeConflicts(
  schedule: ScheduleItem[],
  rooms: Room[],
  sections: Section[]
): ConflictStats {
  let roomConflicts = 0;
  let facultyConflicts = 0;
  let sectionConflicts = 0;
  let capacityViolations = 0;

  // Check for conflicts
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const item1 = schedule[i];
      const item2 = schedule[j];

      if (item1.day === item2.day) {
        const overlaps = timeOverlaps(
          item1.startTime,
          item1.endTime,
          item2.startTime,
          item2.endTime
        );

        if (overlaps) {
          if (item1.roomId === item2.roomId) roomConflicts++;
          if (item1.facultyId === item2.facultyId) facultyConflicts++;
          if (item1.sectionId === item2.sectionId) sectionConflicts++;
        }
      }
    }

    // Check capacity
    const room = rooms.find(r => r.id === schedule[i].roomId);
    const section = sections.find(s => s.id === schedule[i].sectionId);
    
    if (room && section && section.studentCount > room.capacity) {
      capacityViolations++;
    }
  }

  const totalConflicts = roomConflicts + facultyConflicts + sectionConflicts + capacityViolations;

  return {
    roomConflicts,
    facultyConflicts,
    sectionConflicts,
    capacityViolations,
    totalConflicts,
  };
}

/**
 * Calculate overall quality metrics
 */
function calculateQualityMetrics(
  roomUtil: RoomUtilizationStats,
  facultyWork: FacultyWorkloadStats,
  sectionDist: SectionDistributionStats,
  timeDist: TimeDistributionStats,
  conflicts: ConflictStats
): ScheduleQualityMetrics {
  // Conflict score (0-100, higher is better)
  const conflictScore = Math.max(0, 100 - (conflicts.totalConflicts * 10));

  // Distribution score (based on time and workload balance)
  const distributionScore = (facultyWork.workloadBalance + 
    Math.min(100, roomUtil.utilizationRate)) / 2;

  // Efficiency score (room utilization and minimal gaps)
  const gapPenalty = Math.min(100, sectionDist.averageGapDuration / 6); // 60 min gap = full penalty
  const efficiencyScore = (roomUtil.utilizationRate + (100 - gapPenalty)) / 2;

  // Satisfaction score (fewer gaps, balanced workload)
  const satisfactionScore = (
    (100 - Math.min(100, sectionDist.sectionsWithGaps * 5)) +
    facultyWork.workloadBalance
  ) / 2;

  // Overall score
  const overallScore = (
    conflictScore * 0.4 +
    distributionScore * 0.2 +
    efficiencyScore * 0.2 +
    satisfactionScore * 0.2
  );

  return {
    overallScore,
    conflictScore,
    distributionScore,
    efficiencyScore,
    satisfactionScore,
  };
}

// ============================================================================
// SCHEDULE COMPARISON
// ============================================================================

export interface ScheduleComparison {
  improvement: number; // percentage
  conflictsReduced: number;
  utilizationImproved: number;
  workloadImproved: number;
  gapsReduced: number;
  overallBetter: boolean;
}

/**
 * Compare two schedules
 */
export function compareSchedules(
  original: ScheduleItem[],
  optimized: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[]
): ScheduleComparison {
  const originalAnalysis = analyzeSchedule(original, courses, faculty, rooms, sections);
  const optimizedAnalysis = analyzeSchedule(optimized, courses, faculty, rooms, sections);

  const improvement = ((optimizedAnalysis.quality.overallScore - originalAnalysis.quality.overallScore) /
    originalAnalysis.quality.overallScore) * 100;

  const conflictsReduced = originalAnalysis.conflicts.totalConflicts - 
    optimizedAnalysis.conflicts.totalConflicts;

  const utilizationImproved = optimizedAnalysis.roomUtilization.utilizationRate -
    originalAnalysis.roomUtilization.utilizationRate;

  const workloadImproved = optimizedAnalysis.facultyWorkload.workloadBalance -
    originalAnalysis.facultyWorkload.workloadBalance;

  const gapsReduced = originalAnalysis.sectionDistribution.averageGapDuration -
    optimizedAnalysis.sectionDistribution.averageGapDuration;

  const overallBetter = optimizedAnalysis.quality.overallScore > 
    originalAnalysis.quality.overallScore;

  return {
    improvement,
    conflictsReduced,
    utilizationImproved,
    workloadImproved,
    gapsReduced,
    overallBetter,
  };
}

// ============================================================================
// SCHEDULE VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'hard_constraint';
  message: string;
  affectedItems: string[];
}

export interface ValidationWarning {
  type: 'soft_constraint';
  message: string;
  severity: 'low' | 'medium' | 'high';
  affectedItems: string[];
}

/**
 * Validate a schedule against all constraints
 */
export function validateSchedule(
  schedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check hard constraints
  const conflicts = analyzeConflicts(schedule, rooms, sections);
  
  if (conflicts.roomConflicts > 0) {
    errors.push({
      type: 'hard_constraint',
      message: `${conflicts.roomConflicts} room conflict(s) detected`,
      affectedItems: [],
    });
  }

  if (conflicts.facultyConflicts > 0) {
    errors.push({
      type: 'hard_constraint',
      message: `${conflicts.facultyConflicts} faculty conflict(s) detected`,
      affectedItems: [],
    });
  }

  if (conflicts.capacityViolations > 0) {
    errors.push({
      type: 'hard_constraint',
      message: `${conflicts.capacityViolations} room capacity violation(s)`,
      affectedItems: [],
    });
  }

  // Check soft constraints
  const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);
  
  if (analysis.facultyWorkload.overloadedFaculty.length > 0) {
    warnings.push({
      type: 'soft_constraint',
      message: `${analysis.facultyWorkload.overloadedFaculty.length} faculty member(s) overloaded`,
      severity: 'high',
      affectedItems: analysis.facultyWorkload.overloadedFaculty.map(f => f.name),
    });
  }

  if (analysis.sectionDistribution.sectionsWithGaps > 0) {
    warnings.push({
      type: 'soft_constraint',
      message: `${analysis.sectionDistribution.sectionsWithGaps} section(s) have scheduling gaps`,
      severity: 'medium',
      affectedItems: [],
    });
  }

  if (analysis.roomUtilization.utilizationRate < 50) {
    warnings.push({
      type: 'soft_constraint',
      message: `Low room utilization: ${analysis.roomUtilization.utilizationRate.toFixed(1)}%`,
      severity: 'low',
      affectedItems: [],
    });
  }

  const isValid = errors.length === 0;

  return { isValid, errors, warnings };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeOverlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && e1 > s2;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export function generateScheduleReport(
  schedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[]
): string {
  const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);
  const validation = validateSchedule(schedule, courses, faculty, rooms, sections);

  let report = `SCHEDULE ANALYSIS REPORT\n`;
  report += `========================\n\n`;
  
  report += `SUMMARY\n`;
  report += `-------\n`;
  report += `Total Classes: ${analysis.totalClasses}\n`;
  report += `Total Hours: ${analysis.totalHours.toFixed(2)}\n`;
  report += `Overall Quality Score: ${analysis.quality.overallScore.toFixed(2)}/100\n\n`;

  report += `ROOM UTILIZATION\n`;
  report += `----------------\n`;
  report += `Rooms Used: ${analysis.roomUtilization.roomsUsed}/${analysis.roomUtilization.totalRooms}\n`;
  report += `Utilization Rate: ${analysis.roomUtilization.utilizationRate.toFixed(2)}%\n`;
  report += `Average Occupancy: ${analysis.roomUtilization.averageOccupancy.toFixed(2)}\n\n`;

  report += `FACULTY WORKLOAD\n`;
  report += `----------------\n`;
  report += `Average Hours: ${analysis.facultyWorkload.averageHours.toFixed(2)}\n`;
  report += `Workload Balance: ${analysis.facultyWorkload.workloadBalance.toFixed(2)}/100\n`;
  report += `Overloaded Faculty: ${analysis.facultyWorkload.overloadedFaculty.length}\n\n`;

  report += `CONFLICTS\n`;
  report += `---------\n`;
  report += `Room Conflicts: ${analysis.conflicts.roomConflicts}\n`;
  report += `Faculty Conflicts: ${analysis.conflicts.facultyConflicts}\n`;
  report += `Section Conflicts: ${analysis.conflicts.sectionConflicts}\n`;
  report += `Capacity Violations: ${analysis.conflicts.capacityViolations}\n`;
  report += `Total Conflicts: ${analysis.conflicts.totalConflicts}\n\n`;

  report += `VALIDATION\n`;
  report += `----------\n`;
  report += `Status: ${validation.isValid ? 'VALID' : 'INVALID'}\n`;
  report += `Errors: ${validation.errors.length}\n`;
  report += `Warnings: ${validation.warnings.length}\n\n`;

  if (validation.errors.length > 0) {
    report += `ERRORS:\n`;
    validation.errors.forEach((error, i) => {
      report += `${i + 1}. ${error.message}\n`;
    });
    report += `\n`;
  }

  if (validation.warnings.length > 0) {
    report += `WARNINGS:\n`;
    validation.warnings.forEach((warning, i) => {
      report += `${i + 1}. [${warning.severity.toUpperCase()}] ${warning.message}\n`;
    });
  }

  return report;
}
