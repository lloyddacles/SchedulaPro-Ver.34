import { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Login } from "./components/Login";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./components/Dashboard";
import { ScheduleBuilder } from "./components/ScheduleBuilder";
import { ApprovalWorkflow } from "./components/ApprovalWorkflow";
import { FacultyScheduleView } from "./components/FacultyScheduleView";
import { ScheduleList } from "./components/ScheduleList";
import { Reports } from "./components/Reports";
import { ConflictManagement } from "./components/ConflictManagement";
import { FacultyManagement } from "./components/FacultyManagement";
import { Settings } from "./components/Settings";
import { ScheduleOptimizer } from "./components/ScheduleOptimizer";
import { OptimizationDemo } from "./components/OptimizationDemo";
import { FacultyProfiling } from "./components/FacultyProfiling";

import type {
  UserRole,
  Schedule,
  ScheduleItem,
  Faculty,
  Room,
  Course,
  Section,
} from "./types";

import {
  mockUsers,
  mockSchedules,
  mockCourses,
  mockFaculty,
  mockRooms,
  mockSections,
  mockDashboardStats,
  mockNotifications,
} from "./data/mockData";

import { apiService } from "./services/ApiService";
import { validationService } from "./services/ValidationService";
import { auditService } from "./services/AuditService";
import {
  conflictIndex,
  cacheService,
} from "./services/PerformanceService";

type SystemSettings = {
  academicYear: string;
  semester: string;
  allowOverrides: boolean;
};

const APPROVAL_ROLE_MAP: Record<
  string,
  "program_head" | "administration"
> = {
  program_head: "program_head",
  admin: "administration",
};

