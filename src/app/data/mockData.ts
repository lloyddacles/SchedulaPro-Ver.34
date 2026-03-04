import type { 
  User, Room, Faculty, Course, Section, Schedule, 
  ScheduleItem, Conflict, Approval, Notification, DashboardStats 
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  { id: 'u1', name: 'Maria Santos', email: 'maria.santos@university.edu', role: 'program_assistant', department: 'Computer Science' },
  { id: 'u2', name: 'Dr. John Reyes', email: 'john.reyes@university.edu', role: 'program_head', department: 'Computer Science' },
  { id: 'u3', name: 'Dr. Elena Cruz', email: 'elena.cruz@university.edu', role: 'admin', department: 'Academic Affairs' },
  { id: 'u4', name: 'Prof. Robert Garcia', email: 'robert.garcia@university.edu', role: 'faculty', department: 'Computer Science' },
];

// Mock Rooms
export const mockRooms: Room[] = [
  { id: 'r1', code: 'CS-101', name: 'Computer Science Lab 1', type: 'laboratory', capacity: 40, building: 'CS Building', floor: 1, features: ['Computers', 'Projector', 'AC'] },
  { id: 'r2', code: 'CS-201', name: 'Computer Science Lab 2', type: 'laboratory', capacity: 35, building: 'CS Building', floor: 2, features: ['Computers', 'Projector', 'AC'] },
  { id: 'r3', code: 'GH-301', name: 'General Lecture Hall 301', type: 'lecture', capacity: 60, building: 'General Hall', floor: 3, features: ['Projector', 'AC', 'Sound System'] },
  { id: 'r4', code: 'GH-302', name: 'General Lecture Hall 302', type: 'lecture', capacity: 50, building: 'General Hall', floor: 3, features: ['Projector', 'AC'] },
  { id: 'r5', code: 'GH-401', name: 'General Lecture Hall 401', type: 'lecture', capacity: 45, building: 'General Hall', floor: 4, features: ['Projector', 'AC'] },
  { id: 'r6', code: 'CS-301', name: 'Computer Science Lecture Room', type: 'hybrid', capacity: 48, building: 'CS Building', floor: 3, features: ['Computers', 'Projector', 'AC', 'Whiteboard'] },
];

// Mock Faculty
export const mockFaculty: Faculty[] = [
  { id: 'f1', name: 'Prof. Robert Garcia', email: 'robert.garcia@university.edu', department: 'Computer Science', maxLoad: 24, specialization: ['Programming', 'Web Development'] },
  { id: 'f2', name: 'Dr. Anna Martinez', email: 'anna.martinez@university.edu', department: 'Computer Science', maxLoad: 21, specialization: ['Data Structures', 'Algorithms'] },
  { id: 'f3', name: 'Prof. Michael Tan', email: 'michael.tan@university.edu', department: 'Computer Science', maxLoad: 24, specialization: ['Database', 'Systems Analysis'] },
  { id: 'f4', name: 'Dr. Sarah Lee', email: 'sarah.lee@university.edu', department: 'Computer Science', maxLoad: 18, specialization: ['AI', 'Machine Learning'] },
  { id: 'f5', name: 'Prof. David Chen', email: 'david.chen@university.edu', department: 'Mathematics', maxLoad: 24, specialization: ['Calculus', 'Statistics'] },
];

// Mock Courses
export const mockCourses: Course[] = [
  { id: 'c1', code: 'CS101', name: 'Introduction to Programming', units: 3, type: 'lecture-lab', requiresLab: true },
  { id: 'c2', code: 'CS102', name: 'Data Structures and Algorithms', units: 3, type: 'lecture-lab', requiresLab: true },
  { id: 'c3', code: 'CS201', name: 'Web Development', units: 3, type: 'lecture-lab', requiresLab: true },
  { id: 'c4', code: 'CS202', name: 'Database Management Systems', units: 3, type: 'lecture-lab', requiresLab: true },
  { id: 'c5', code: 'MATH101', name: 'Calculus I', units: 3, type: 'lecture', requiresLab: false },
  { id: 'c6', code: 'MATH102', name: 'Statistics and Probability', units: 3, type: 'lecture', requiresLab: false },
];

