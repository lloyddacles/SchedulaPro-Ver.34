import { useState } from 'react';
import { Schedule } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Edit, Eye, Send, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleListProps {
  schedules: Schedule[];
  canEdit: boolean;
  canSendToFaculty: boolean;
  onView: (scheduleId: string) => void;
  onEdit: (scheduleId: string) => void;
  onSendToFaculty: (scheduleId: string) => void;
}

export function ScheduleList({ 
  schedules, 
  canEdit, 
  canSendToFaculty,
  onView, 
  onEdit,
  onSendToFaculty 
}: ScheduleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    const variants = {
      draft: 'secondary',
      pending_approval: 'default',
      approved: 'default',
      rejected: 'destructive',
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Draft',
      pending_approval: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleSendToFaculty = (schedule: Schedule) => {
    if (schedule.conflicts.length > 0) {
      toast.error('Cannot send schedule with conflicts to faculty');
      return;
    }
    if (!schedule.isLocked) {
      toast.error('Schedule must be locked (approved) before sending to faculty');
      return;
    }
    onSendToFaculty(schedule.id);
    toast.success('Schedule sent to faculty successfully');
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesSemester = semesterFilter === 'all' || schedule.semester === semesterFilter;
    
    return matchesSearch && matchesStatus && matchesSemester;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">All Schedules</h2>
          <p className="text-sm text-muted-foreground">Manage and view all class schedules</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="First Semester">First Semester</SelectItem>
                <SelectItem value="Second Semester">Second Semester</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-foreground mb-2">No Schedules Found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSchedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      {schedule.name}
                      <Badge variant={getStatusColor(schedule.status)}>
                        {getStatusLabel(schedule.status)}
                      </Badge>
                      {schedule.sentToFaculty && (
                        <Badge variant="outline" className="text-xs">
                          Sent to Faculty
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {schedule.program} • {schedule.academicYear} - {schedule.semester}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created by {schedule.createdByName} on {formatDate(schedule.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
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
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="text-foreground">{formatDate(schedule.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Approval Status */}
                  {schedule.approvals.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Approvals:</span>
                      {schedule.approvals.map((approval) => (
                        <Badge key={approval.id} variant="outline" className="text-xs">
                          {approval.approverRole === 'program_head' ? 'Head' : 'Admin'}: {approval.status}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onView(schedule.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    {canEdit && !schedule.isLocked && (
                      <Button variant="outline" size="sm" onClick={() => onEdit(schedule.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}

                    {canSendToFaculty && schedule.isLocked && !schedule.sentToFaculty && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleSendToFaculty(schedule)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Faculty
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredSchedules.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredSchedules.length} of {schedules.length} schedules
        </div>
      )}
    </div>
  );
}
