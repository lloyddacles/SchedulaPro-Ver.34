// User Roles
export type UserRole = 'program_assistant' | 'program_head' | 'admin' | 'faculty';

// Schedule Status
export type ScheduleStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

// Approval Level
export type ApprovalLevel = 'program_head' | 'administration';

// Room Type
export type RoomType = 'lecture' | 'laboratory' | 'hybrid';

// Day of Week
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

// Room Interface
export interface Room {
  id: string;
  code: string;
  name: string;
  type: RoomType;
  capacity: number;
  building: string;
  floor: number;
  features: string[];
}

// Time Slot Interface
export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  duration: number;  // in minutes
}

// Section Interface
export interface Section {
  id: string;
  code: string;
  name: string;
  program: string;
  yearLevel: string;
  studentCount: number;
}

// Course Interface
export interface Course {
  id: string;
  code: string;
  name: string;
  units: number;
  type: 'lecture' | 'laboratory' | 'lecture-lab';
  requiresLab: boolean;
}

// Faculty Interface
export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  maxLoad: number; // max teaching hours per week
  specialization: string[];
  profile?: FacultyProfile; // Enhanced profiling data
}

// Faculty Profile - Enhanced for Genetic Algorithm
export interface FacultyProfile {
  // Basic Info
  employeeId?: string;
  position?: string;
  yearsOfExperience?: number;
  
  // Course Preferences (weighted 0-10)
  preferredCourses: { courseId: string; weight: number }[];
  expertise: { subject: string; level: number }[]; // level 1-5
  
  // Time Preferences
  preferredDays: DayOfWeek[];
  preferredTimeSlots: { startTime: string; endTime: string; preference: number }[]; // preference 0-10
  unavailableSlots: { day: DayOfWeek; startTime: string; endTime: string }[];
  
  // Workload Preferences
  preferredMinHours: number;
  preferredMaxHours: number;
  maxConsecutiveHours: number;
  preferredDaysPerWeek: number;
  
  // Teaching Constraints
  noBackToBack: boolean; // Avoid back-to-back classes
  maxDailyHours: number;
  minBreakBetweenClasses: number; // in minutes
  preferredRoomTypes: RoomType[];
  
  // Advanced Preferences
  preferMorning: boolean; // Prefer morning classes
  preferAfternoon: boolean;
  preferSpecificBuildings: string[];
  avoidSpecificRooms: string[];
  
  // Collaboration & Co-teaching
  preferredCoTeachers: string[]; // Faculty IDs
  avoidCoTeachers: string[];
  
  // Special Constraints
  hasAdministrativeLoad: boolean;
  administrativeHours?: number;
  hasResearchLoad: boolean;
  researchHours?: number;
  onLeave?: { startDate: Date; endDate: Date }[];
  
  // Notes
  additionalNotes?: string;
  lastUpdated?: Date;
}

// Schedule Item Interface
export interface ScheduleItem {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  sectionId: string;
  sectionName: string;
  roomId: string;
  roomCode: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  scheduleId: string;
}

// Conflict Interface
export interface Conflict {
  id: string;
  type: 'faculty_overlap' | 'room_conflict' | 'section_clash';
  severity: 'high' | 'medium' | 'low';
  message: string;
  affectedItems: string[]; // IDs of affected schedule items
  suggestion?: string;
}

// Approval Interface
export interface Approval {
  id: string;
  scheduleId: string;
  approverRole: ApprovalLevel;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  timestamp: Date;
}

// Schedule Interface
export interface Schedule {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  program: string;
  status: ScheduleStatus;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  items: ScheduleItem[];
  conflicts: Conflict[];
  approvals: Approval[];
  isLocked: boolean;
  sentToFaculty: boolean;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: 'schedule_assigned' | 'approval_request' | 'schedule_approved' | 'schedule_rejected';
  title: string;
  message: string;
  scheduleId?: string;
  read: boolean;
  timestamp: Date;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalSchedules: number;
  draftSchedules: number;
  pendingApprovals: number;
  approvedSchedules: number;
  rejectedSchedules: number;
  totalConflicts: number;
  roomUtilization: number;
  facultyLoad: number;
}