// Mock Sections
export const mockSections: Section[] = [
  { id: 's1', code: 'BSCS-1A', name: 'BS Computer Science 1-A', program: 'BS Computer Science', yearLevel: '1st Year', studentCount: 42 },
  { id: 's2', code: 'BSCS-1B', name: 'BS Computer Science 1-B', program: 'BS Computer Science', yearLevel: '1st Year', studentCount: 38 },
  { id: 's3', code: 'BSCS-2A', name: 'BS Computer Science 2-A', program: 'BS Computer Science', yearLevel: '2nd Year', studentCount: 40 },
  { id: 's4', code: 'BSCS-2B', name: 'BS Computer Science 2-B', program: 'BS Computer Science', yearLevel: '2nd Year', studentCount: 35 },
  { id: 's5', code: 'BSIT-1A', name: 'BS Information Technology 1-A', program: 'BS Information Technology', yearLevel: '1st Year', studentCount: 45 },
];

// Mock Schedule Items
export const mockScheduleItems: ScheduleItem[] = [
  {
    id: 'si1',
    courseId: 'c1',
    courseName: 'Introduction to Programming',
    courseCode: 'CS101',
    facultyId: 'f1',
    facultyName: 'Prof. Robert Garcia',
    sectionId: 's1',
    sectionName: 'BSCS-1A',
    roomId: 'r1',
    roomCode: 'CS-101',
    day: 'Monday',
    startTime: '08:00',
    endTime: '10:00',
    scheduleId: 'sch1',
  },
  {
    id: 'si2',
    courseId: 'c1',
    courseName: 'Introduction to Programming',
    courseCode: 'CS101',
    facultyId: 'f1',
    facultyName: 'Prof. Robert Garcia',
    sectionId: 's1',
    sectionName: 'BSCS-1A',
    roomId: 'r1',
    roomCode: 'CS-101',
    day: 'Wednesday',
    startTime: '08:00',
    endTime: '10:00',
    scheduleId: 'sch1',
  },
  {
    id: 'si3',
    courseId: 'c5',
    courseName: 'Calculus I',
    courseCode: 'MATH101',
    facultyId: 'f5',
    facultyName: 'Prof. David Chen',
    sectionId: 's1',
    sectionName: 'BSCS-1A',
    roomId: 'r3',
    roomCode: 'GH-301',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '12:00',
    scheduleId: 'sch1',
  },
  {
    id: 'si4',
    courseId: 'c2',
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CS102',
    facultyId: 'f2',
    facultyName: 'Dr. Anna Martinez',
    sectionId: 's3',
    sectionName: 'BSCS-2A',
    roomId: 'r2',
    roomCode: 'CS-201',
    day: 'Monday',
    startTime: '13:00',
    endTime: '15:00',
    scheduleId: 'sch2',
  },
];

// Mock Conflicts
export const mockConflicts: Conflict[] = [
  {
    id: 'conf1',
    type: 'room_conflict',
    severity: 'high',
    message: 'Room CS-101 is double-booked on Monday 08:00-10:00',
    affectedItems: ['si1'],
    suggestion: 'Consider using room CS-201 or changing the time slot',
  },
];

// Mock Approvals
export const mockApprovals: Approval[] = [
  {
    id: 'app1',
    scheduleId: 'sch1',
    approverRole: 'program_head',
    approverId: 'u2',
    approverName: 'Dr. John Reyes',
    status: 'approved',
    remarks: 'Approved with minor suggestions for optimization',
    timestamp: new Date('2025-01-10T10:30:00'),
  },
  {
    id: 'app2',
    scheduleId: 'sch1',
    approverRole: 'administration',
    approverId: 'u3',
    approverName: 'Dr. Elena Cruz',
    status: 'pending',
    timestamp: new Date('2025-01-12T14:00:00'),
  },
];