export default function App() {
  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [currentView, setCurrentView] = useState("dashboard");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);

  const currentRole = (user?.role || "program_assistant") as UserRole;

  /* ===================== DATA LOADING ===================== */

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    
    loadData();
  }, [user]);

  /* ===================== PERFORMANCE INDEX ===================== */

  useEffect(() => {
    const allItems = schedules.flatMap((s) => s.items);
    conflictIndex.buildIndex(allItems);
  }, [schedules]);

  /* ===================== DATA FUNCTIONS ===================== */

  const loadData = async () => {
    try {
      setDataLoading(true);

      const [
        schedulesData,
        facultyData,
        roomsData,
        coursesData,
        sectionsData,
      ] = await Promise.all([
        apiService.getSchedules(),
        apiService.getFaculty(),
        apiService.getRooms(),
        apiService.getCourses(),
        apiService.getSections(),
      ]);

      // If no data exists, initialize with mock data
      if (
        schedulesData.length === 0 &&
        facultyData.length === 0 &&
        roomsData.length === 0 &&
        coursesData.length === 0 &&
        sectionsData.length === 0 &&
        !dataInitialized
      ) {
        await initializeData();
        return;
      }

      setSchedules(schedulesData);
      setFaculty(facultyData);
      setRooms(roomsData);
      setCourses(coursesData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load data. Using cached data.');
      // Fallback to mock data
      setSchedules(mockSchedules);
      setFaculty(mockFaculty);
      setRooms(mockRooms);
      setCourses(mockCourses);
      setSections(mockSections);
    } finally {
      setDataLoading(false);
    }
  };

  const initializeData = async () => {
    try {
      await apiService.initializeData({
        rooms: mockRooms,
        courses: mockCourses,
        sections: mockSections,
        faculty: mockFaculty,
        schedules: mockSchedules,
      });

      setDataInitialized(true);
      toast.success('System initialized with demo data');
      
      // Reload data after initialization
      await loadData();
    } catch (error) {
      console.error('Initialize data error:', error);
      toast.error('Failed to initialize data');
    }
  };

  /* ===================== AUTHENTICATION CHECK ===================== */

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading SchedulaPro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <Toaster position="top-right" />
      </>
    );
  }

  // Create user object for compatibility with existing components
  const currentUser = {
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    role: currentRole,
  };

  /* ===================== SCHEDULE SAVE ===================== */

  const handleSaveSchedule = (items: ScheduleItem[]) => {
    const draftSchedule: Schedule = {
      id: `sch-draft-${Date.now()}`,
      name: "Draft Schedule",
      academicYear: "2024-2025",
      semester: "First Semester",
      program: "BS Computer Science",
      status: "draft",
      createdBy: user?.id || "",
      createdByName: user?.name || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      items,
      conflicts: [],
      approvals: [],
      isLocked: false,
      sentToFaculty: false,
    };

    const validationResult =
      validationService.validateEntireSchedule(draftSchedule, {
        allRooms: rooms,
        allFaculty: faculty,
        allSections: sections,
        allCourses: courses,
        allSchedules: schedules,
        requestedBy: currentRole,
      });

    if (!validationResult.isValid) {
      toast.error(
        `Cannot save: ${validationResult.errors.length} validation errors`,
      );
      return;
    }

    auditService.logAction({
      action: "create",
      entityType: "schedule",
      entityId: draftSchedule.id,
      userId: user?.id || "",
      userName: user?.name || "",
      userRole: currentRole,
      afterState: draftSchedule,
    });

    setSchedules((prev) => [...prev, draftSchedule]);
    toast.success("Schedule draft saved successfully");
  };

  /* ===================== SUBMIT FOR APPROVAL ===================== */

  const handleSubmitForApproval = (items: ScheduleItem[]) => {
    const newSchedule: Schedule = {
      id: `sch-${Date.now()}`,
      name: "New Schedule - Pending Approval",
      academicYear: "2024-2025",
      semester: "First Semester",
      program: "BS Computer Science",
      status: "pending_approval",
      createdBy: user?.id || "",
      createdByName: user?.name || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      items,
      conflicts: [],
      approvals: [],
      isLocked: false,
      sentToFaculty: false,
    };

    const validationResult =
      validationService.validateEntireSchedule(newSchedule, {
        allRooms: rooms,
        allFaculty: faculty,
        allSections: sections,
        allCourses: courses,
        allSchedules: schedules,
        requestedBy: currentRole,
      });

    if (!validationResult.isValid) {
      toast.error(
        "Validation errors must be resolved before submission",
      );
      return;
    }

    auditService.createVersion({
      schedule: newSchedule,
      userId: user?.id || "",
      userRole: currentRole,
      reasonForChange: "Initial submission for approval",
    });

    setSchedules((prev) => [...prev, newSchedule]);
    setCurrentView("schedules");
    toast.success("Schedule submitted for approval");
  };

  /* ===================== APPROVAL ===================== */

  const handleApprove = (
    scheduleId: string,
    remarks?: string,
  ) => {
    if (!["admin", "program_head"].includes(currentRole)) {
      toast.error("Unauthorized action");
      return;
    }

    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id !== scheduleId) return s;

        const beforeState = { ...s };

        const approval = {
          id: `app-${Date.now()}`,
          scheduleId,
          approverRole: APPROVAL_ROLE_MAP[currentRole],
          approverId: user?.id || "",
          approverName: user?.name || "",
          status: "approved" as const,
          remarks,
          timestamp: new Date(),
        };

        const updated = {
          ...s,
          approvals: [...s.approvals, approval],
          status:
            currentRole === "admin" ? "approved" : s.status,
          isLocked: currentRole === "admin",
          updatedAt: new Date(),
        };

        auditService.createVersion({
          schedule: beforeState,
          userId: user?.id || "",
          userRole: currentRole,
          reasonForChange: "Before approval",
        });

        auditService.logAction({
          action: "approve",
          entityType: "schedule",
          entityId: scheduleId,
          userId: user?.id || "",
          userName: user?.name || "",
          userRole: currentRole,
          beforeState,
          afterState: updated,
        });

        return updated;
      }),
    );

    toast.success("Schedule approved");
  };

  /* ===================== REJECT ===================== */

  const handleReject = (
    scheduleId: string,
    remarks: string,
  ) => {
    if (!["admin", "program_head"].includes(currentRole)) {
      toast.error("Unauthorized action");
      return;
    }

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? {
              ...s,
              status: "rejected",
              isLocked: false,
              updatedAt: new Date(),
            }
          : s,
      ),
    );

    toast.error("Schedule rejected");
  };

  /* ===================== SEND TO FACULTY ===================== */

  const handleSendToFaculty = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? { ...s, sentToFaculty: true, updatedAt: new Date() }
          : s,
      ),
    );

    toast.success("Schedule sent to faculty");
  };

  /* ===================== FACULTY ===================== */

  const handleUpdateFaculty = (updatedFaculty: Faculty[]) => {
    setFaculty(updatedFaculty);
    cacheService.invalidate("faculty_load");
  };

  /* ===================== SETTINGS ===================== */

  const handleUpdateSettings = (settings: SystemSettings) => {
    auditService.logAction({
      action: "update",
      entityType: "system_settings",
      entityId: "global",
      userId: user?.id || "",
      userName: user?.name || "",
      userRole: currentRole,
      afterState: settings,
    });
  };

  /* ===================== THEME ===================== */

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  /* ===================== VIEW RENDER ===================== */

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            currentRole={currentRole}
            stats={mockDashboardStats}
            recentSchedules={schedules.slice(0, 5)}
            notifications={mockNotifications}
            onViewSchedule={(scheduleId) => {
              console.log('Viewing schedule:', scheduleId);
              setCurrentView('schedules');
            }}
          />
        );

      case "schedules":
        return (
          <ScheduleList
            schedules={schedules}
            canEdit={currentRole !== "faculty"}
            canSendToFaculty={currentRole !== "faculty"}
            onView={() => {}}
            onEdit={() => {}}
            onSendToFaculty={handleSendToFaculty}
          />
        );

      case "create-schedule":
        return (
          <ScheduleBuilder
            courses={courses}
            faculty={faculty}
            rooms={rooms}
            sections={sections}
            onSave={handleSaveSchedule}
            onSubmitForApproval={handleSubmitForApproval}
          />
        );

      case "approvals":
        return (
          <ApprovalWorkflow
            schedules={schedules}
            currentRole={currentRole}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewSchedule={() => {}}
          />
        );

      case "faculty":
        return (
          <FacultyManagement
            faculty={faculty}
            schedules={schedules}
            onAddFaculty={(newFaculty) => {
              const facultyWithId: Faculty = {
                ...newFaculty,
                id: `fac-${Date.now()}`,
              };
              handleUpdateFaculty([...faculty, facultyWithId]);
            }}
            onEditFaculty={(id, updates) => {
              const updated = faculty.map(f => 
                f.id === id ? { ...f, ...updates } : f
              );
              handleUpdateFaculty(updated);
            }}
            onDeleteFaculty={(id) => {
              const updated = faculty.filter(f => f.id !== id);
              handleUpdateFaculty(updated);
            }}
          />
        );

      case "faculty-profiling":
        return (
          <FacultyProfiling
            faculty={faculty}
            courses={courses}
            rooms={rooms}
            onUpdateFaculty={handleUpdateFaculty}
          />
        );

      case "reports":
        return (
          <Reports
            schedules={schedules}
            rooms={rooms}
            faculty={faculty}
          />
        );

      case "settings":
        return (
          <Settings onSave={handleUpdateSettings} />
        );

      case "optimizer":
        return (
          <ScheduleOptimizer
            currentSchedule={schedules.length > 0 ? schedules[0].items : []}
            courses={courses}
            faculty={faculty}
            rooms={rooms}
            sections={sections}
            onOptimizedSchedule={(optimizedItems) => {
              const optimizedSchedule: Schedule = {
                id: `sch-optimized-${Date.now()}`,
                name: "AI Optimized Schedule",
                academicYear: "2024-2025",
                semester: "First Semester",
                program: "BS Computer Science",
                status: "draft",
                createdBy: user?.id || "",
                createdByName: user?.name || "",
                createdAt: new Date(),
                updatedAt: new Date(),
                items: optimizedItems,
                conflicts: [],
                approvals: [],
                isLocked: false,
                sentToFaculty: false,
              };
              setSchedules(prev => [...prev, optimizedSchedule]);
              toast.success("Optimized schedule saved!");
              setCurrentView("schedules");
            }}
          />
        );

      case "optimization-demo":
        return <OptimizationDemo />;

      case "conflicts":
        return (
          <ConflictManagement
            schedules={schedules}
            onResolveConflict={(conflictId, resolution) => {
              console.log('Resolving conflict:', conflictId, resolution);
              toast.success('Conflict resolved');
            }}
            onViewSchedule={(scheduleId) => {
              console.log('Viewing schedule:', scheduleId);
              setCurrentView('schedules');
            }}
          />
        );

      default:
        return currentRole === "faculty" ? (
          <FacultyScheduleView
            schedules={schedules}
            facultyName={user?.name || ""}
          />
        ) : (
          <Dashboard
            currentRole={currentRole}
            stats={mockDashboardStats}
            recentSchedules={schedules.slice(0, 5)}
            notifications={mockNotifications}
            onViewSchedule={(scheduleId) => {
              console.log('Viewing schedule:', scheduleId);
              setCurrentView('schedules');
            }}
          />
        );
    }
  };

  /* ===================== RENDER ===================== */

  return (
    <div className="min-h-screen bg-background">
      <AppLayout
        user={currentUser}
        onSignOut={signOut}
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        notificationCount={
          mockNotifications.filter((n) => !n.read).length
        }
      >
        {renderView()}
      </AppLayout>
      <Toaster position="top-right" />
    </div>
  );
}