import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertTriangle, Plus, Save, Send, Trash2 } from 'lucide-react';
import type { ScheduleItem, Course, Faculty, Room, Section, DayOfWeek } from '../types';
import { daysOfWeek, timeSlots } from '../data/mockData';

interface ScheduleBuilderProps {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  sections: Section[];
  onSave: (items: ScheduleItem[]) => void;
  onSubmitForApproval: (items: ScheduleItem[]) => void;
}

interface TimeSlotCellProps {
  day: DayOfWeek;
  time: string;
  item: ScheduleItem | null;
  onDrop: (day: DayOfWeek, time: string) => void;
  onRemove: (itemId: string) => void;
}

const ItemTypes = {
  CLASS: 'class',
};

function TimeSlotCell({ day, time, item, onDrop, onRemove }: TimeSlotCellProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CLASS,
    drop: () => onDrop(day, time),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CLASS,
    item: item,
    canDrag: () => !!item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`min-h-[80px] border border-border rounded p-2 transition-colors ${
        isOver ? 'bg-accent' : 'bg-card'
      } ${isDragging ? 'opacity-50' : ''} ${item ? 'cursor-move' : ''}`}
    >
      {item ? (
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary truncate">{item.courseCode}</p>
              <p className="text-xs text-muted-foreground truncate">{item.facultyName}</p>
              <p className="text-xs text-muted-foreground truncate">{item.roomCode}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="text-destructive hover:text-destructive/80 shrink-0"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
          Drop here
        </div>
      )}
    </div>
  );
}

export function ScheduleBuilder({ 
  courses, 
  faculty, 
  rooms, 
  sections,
  onSave,
  onSubmitForApproval 
}: ScheduleBuilderProps) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  // Form state for adding new class
  const [newClass, setNewClass] = useState({
    courseId: '',
    facultyId: '',
    sectionId: '',
    roomId: '',
    day: '' as DayOfWeek | '',
    startTime: '',
    duration: 2, // hours
  });

  const getEndTime = (startTime: string, duration: number): string => {
    const [hours] = startTime.split(':').map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, '0')}:00`;
  };

  const handleAddClass = () => {
    if (!newClass.courseId || !newClass.facultyId || !newClass.sectionId || 
        !newClass.roomId || !newClass.day || !newClass.startTime) {
      return;
    }

    const course = courses.find(c => c.id === newClass.courseId);
    const facultyMember = faculty.find(f => f.id === newClass.facultyId);
    const room = rooms.find(r => r.id === newClass.roomId);
    const section = sections.find(s => s.id === newClass.sectionId);

    if (!course || !facultyMember || !room || !section) return;

    const newItem: ScheduleItem = {
      id: `item-${Date.now()}`,
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      facultyId: facultyMember.id,
      facultyName: facultyMember.name,
      sectionId: section.id,
      sectionName: section.code,
      roomId: room.id,
      roomCode: room.code,
      day: newClass.day as DayOfWeek,
      startTime: newClass.startTime,
      endTime: getEndTime(newClass.startTime, newClass.duration),
      scheduleId: 'new-schedule',
    };

    setScheduleItems([...scheduleItems, newItem]);
    setIsAddDialogOpen(false);
    
    // Reset form
    setNewClass({
      courseId: '',
      facultyId: '',
      sectionId: '',
      roomId: '',
      day: '',
      startTime: '',
      duration: 2,
    });

    // Check for conflicts
    detectConflicts([...scheduleItems, newItem]);
  };

  const detectConflicts = (items: ScheduleItem[]) => {
    const conflictMessages: string[] = [];
    
    // Check for room conflicts
    items.forEach((item1, i) => {
      items.slice(i + 1).forEach(item2 => {
        if (item1.day === item2.day && item1.roomId === item2.roomId) {
          const start1 = parseInt(item1.startTime.split(':')[0]);
          const end1 = parseInt(item1.endTime.split(':')[0]);
          const start2 = parseInt(item2.startTime.split(':')[0]);
          const end2 = parseInt(item2.endTime.split(':')[0]);
          
          if ((start1 < end2 && end1 > start2)) {
            conflictMessages.push(
              `Room conflict: ${item1.roomCode} on ${item1.day} at ${item1.startTime}`
            );
          }
        }
      });
    });

    // Check for faculty conflicts
    items.forEach((item1, i) => {
      items.slice(i + 1).forEach(item2 => {
        if (item1.day === item2.day && item1.facultyId === item2.facultyId) {
          const start1 = parseInt(item1.startTime.split(':')[0]);
          const end1 = parseInt(item1.endTime.split(':')[0]);
          const start2 = parseInt(item2.startTime.split(':')[0]);
          const end2 = parseInt(item2.endTime.split(':')[0]);
          
          if ((start1 < end2 && end1 > start2)) {
            conflictMessages.push(
              `Faculty conflict: ${item1.facultyName} on ${item1.day} at ${item1.startTime}`
            );
          }
        }
      });
    });

    setConflicts(conflictMessages);
  };

  const handleDrop = (day: DayOfWeek, time: string) => {
    // This is called when an existing item is dropped on a new slot
    // For now, we'll just handle adding through the dialog
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = scheduleItems.filter(item => item.id !== itemId);
    setScheduleItems(updatedItems);
    detectConflicts(updatedItems);
  };

  const getItemAtSlot = (day: DayOfWeek, time: string): ScheduleItem | null => {
    return scheduleItems.find(item => {
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground">Create Class Schedule</h2>
            <p className="text-sm text-muted-foreground">Drag and drop to arrange classes or use the add button</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onSave(scheduleItems)}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
            <Button 
              variant="default" 
              onClick={() => onSubmitForApproval(scheduleItems)}
              disabled={scheduleItems.length === 0 || conflicts.length > 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Schedule Conflicts Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {conflicts.map((conflict, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">• {conflict}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Timetable Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
            <CardDescription>6:00 AM - 10:00 PM Schedule Grid</CardDescription>
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
                            className="border border-border p-1"
                            rowSpan={rowSpan}
                          >
                            <TimeSlotCell
                              day={day}
                              time={time}
                              item={item}
                              onDrop={handleDrop}
                              onRemove={handleRemoveItem}
                            />
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

        {/* Add Class Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Class to Schedule</DialogTitle>
              <DialogDescription>Fill in the details to add a new class</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Course</Label>
                <Select value={newClass.courseId} onValueChange={(value) => setNewClass({...newClass, courseId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Section</Label>
                <Select value={newClass.sectionId} onValueChange={(value) => setNewClass({...newClass, sectionId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.code} ({section.studentCount} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Faculty</Label>
                <Select value={newClass.facultyId} onValueChange={(value) => setNewClass({...newClass, facultyId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} - {f.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Room</Label>
                <Select value={newClass.roomId} onValueChange={(value) => setNewClass({...newClass, roomId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.code} - {room.name} (Cap: {room.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Day</Label>
                  <Select value={newClass.day} onValueChange={(value) => setNewClass({...newClass, day: value as DayOfWeek})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Start Time</Label>
                  <Select value={newClass.startTime} onValueChange={(value) => setNewClass({...newClass, startTime: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.slice(0, -2).map(({ time, label }) => (
                        <SelectItem key={time} value={time}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Duration (hours)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="6" 
                  value={newClass.duration}
                  onChange={(e) => setNewClass({...newClass, duration: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClass}>
                Add Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