// Mock Schedules
export const mockSchedules: Schedule[] = [
  {
    id: 'sch1',
    name: 'BSCS 1st Year - Semester 1',
    academicYear: '2024-2025',
    semester: 'First Semester',
    program: 'BS Computer Science',
    status: 'pending_approval',
    createdBy: 'u1',
    createdByName: 'Maria Santos',
    createdAt: new Date('2025-01-08T09:00:00'),
    updatedAt: new Date('2025-01-10T15:30:00'),
    items: [mockScheduleItems[0], mockScheduleItems[1], mockScheduleItems[2]],
    conflicts: [],
    approvals: [mockApprovals[0], mockApprovals[1]],
    isLocked: false,
    sentToFaculty: false,
  },
  {
    id: 'sch2',
    name: 'BSCS 2nd Year - Semester 1',
    academicYear: '2024-2025',
    semester: 'First Semester',
    program: 'BS Computer Science',
    status: 'draft',
    createdBy: 'u1',
    createdByName: 'Maria Santos',
    createdAt: new Date('2025-01-12T11:00:00'),
    updatedAt: new Date('2025-01-15T16:00:00'),
    items: [mockScheduleItems[3]],
    conflicts: [],
    approvals: [],
    isLocked: false,
    sentToFaculty: false,
  },
  {
    id: 'sch3',
    name: 'BSIT 1st Year - Semester 1',
    academicYear: '2024-2025',
    semester: 'First Semester',
    program: 'BS Information Technology',
    status: 'approved',
    createdBy: 'u2',
    createdByName: 'Dr. John Reyes',
    createdAt: new Date('2024-12-20T10:00:00'),
    updatedAt: new Date('2025-01-05T14:00:00'),
    items: [],
    conflicts: [],
    approvals: [
      {
        id: 'app3',
        scheduleId: 'sch3',
        approverRole: 'program_head',
        approverId: 'u2',
        approverName: 'Dr. John Reyes',
        status: 'approved',
        timestamp: new Date('2024-12-28T10:00:00'),
      },
      {
        id: 'app4',
        scheduleId: 'sch3',
        approverRole: 'administration',
        approverId: 'u3',
        approverName: 'Dr. Elena Cruz',
        status: 'approved',
        remarks: 'Approved for implementation',
        timestamp: new Date('2025-01-05T14:00:00'),
      },
    ],
    isLocked: true,
    sentToFaculty: true,
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u3',
    type: 'approval_request',
    title: 'New Approval Request',
    message: 'BSCS 1st Year - Semester 1 schedule requires your approval',
    scheduleId: 'sch1',
    read: false,
    timestamp: new Date('2025-01-12T14:00:00'),
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'schedule_approved',
    title: 'Schedule Approved',
    message: 'BSCS 1st Year - Semester 1 has been approved by Dr. John Reyes',
    scheduleId: 'sch1',
    read: true,
    timestamp: new Date('2025-01-10T10:30:00'),
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalSchedules: 8,
  draftSchedules: 3,
  pendingApprovals: 2,
  approvedSchedules: 3,
  rejectedSchedules: 0,
  totalConflicts: 1,
  roomUtilization: 68.5,
  facultyLoad: 75.2,
};

// Time slots for the day (6 AM - 10 PM)
export const timeSlots = [
  { time: '06:00', label: '6:00 AM' },
  { time: '07:00', label: '7:00 AM' },
  { time: '08:00', label: '8:00 AM' },
  { time: '09:00', label: '9:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '11:00', label: '11:00 AM' },
  { time: '12:00', label: '12:00 PM' },
  { time: '13:00', label: '1:00 PM' },
  { time: '14:00', label: '2:00 PM' },
  { time: '15:00', label: '3:00 PM' },
  { time: '16:00', label: '4:00 PM' },
  { time: '17:00', label: '5:00 PM' },
  { time: '18:00', label: '6:00 PM' },
  { time: '19:00', label: '7:00 PM' },
  { time: '20:00', label: '8:00 PM' },
  { time: '21:00', label: '9:00 PM' },
  { time: '22:00', label: '10:00 PM' },
];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
