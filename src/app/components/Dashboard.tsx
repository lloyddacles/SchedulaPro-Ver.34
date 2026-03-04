import { UserRole, DashboardStats, Schedule, Notification } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Calendar, CircleCheck, Clock, CircleX, 
  TriangleAlert, Users, TrendingUp, FileText 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  currentRole: UserRole;
  stats: DashboardStats;
  recentSchedules: Schedule[];
  notifications: Notification[];
  onViewSchedule: (scheduleId: string) => void;
}

export function Dashboard({ currentRole, stats, recentSchedules, notifications, onViewSchedule }: DashboardProps) {
  
  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-slate-500',
      pending_approval: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const scheduleStatusData = [
    { name: 'Draft', value: stats.draftSchedules, color: '#64748b' },
    { name: 'Pending', value: stats.pendingApprovals, color: '#eab308' },
    { name: 'Approved', value: stats.approvedSchedules, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedSchedules, color: '#ef4444' },
  ];

  const utilizationData = [
    { name: 'Mon', rooms: 75, faculty: 80 },
    { name: 'Tue', rooms: 68, faculty: 72 },
    { name: 'Wed', rooms: 82, faculty: 85 },
    { name: 'Thu', rooms: 70, faculty: 75 },
    { name: 'Fri', rooms: 65, faculty: 68 },
    { name: 'Sat', rooms: 45, faculty: 50 },
  ];

  const renderProgramAssistantDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Schedules</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.totalSchedules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.draftSchedules} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Approval</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Conflicts</CardTitle>
            <TriangleAlert className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.totalConflicts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Room Utilization</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.roomUtilization}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average usage
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Schedules */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Schedules</CardTitle>
            <CardDescription>Your recently created or modified schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-foreground">{schedule.name}</h4>
                    <p className="text-sm text-muted-foreground">{schedule.academicYear} - {schedule.semester}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={schedule.status === 'approved' ? 'default' : 'secondary'}>
                      {getStatusLabel(schedule.status)}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => onViewSchedule(schedule.id)}>
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Utilization</CardTitle>
            <CardDescription>Room and faculty utilization by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rooms" fill="#1e3a8a" name="Rooms" />
                <Bar dataKey="faculty" fill="#10b981" name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderProgramHeadDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
            <CircleCheck className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <CircleCheck className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.approvedSchedules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Faculty Load</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.facultyLoad}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average load
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Schedules</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.totalSchedules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All programs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Status Distribution</CardTitle>
            <CardDescription>Overview of all schedules by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={scheduleStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scheduleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Schedules awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchedules
                .filter(s => s.status === 'pending_approval')
                .map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-foreground">{schedule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created by {schedule.createdByName}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => onViewSchedule(schedule.id)}>
                      Review
                    </Button>
                  </div>
                ))}
              {recentSchedules.filter(s => s.status === 'pending_approval').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending approvals
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Pending Reviews</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Final approval needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Approved Schedules</CardTitle>
            <CircleCheck className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.approvedSchedules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for distribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Room Utilization</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.roomUtilization}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Campus-wide
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Faculty Load</CardTitle>
            <Users className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{stats.facultyLoad}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average allocation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Weekly room and faculty utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rooms" fill="#1e3a8a" name="Rooms" />
                <Bar dataKey="faculty" fill="#10b981" name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest schedule submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSchedules.slice(0, 3).map((schedule) => (
                <div key={schedule.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-foreground">{schedule.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      By {schedule.createdByName} • {schedule.program}
                    </p>
                  </div>
                  <Badge variant={schedule.status === 'approved' ? 'default' : 'secondary'}>
                    {getStatusLabel(schedule.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderFacultyDashboard = () => (
    <>
      {/* Faculty-specific view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">My Schedules</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Teaching Load</CardTitle>
            <Users className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">18 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Classes</CardTitle>
            <FileText className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              This semester
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Class Schedules</CardTitle>
          <CardDescription>Your assigned teaching schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSchedules.filter(s => s.status === 'approved').slice(0, 3).map((schedule) => (
              <div key={schedule.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-foreground">{schedule.name}</h4>
                  <Badge variant="default">
                    <CircleCheck className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {schedule.academicYear} - {schedule.semester}
                </p>
                <Button size="sm" variant="outline" onClick={() => onViewSchedule(schedule.id)}>
                  View Full Schedule
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div>
      {currentRole === 'program_assistant' && renderProgramAssistantDashboard()}
      {currentRole === 'program_head' && renderProgramHeadDashboard()}
      {currentRole === 'admin' && renderAdminDashboard()}
      {currentRole === 'faculty' && renderFacultyDashboard()}
    </div>
  );
}