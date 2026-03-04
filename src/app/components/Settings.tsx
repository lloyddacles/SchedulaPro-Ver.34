import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Clock, Users, Settings as SettingsIcon, Save, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
  onSave: (settings: any) => void;
}

export function Settings({ onSave }: SettingsProps) {
  const [academicSettings, setAcademicSettings] = useState({
    currentAcademicYear: '2024-2025',
    currentSemester: 'First Semester',
    startDate: '2024-08-15',
    endDate: '2024-12-15',
  });

  const [timeBlockSettings, setTimeBlockSettings] = useState({
    startTime: '06:00',
    endTime: '22:00',
    blockDuration: 60,
    breakDuration: 15,
  });

  const [approvalSettings, setApprovalSettings] = useState({
    requireProgramHeadApproval: true,
    requireAdminApproval: true,
    autoLockOnFullApproval: true,
    allowEditAfterApproval: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    approvalRequests: true,
    scheduleUpdates: true,
    conflictAlerts: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    defaultView: 'dashboard',
    itemsPerPage: 10,
    autoSaveInterval: 5,
    theme: 'light',
  });

  const handleSaveAcademic = () => {
    onSave({ type: 'academic', data: academicSettings });
    toast.success('Academic settings saved successfully');
  };

  const handleSaveTimeBlocks = () => {
    onSave({ type: 'timeBlocks', data: timeBlockSettings });
    toast.success('Time block settings saved successfully');
  };

  const handleSaveApproval = () => {
    onSave({ type: 'approval', data: approvalSettings });
    toast.success('Approval workflow settings saved successfully');
  };

  const handleSaveNotifications = () => {
    onSave({ type: 'notifications', data: notificationSettings });
    toast.success('Notification settings saved successfully');
  };

  const handleSaveSystem = () => {
    onSave({ type: 'system', data: systemSettings });
    toast.success('System settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">System Settings</h2>
        <p className="text-sm text-muted-foreground">Configure system preferences and parameters</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="academic">
            <Calendar className="w-4 h-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="timeblocks">
            <Clock className="w-4 h-4 mr-2" />
            Time Blocks
          </TabsTrigger>
          <TabsTrigger value="approval">
            <Users className="w-4 h-4 mr-2" />
            Approval
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Academic Settings Tab */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Calendar</CardTitle>
              <CardDescription>Configure academic year and semester settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={academicSettings.currentAcademicYear}
                    onChange={(e) => setAcademicSettings({ ...academicSettings, currentAcademicYear: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="semester">Current Semester</Label>
                  <Select 
                    value={academicSettings.currentSemester}
                    onValueChange={(value) => setAcademicSettings({ ...academicSettings, currentSemester: value })}
                  >
                    <SelectTrigger id="semester">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Semester">First Semester</SelectItem>
                      <SelectItem value="Second Semester">Second Semester</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Semester Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={academicSettings.startDate}
                    onChange={(e) => setAcademicSettings({ ...academicSettings, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Semester End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={academicSettings.endDate}
                    onChange={(e) => setAcademicSettings({ ...academicSettings, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAcademic}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Blocks Tab */}
        <TabsContent value="timeblocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Block Configuration</CardTitle>
              <CardDescription>Define schedule time slots and breaks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Day Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={timeBlockSettings.startTime}
                    onChange={(e) => setTimeBlockSettings({ ...timeBlockSettings, startTime: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">First possible class time</p>
                </div>
                <div>
                  <Label htmlFor="endTime">Day End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={timeBlockSettings.endTime}
                    onChange={(e) => setTimeBlockSettings({ ...timeBlockSettings, endTime: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Last possible class time</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blockDuration">Default Block Duration (minutes)</Label>
                  <Select
                    value={timeBlockSettings.blockDuration.toString()}
                    onValueChange={(value) => setTimeBlockSettings({ ...timeBlockSettings, blockDuration: parseInt(value) })}
                  >
                    <SelectTrigger id="blockDuration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                      <SelectItem value="90">90 minutes (1.5 hours)</SelectItem>
                      <SelectItem value="120">120 minutes (2 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Select
                    value={timeBlockSettings.breakDuration.toString()}
                    onValueChange={(value) => setTimeBlockSettings({ ...timeBlockSettings, breakDuration: parseInt(value) })}
                  >
                    <SelectTrigger id="breakDuration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveTimeBlocks}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Workflow Tab */}
        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>Configure multi-level approval settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="programHeadApproval">Require Program Head Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      All schedules must be approved by the program head
                    </p>
                  </div>
                  <Switch
                    id="programHeadApproval"
                    checked={approvalSettings.requireProgramHeadApproval}
                    onCheckedChange={(checked) => setApprovalSettings({ ...approvalSettings, requireProgramHeadApproval: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="adminApproval">Require Administration Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      Schedules need final approval from higher administration
                    </p>
                  </div>
                  <Switch
                    id="adminApproval"
                    checked={approvalSettings.requireAdminApproval}
                    onCheckedChange={(checked) => setApprovalSettings({ ...approvalSettings, requireAdminApproval: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="autoLock">Auto-Lock After Full Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically lock schedules when all approvals are completed
                    </p>
                  </div>
                  <Switch
                    id="autoLock"
                    checked={approvalSettings.autoLockOnFullApproval}
                    onCheckedChange={(checked) => setApprovalSettings({ ...approvalSettings, autoLockOnFullApproval: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="allowEdit">Allow Edit After Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      Permit modifications to approved schedules (requires re-approval)
                    </p>
                  </div>
                  <Switch
                    id="allowEdit"
                    checked={approvalSettings.allowEditAfterApproval}
                    onCheckedChange={(checked) => setApprovalSettings({ ...approvalSettings, allowEditAfterApproval: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveApproval}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage email and in-app notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="emailNotif">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Send notifications to email addresses
                    </p>
                  </div>
                  <Switch
                    id="emailNotif"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="approvalReq">Approval Request Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Notify approvers when schedules are submitted for review
                    </p>
                  </div>
                  <Switch
                    id="approvalReq"
                    checked={notificationSettings.approvalRequests}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, approvalRequests: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="scheduleUpdates">Schedule Update Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Notify users when schedules are updated or modified
                    </p>
                  </div>
                  <Switch
                    id="scheduleUpdates"
                    checked={notificationSettings.scheduleUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, scheduleUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="conflictAlerts">Conflict Alert Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Alert users when scheduling conflicts are detected
                    </p>
                  </div>
                  <Switch
                    id="conflictAlerts"
                    checked={notificationSettings.conflictAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, conflictAlerts: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Configure general system behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultView">Default View on Login</Label>
                <Select
                  value={systemSettings.defaultView}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, defaultView: value })}
                >
                  <SelectTrigger id="defaultView">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="schedules">Schedules</SelectItem>
                    <SelectItem value="approvals">Approvals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="itemsPerPage">Items Per Page</Label>
                <Select
                  value={systemSettings.itemsPerPage.toString()}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, itemsPerPage: parseInt(value) })}
                >
                  <SelectTrigger id="itemsPerPage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="autoSave">Auto-save Interval (minutes)</Label>
                <Select
                  value={systemSettings.autoSaveInterval.toString()}
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, autoSaveInterval: parseInt(value) })}
                >
                  <SelectTrigger id="autoSave">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveSystem}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
