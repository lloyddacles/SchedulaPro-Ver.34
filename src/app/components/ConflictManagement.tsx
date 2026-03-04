import { useState } from 'react';
import { Schedule, ScheduleItem, Conflict } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertTriangle, CircleCheck, Clock, Eye, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface ConflictManagementProps {
  schedules: Schedule[];
  onResolveConflict: (conflictId: string, resolution: string) => void;
  onViewSchedule: (scheduleId: string) => void;
}

export function ConflictManagement({ 
  schedules, 
  onResolveConflict,
  onViewSchedule 
}: ConflictManagementProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Detect all conflicts across all schedules
  const detectConflicts = (): Conflict[] => {
    const allConflicts: Conflict[] = [];
    
    schedules.forEach(schedule => {
      // Room conflicts
      schedule.items.forEach((item1, i) => {
        schedule.items.slice(i + 1).forEach(item2 => {
          if (item1.day === item2.day && item1.roomId === item2.roomId) {
            const start1 = parseInt(item1.startTime.split(':')[0]);
            const end1 = parseInt(item1.endTime.split(':')[0]);
            const start2 = parseInt(item2.startTime.split(':')[0]);
            const end2 = parseInt(item2.endTime.split(':')[0]);
            
            if ((start1 < end2 && end1 > start2)) {
              allConflicts.push({
                id: `conf-room-${item1.id}-${item2.id}`,
                type: 'room_conflict',
                severity: 'high',
                message: `Room ${item1.roomCode} is double-booked on ${item1.day} from ${item1.startTime} to ${item2.endTime}`,
                affectedItems: [item1.id, item2.id],
                suggestion: `Consider using an alternative room or rescheduling one of the classes`,
              });
            }
          }
        });
      });

      // Faculty conflicts
      schedule.items.forEach((item1, i) => {
        schedule.items.slice(i + 1).forEach(item2 => {
          if (item1.day === item2.day && item1.facultyId === item2.facultyId) {
            const start1 = parseInt(item1.startTime.split(':')[0]);
            const end1 = parseInt(item1.endTime.split(':')[0]);
            const start2 = parseInt(item2.startTime.split(':')[0]);
            const end2 = parseInt(item2.endTime.split(':')[0]);
            
            if ((start1 < end2 && end1 > start2)) {
              allConflicts.push({
                id: `conf-faculty-${item1.id}-${item2.id}`,
                type: 'faculty_overlap',
                severity: 'high',
                message: `${item1.facultyName} has overlapping classes on ${item1.day} from ${item1.startTime} to ${item2.endTime}`,
                affectedItems: [item1.id, item2.id],
                suggestion: `Assign a different instructor or adjust the schedule`,
              });
            }
          }
        });
      });

      // Section conflicts
      schedule.items.forEach((item1, i) => {
        schedule.items.slice(i + 1).forEach(item2 => {
          if (item1.day === item2.day && item1.sectionId === item2.sectionId) {
            const start1 = parseInt(item1.startTime.split(':')[0]);
            const end1 = parseInt(item1.endTime.split(':')[0]);
            const start2 = parseInt(item2.startTime.split(':')[0]);
            const end2 = parseInt(item2.endTime.split(':')[0]);
            
            if ((start1 < end2 && end1 > start2)) {
              allConflicts.push({
                id: `conf-section-${item1.id}-${item2.id}`,
                type: 'section_clash',
                severity: 'medium',
                message: `Section ${item1.sectionName} has overlapping classes on ${item1.day} from ${item1.startTime} to ${item2.endTime}`,
                affectedItems: [item1.id, item2.id],
                suggestion: `Reschedule one of the classes to a different time slot`,
              });
            }
          }
        });
      });
    });

    return allConflicts;
  };

  const allConflicts = detectConflicts();
  
  const filteredConflicts = allConflicts.filter(conflict => {
    if (severityFilter !== 'all' && conflict.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CircleCheck className="w-5 h-5 text-blue-500" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'room_conflict': return 'Room Conflict';
      case 'faculty_overlap': return 'Faculty Overlap';
      case 'section_clash': return 'Section Clash';
      default: return type;
    }
  };

  const handleResolve = (conflictId: string) => {
    onResolveConflict(conflictId, 'Manual resolution');
    toast.success('Conflict marked as resolved');
  };

  const conflictsByType = {
    room: filteredConflicts.filter(c => c.type === 'room_conflict'),
    faculty: filteredConflicts.filter(c => c.type === 'faculty_overlap'),
    section: filteredConflicts.filter(c => c.type === 'section_clash'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">Conflict Management</h2>
          <p className="text-sm text-muted-foreground">Detect and resolve scheduling conflicts</p>
        </div>
        <div className="flex gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{allConflicts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Room Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{conflictsByType.room.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Faculty Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{conflictsByType.faculty.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Section Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{conflictsByType.section.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conflicts Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Conflicts ({filteredConflicts.length})
          </TabsTrigger>
          <TabsTrigger value="room">
            Room ({conflictsByType.room.length})
          </TabsTrigger>
          <TabsTrigger value="faculty">
            Faculty ({conflictsByType.faculty.length})
          </TabsTrigger>
          <TabsTrigger value="section">
            Section ({conflictsByType.section.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredConflicts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CircleCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-foreground mb-2">No Conflicts Detected</h3>
                <p className="text-sm text-muted-foreground">
                  All schedules are conflict-free
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredConflicts.map((conflict) => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(conflict.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base">{getConflictTypeLabel(conflict.type)}</CardTitle>
                            <Badge variant="outline" className={`text-xs ${getSeverityColor(conflict.severity)} text-white`}>
                              {conflict.severity}
                            </Badge>
                          </div>
                          <CardDescription>{conflict.message}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conflict.suggestion && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                        <Lightbulb className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">Suggestion</p>
                          <p className="text-sm text-muted-foreground">{conflict.suggestion}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResolve(conflict.id)}
                      >
                        <CircleCheck className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="room" className="space-y-4">
          {conflictsByType.room.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CircleCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-foreground mb-2">No Room Conflicts</h3>
                <p className="text-sm text-muted-foreground">
                  All rooms are properly scheduled
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conflictsByType.room.map((conflict) => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(conflict.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">{getConflictTypeLabel(conflict.type)}</CardTitle>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(conflict.severity)} text-white`}>
                            {conflict.severity}
                          </Badge>
                        </div>
                        <CardDescription>{conflict.message}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {conflict.suggestion && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mb-4">
                        <Lightbulb className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">Suggestion</p>
                          <p className="text-sm text-muted-foreground">{conflict.suggestion}</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResolve(conflict.id)}
                    >
                      <CircleCheck className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="faculty" className="space-y-4">
          {conflictsByType.faculty.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CircleCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-foreground mb-2">No Faculty Conflicts</h3>
                <p className="text-sm text-muted-foreground">
                  All faculty schedules are conflict-free
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conflictsByType.faculty.map((conflict) => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(conflict.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">{getConflictTypeLabel(conflict.type)}</CardTitle>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(conflict.severity)} text-white`}>
                            {conflict.severity}
                          </Badge>
                        </div>
                        <CardDescription>{conflict.message}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {conflict.suggestion && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mb-4">
                        <Lightbulb className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">Suggestion</p>
                          <p className="text-sm text-muted-foreground">{conflict.suggestion}</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResolve(conflict.id)}
                    >
                      <CircleCheck className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="section" className="space-y-4">
          {conflictsByType.section.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CircleCheck className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-foreground mb-2">No Section Conflicts</h3>
                <p className="text-sm text-muted-foreground">
                  All section schedules are properly arranged
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {conflictsByType.section.map((conflict) => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(conflict.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-base">{getConflictTypeLabel(conflict.type)}</CardTitle>
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(conflict.severity)} text-white`}>
                            {conflict.severity}
                          </Badge>
                        </div>
                        <CardDescription>{conflict.message}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {conflict.suggestion && (
                      <div className="flex items-start gap-2 p-3 bg-muted rounded-lg mb-4">
                        <Lightbulb className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground mb-1">Suggestion</p>
                          <p className="text-sm text-muted-foreground">{conflict.suggestion}</p>
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResolve(conflict.id)}
                    >
                      <CircleCheck className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
