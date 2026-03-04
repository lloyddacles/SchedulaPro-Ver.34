import { Schedule, ScheduleItem, DayOfWeek } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, Printer, Calendar } from 'lucide-react';
import { daysOfWeek, timeSlots } from '../data/mockData';

interface FacultyScheduleViewProps {
  schedules: Schedule[];
  facultyName: string;
}

export function FacultyScheduleView({ schedules, facultyName }: FacultyScheduleViewProps) {
  // Get all approved schedules
  const approvedSchedules = schedules.filter(s => s.status === 'approved');
  
  // Get all schedule items for this faculty (mock - in real app would filter by faculty ID)
  const allItems: ScheduleItem[] = approvedSchedules.flatMap(s => s.items);

  const getItemAtSlot = (day: DayOfWeek, time: string): ScheduleItem | null => {
    return allItems.find(item => {
      if (item.day !== day) return false;
      const itemStartHour = parseInt(item.startTime.split(':')[0]);
      const itemEndHour = parseInt(item.endTime.split(':')[0]);
      const slotHour = parseInt(time.split(':')[0]);
      return slotHour >= itemStartHour && slotHour < itemEndHour;
    }) || null;
  };

  const shouldShowCell = (day: DayOfWeek, time: string): boolean => {
    const item = getItemAtSlot(day, time);
    if (!item) return true;
    return item.startTime === time;
  };

  const getRowSpan = (item: ScheduleItem): number => {
    const start = parseInt(item.startTime.split(':')[0]);
    const end = parseInt(item.endTime.split(':')[0]);
    return end - start;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Mock download functionality
    alert('Schedule download feature - would generate PDF in production');
  };

  const calculateTotalHours = () => {
    const uniqueClasses = new Set(allItems.map(item => item.id));
    let totalHours = 0;
    uniqueClasses.forEach(id => {
      const item = allItems.find(i => i.id === id);
      if (item) {
        const start = parseInt(item.startTime.split(':')[0]);
        const end = parseInt(item.endTime.split(':')[0]);
        totalHours += (end - start);
      }
    });
    return totalHours;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-foreground">My Teaching Schedule</h2>
          <p className="text-sm text-muted-foreground">{facultyName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{new Set(allItems.map(i => i.courseId)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Teaching Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{calculateTotalHours()} hrs</div>
            <p className="text-xs text-muted-foreground mt-1">Per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{new Set(allItems.map(i => i.sectionId)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sections</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Grid */}
      {approvedSchedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-foreground mb-2">No Approved Schedule Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your teaching schedule will appear here once approved by administration
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
            <CardDescription>
              {approvedSchedules[0]?.academicYear} - {approvedSchedules[0]?.semester}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border bg-muted p-2 text-left min-w-[100px]">
                      Time
                    </th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="border border-border bg-muted p-2 text-left min-w-[150px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.slice(0, -1).map(({ time, label }) => (
                    <tr key={time}>
                      <td className="border border-border bg-muted p-2 text-sm">
                        {label}
                      </td>
                      {daysOfWeek.map(day => {
                        const item = getItemAtSlot(day, time);
                        const shouldShow = shouldShowCell(day, time);
                        
                        if (!shouldShow) return null;
                        
                        const rowSpan = item ? getRowSpan(item) : 1;
                        
                        return (
                          <td 
                            key={`${day}-${time}`} 
                            className="border border-border p-2"
                            rowSpan={rowSpan}
                          >
                            {item ? (
                              <div className="bg-primary/10 border-l-4 border-primary p-3 rounded">
                                <h4 className="text-primary mb-1">{item.courseCode}</h4>
                                <p className="text-sm text-foreground mb-1">{item.courseName}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {item.sectionName}
                                  </Badge>
                                  <span>•</span>
                                  <span>{item.roomCode}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.startTime} - {item.endTime}
                                </p>
                              </div>
                            ) : (
                              <div className="h-full min-h-[60px] flex items-center justify-center text-xs text-muted-foreground">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Details List */}
      {allItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>Complete information for all assigned classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(allItems.map(i => i.courseId))).map(courseId => {
                const courseItems = allItems.filter(i => i.courseId === courseId);
                const firstItem = courseItems[0];
                
                return (
                  <div key={courseId} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-foreground">{firstItem.courseName}</h4>
                        <p className="text-sm text-muted-foreground">{firstItem.courseCode}</p>
                      </div>
                      <Badge variant="outline">{firstItem.sectionName}</Badge>
                    </div>
                    <div className="space-y-2">
                      {courseItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="w-24">{item.day}</span>
                          <span className="w-32">{item.startTime} - {item.endTime}</span>
                          <span className="flex-1">{item.roomCode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
