import { useState } from 'react';
import { Schedule, Approval, UserRole } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CircleCheck, CircleX, Clock, Eye, MessageSquare, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalWorkflowProps {
  schedules: Schedule[];
  currentRole: UserRole;
  onApprove: (scheduleId: string, remarks?: string) => void;
  onReject: (scheduleId: string, remarks: string) => void;
  onViewSchedule: (scheduleId: string) => void;
}

export function ApprovalWorkflow({ 
  schedules, 
  currentRole, 
  onApprove, 
  onReject,
  onViewSchedule 
}: ApprovalWorkflowProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [remarks, setRemarks] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CircleCheck className="w-4 h-4" />;
    if (status === 'rejected') return <CircleX className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const handleOpenApprovalDialog = (schedule: Schedule, action: 'approve' | 'reject') => {
    setSelectedSchedule(schedule);
    setApprovalAction(action);
    setRemarks('');
    setIsApprovalDialogOpen(true);
  };

  const handleSubmitApproval = () => {
    if (!selectedSchedule) return;

    if (approvalAction === 'approve') {
      onApprove(selectedSchedule.id, remarks || undefined);
      toast.success('Schedule approved successfully');
    } else {
      if (!remarks.trim()) {
        toast.error('Please provide rejection remarks');
        return;
      }
      onReject(selectedSchedule.id, remarks);
      toast.error('Schedule rejected');
    }

    setIsApprovalDialogOpen(false);
    setSelectedSchedule(null);
    setRemarks('');
  };

  const canApprove = (schedule: Schedule): boolean => {
    if (currentRole === 'program_head') {
      // Program head can approve if no program_head approval exists yet
      return !schedule.approvals.some(a => a.approverRole === 'program_head');
    }
    if (currentRole === 'admin') {
      // Admin can approve if program_head has approved
      const programHeadApproved = schedule.approvals.some(
        a => a.approverRole === 'program_head' && a.status === 'approved'
      );
      const adminApproval = schedule.approvals.find(a => a.approverRole === 'administration');
      return programHeadApproved && (!adminApproval || adminApproval.status === 'pending');
    }
    return false;
  };

  const pendingSchedules = schedules.filter(s => 
    s.status === 'pending_approval' && canApprove(s)
  );

  const reviewedSchedules = schedules.filter(s => 
    s.status === 'approved' || s.status === 'rejected'
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ScheduleCard = ({ schedule, showActions }: { schedule: Schedule; showActions: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{schedule.name}</CardTitle>
            <CardDescription className="mt-1">
              {schedule.program} • {schedule.academicYear} - {schedule.semester}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              Created by {schedule.createdByName} on {formatDate(schedule.createdAt)}
            </p>
          </div>
          {schedule.isLocked && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schedule Info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Classes</p>
            <p className="text-foreground">{schedule.items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Conflicts</p>
            <p className={schedule.conflicts.length > 0 ? 'text-destructive' : 'text-foreground'}>
              {schedule.conflicts.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant={schedule.status === 'approved' ? 'default' : 'secondary'}>
              {schedule.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Approval Trail */}
        <div className="space-y-2">
          <h4 className="text-sm text-muted-foreground">Approval Trail</h4>
          <div className="space-y-2">
            {schedule.approvals.map((approval) => (
              <div key={approval.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${getStatusColor(approval.status)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{approval.approverName}</span>
                    <Badge variant="outline" className="text-xs">
                      {approval.approverRole === 'program_head' ? 'Program Head' : 'Administration'}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getStatusIcon(approval.status)}
                      {approval.status}
                    </span>
                  </div>
                  {approval.remarks && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
                      <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                      {approval.remarks}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(approval.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewSchedule(schedule.id)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {showActions && !schedule.isLocked && (
            <>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleOpenApprovalDialog(schedule, 'approve')}
              >
                <CircleCheck className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleOpenApprovalDialog(schedule, 'reject')}
              >
                <CircleX className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">Approval Workflow</h2>
        <p className="text-sm text-muted-foreground">Review and approve class schedules</p>
      </div>

      {/* Tabs for Pending and Reviewed */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Approval
            {pendingSchedules.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingSchedules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingSchedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CircleCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-foreground mb-2">No Pending Approvals</h3>
                <p className="text-sm text-muted-foreground">
                  All schedules have been reviewed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingSchedules.map((schedule) => (
                <ScheduleCard 
                  key={schedule.id} 
                  schedule={schedule} 
                  showActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedSchedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-foreground mb-2">No Reviewed Schedules</h3>
                <p className="text-sm text-muted-foreground">
                  Reviewed schedules will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewedSchedules.map((schedule) => (
                <ScheduleCard 
                  key={schedule.id} 
                  schedule={schedule} 
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve Schedule' : 'Reject Schedule'}
            </DialogTitle>
            <DialogDescription>
              {selectedSchedule?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-foreground mb-2">
                {approvalAction === 'approve' ? 'Approval Remarks (Optional)' : 'Rejection Remarks (Required)'}
              </h4>
              <Textarea
                placeholder={
                  approvalAction === 'approve' 
                    ? 'Add any comments or suggestions...' 
                    : 'Please provide a reason for rejection...'
                }
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>

            {selectedSchedule && (
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><span className="text-muted-foreground">Program:</span> {selectedSchedule.program}</p>
                <p><span className="text-muted-foreground">Academic Year:</span> {selectedSchedule.academicYear}</p>
                <p><span className="text-muted-foreground">Classes:</span> {selectedSchedule.items.length}</p>
                <p><span className="text-muted-foreground">Conflicts:</span> 
                  <span className={selectedSchedule.conflicts.length > 0 ? 'text-destructive ml-1' : 'ml-1'}>
                    {selectedSchedule.conflicts.length}
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleSubmitApproval}
            >
              {approvalAction === 'approve' ? 'Approve Schedule' : 'Reject Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}