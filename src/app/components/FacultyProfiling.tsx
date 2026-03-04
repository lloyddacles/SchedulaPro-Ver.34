import { useState } from 'react';
import { Faculty, FacultyProfile, Course, Room, DayOfWeek } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import {
  User, Star, Clock, Calendar, BookOpen, MapPin, Settings,
  Save, X, Edit, Plus, Trash2, Award, Brain, UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';

interface FacultyProfilingProps {
  faculty: Faculty[];
  courses: Course[];
  rooms: Room[];
  onUpdateFaculty: (updatedFaculty: Faculty[]) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export function FacultyProfiling({
  faculty,
  courses,
  rooms,
  onUpdateFaculty
}: FacultyProfilingProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProfile, setEditingProfile] = useState<FacultyProfile | null>(null);

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProfile = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember);
    setEditingProfile(facultyMember.profile || createDefaultProfile());
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!selectedFaculty || !editingProfile) return;

    const updatedFaculty = faculty.map(f =>
      f.id === selectedFaculty.id
        ? { ...f, profile: { ...editingProfile, lastUpdated: new Date() } }
        : f
    );

    onUpdateFaculty(updatedFaculty);
    toast.success(`Profile updated for ${selectedFaculty.name}`);
    setIsEditing(false);
    setSelectedFaculty(null);
    setEditingProfile(null);
  };

  const createDefaultProfile = (): FacultyProfile => ({
    preferredCourses: [],
    expertise: [],
    preferredDays: [],
    preferredTimeSlots: [],
    unavailableSlots: [],
    preferredMinHours: 6,
    preferredMaxHours: 18,
    maxConsecutiveHours: 4,
    preferredDaysPerWeek: 3,
    noBackToBack: false,
    maxDailyHours: 6,
    minBreakBetweenClasses: 15,
    preferredRoomTypes: [],
    preferMorning: false,
    preferAfternoon: false,
    preferSpecificBuildings: [],
    avoidSpecificRooms: [],
    preferredCoTeachers: [],
    avoidCoTeachers: [],
    hasAdministrativeLoad: false,
    hasResearchLoad: false,
  });

  const getProfileCompleteness = (profile?: FacultyProfile): number => {
    if (!profile) return 0;
    
    let score = 0;
    const weights = {
      preferredCourses: 15,
      expertise: 15,
      preferredDays: 10,
      preferredTimeSlots: 10,
      unavailableSlots: 10,
      workloadPrefs: 15,
      teachingConstraints: 15,
      specialConstraints: 10
    };

    if (profile.preferredCourses.length > 0) score += weights.preferredCourses;
    if (profile.expertise.length > 0) score += weights.expertise;
    if (profile.preferredDays.length > 0) score += weights.preferredDays;
    if (profile.preferredTimeSlots.length > 0) score += weights.preferredTimeSlots;
    if (profile.unavailableSlots.length > 0) score += weights.unavailableSlots;
    if (profile.preferredMinHours > 0 || profile.preferredMaxHours > 0) score += weights.workloadPrefs;
    if (profile.maxDailyHours > 0 || profile.minBreakBetweenClasses > 0) score += weights.teachingConstraints;
    if (profile.hasAdministrativeLoad || profile.hasResearchLoad) score += weights.specialConstraints;

    return score;
  };

  const getCompletenessColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <UserCog className="w-8 h-8" />
            Faculty Profiling
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage detailed faculty profiles for AI-optimized scheduling
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          AI-Enhanced
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <Input
            placeholder="Search faculty by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Faculty List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((facultyMember) => {
          const completeness = getProfileCompleteness(facultyMember.profile);
          return (
            <Card key={facultyMember.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{facultyMember.name}</CardTitle>
                      <CardDescription className="text-sm">{facultyMember.email}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{facultyMember.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Load:</span>
                    <span className="font-medium">{facultyMember.maxLoad} hrs/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specializations:</span>
                    <span className="font-medium">{facultyMember.specialization.length}</span>
                  </div>
                </div>

                {/* Profile Completeness */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Profile Completeness</span>
                    <span className={`text-xs font-bold ${getCompletenessColor(completeness)}`}>
                      {completeness}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        completeness >= 80 ? 'bg-green-500' :
                        completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleEditProfile(facultyMember)}
                  className="w-full mt-3"
                  variant={completeness < 50 ? "default" : "outline"}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {completeness === 0 ? 'Create Profile' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {isEditing && selectedFaculty && editingProfile && (
        <FacultyProfileEditor
          faculty={selectedFaculty}
          profile={editingProfile}
          courses={courses}
          rooms={rooms}
          allFaculty={faculty}
          onSave={handleSaveProfile}
          onCancel={() => {
            setIsEditing(false);
            setSelectedFaculty(null);
            setEditingProfile(null);
          }}
          onChange={setEditingProfile}
        />
      )}
    </div>
  );
}

interface FacultyProfileEditorProps {
  faculty: Faculty;
  profile: FacultyProfile;
  courses: Course[];
  rooms: Room[];
  allFaculty: Faculty[];
  onSave: () => void;
  onCancel: () => void;
  onChange: (profile: FacultyProfile) => void;
}

function FacultyProfileEditor({
  faculty,
  profile,
  courses,
  rooms,
  allFaculty,
  onSave,
  onCancel,
  onChange
}: FacultyProfileEditorProps) {
  const buildings = [...new Set(rooms.map(r => r.building))];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Edit Profile: {faculty.name}
          </DialogTitle>
          <DialogDescription>
            Configure preferences for AI-optimized schedule generation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="workload">Workload</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Preferences
                  </CardTitle>
                  <CardDescription>
                    Select courses and rate your preference (0-10)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.map((course) => {
                    const pref = profile.preferredCourses.find(p => p.courseId === course.id);
                    return (
                      <div key={course.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{course.code}</div>
                          <div className="text-sm text-muted-foreground">{course.name}</div>
                        </div>
                        <div className="w-48">
                          <Slider
                            value={[pref?.weight || 0]}
                            max={10}
                            step={1}
                            onValueChange={(val) => {
                              const newPrefs = profile.preferredCourses.filter(p => p.courseId !== course.id);
                              if (val[0] > 0) {
                                newPrefs.push({ courseId: course.id, weight: val[0] });
                              }
                              onChange({ ...profile, preferredCourses: newPrefs });
                            }}
                          />
                        </div>
                        <div className="w-12 text-right font-bold">
                          {pref?.weight || 0}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Expertise Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.expertise.map((exp, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={exp.subject}
                          onChange={(e) => {
                            const newExp = [...profile.expertise];
                            newExp[idx].subject = e.target.value;
                            onChange({ ...profile, expertise: newExp });
                          }}
                          placeholder="Subject area"
                          className="flex-1"
                        />
                        <Slider
                          value={[exp.level]}
                          max={5}
                          step={1}
                          className="w-32"
                          onValueChange={(val) => {
                            const newExp = [...profile.expertise];
                            newExp[idx].level = val[0];
                            onChange({ ...profile, expertise: newExp });
                          }}
                        />
                        <span className="w-8 text-center">{exp.level}/5</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onChange({
                              ...profile,
                              expertise: profile.expertise.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        onChange({
                          ...profile,
                          expertise: [...profile.expertise, { subject: '', level: 3 }]
                        });
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expertise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Time Tab */}
            <TabsContent value="time" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Preferred Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Switch
                          checked={profile.preferredDays.includes(day)}
                          onCheckedChange={(checked) => {
                            const newDays = checked
                              ? [...profile.preferredDays, day]
                              : profile.preferredDays.filter(d => d !== day);
                            onChange({ ...profile, preferredDays: newDays });
                          }}
                        />
                        <Label>{day}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={profile.preferMorning}
                        onCheckedChange={(checked) =>
                          onChange({ ...profile, preferMorning: checked })
                        }
                      />
                      <Label>Prefer Morning Classes (7:00 AM - 12:00 PM)</Label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={profile.preferAfternoon}
                        onCheckedChange={(checked) =>
                          onChange({ ...profile, preferAfternoon: checked })
                        }
                      />
                      <Label>Prefer Afternoon Classes (1:00 PM - 6:00 PM)</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unavailable Time Slots</CardTitle>
                  <CardDescription>Mark times when faculty is not available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {profile.unavailableSlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                        <span className="font-medium w-24">{slot.day}</span>
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            onChange({
                              ...profile,
                              unavailableSlots: profile.unavailableSlots.filter((_, i) => i !== idx)
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      onChange({
                        ...profile,
                        unavailableSlots: [
                          ...profile.unavailableSlots,
                          { day: 'Monday', startTime: '09:00', endTime: '10:00' }
                        ]
                      });
                    }}
                    variant="outline"
                    className="w-full mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unavailable Slot
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workload Tab */}
            <TabsContent value="workload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Load Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Preferred Minimum Hours per Week: {profile.preferredMinHours}</Label>
                    <Slider
                      value={[profile.preferredMinHours]}
                      max={30}
                      step={1}
                      onValueChange={(val) =>
                        onChange({ ...profile, preferredMinHours: val[0] })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Maximum Hours per Week: {profile.preferredMaxHours}</Label>
                    <Slider
                      value={[profile.preferredMaxHours]}
                      max={40}
                      step={1}
                      onValueChange={(val) =>
                        onChange({ ...profile, preferredMaxHours: val[0] })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Days per Week: {profile.preferredDaysPerWeek}</Label>
                    <Slider
                      value={[profile.preferredDaysPerWeek]}
                      max={6}
                      step={1}
                      onValueChange={(val) =>
                        onChange({ ...profile, preferredDaysPerWeek: val[0] })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Loads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Administrative Load</Label>
                      <p className="text-sm text-muted-foreground">
                        Faculty has administrative responsibilities
                      </p>
                    </div>
                    <Switch
                      checked={profile.hasAdministrativeLoad}
                      onCheckedChange={(checked) =>
                        onChange({ ...profile, hasAdministrativeLoad: checked })
                      }
                    />
                  </div>
                  {profile.hasAdministrativeLoad && (
                    <div className="space-y-2">
                      <Label>Administrative Hours per Week</Label>
                      <Input
                        type="number"
                        value={profile.administrativeHours || 0}
                        onChange={(e) =>
                          onChange({
                            ...profile,
                            administrativeHours: parseInt(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Research Load</Label>
                      <p className="text-sm text-muted-foreground">
                        Faculty has research commitments
                      </p>
                    </div>
                    <Switch
                      checked={profile.hasResearchLoad}
                      onCheckedChange={(checked) =>
                        onChange({ ...profile, hasResearchLoad: checked })
                      }
                    />
                  </div>
                  {profile.hasResearchLoad && (
                    <div className="space-y-2">
                      <Label>Research Hours per Week</Label>
                      <Input
                        type="number"
                        value={profile.researchHours || 0}
                        onChange={(e) =>
                          onChange({
                            ...profile,
                            researchHours: parseInt(e.target.value) || 0
                          })
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Constraints Tab */}
            <TabsContent value="constraints" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Teaching Constraints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label>Avoid Back-to-Back Classes</Label>
                    <Switch
                      checked={profile.noBackToBack}
                      onCheckedChange={(checked) =>
                        onChange({ ...profile, noBackToBack: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Daily Hours: {profile.maxDailyHours}</Label>
                    <Slider
                      value={[profile.maxDailyHours]}
                      max={12}
                      step={1}
                      onValueChange={(val) =>
                        onChange({ ...profile, maxDailyHours: val[0] })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Consecutive Hours: {profile.maxConsecutiveHours}</Label>
                    <Slider
                      value={[profile.maxConsecutiveHours]}
                      max={8}
                      step={1}
                      onValueChange={(val) =>
                        onChange({ ...profile, maxConsecutiveHours: val[0] })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Break Between Classes (minutes): {profile.minBreakBetweenClasses}</Label>
                    <Slider
                      value={[profile.minBreakBetweenClasses]}
                      max={120}
                      step={15}
                      onValueChange={(val) =>
                        onChange({ ...profile, minBreakBetweenClasses: val[0] })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Room & Location Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Room Types</Label>
                    <div className="space-y-2">
                      {(['lecture', 'laboratory', 'hybrid'] as const).map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Switch
                            checked={profile.preferredRoomTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              const newTypes = checked
                                ? [...profile.preferredRoomTypes, type]
                                : profile.preferredRoomTypes.filter(t => t !== type);
                              onChange({ ...profile, preferredRoomTypes: newTypes });
                            }}
                          />
                          <Label className="capitalize">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Buildings</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {buildings.map((building) => (
                        <div key={building} className="flex items-center space-x-2">
                          <Switch
                            checked={profile.preferSpecificBuildings.includes(building)}
                            onCheckedChange={(checked) => {
                              const newBuildings = checked
                                ? [...profile.preferSpecificBuildings, building]
                                : profile.preferSpecificBuildings.filter(b => b !== building);
                              onChange({ ...profile, preferSpecificBuildings: newBuildings });
                            }}
                          />
                          <Label>{building}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                  <CardDescription>
                    Any special considerations for scheduling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={profile.additionalNotes || ''}
                    onChange={(e) =>
                      onChange({ ...profile, additionalNotes: e.target.value })
                    }
                    placeholder="Enter any special scheduling requirements or notes..."
                    rows={6}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Courses:</span>
                    <span className="font-medium">{profile.preferredCourses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expertise Areas:</span>
                    <span className="font-medium">{profile.expertise.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Days:</span>
                    <span className="font-medium">{profile.preferredDays.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unavailable Slots:</span>
                    <span className="font-medium">{profile.unavailableSlots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workload Range:</span>
                    <span className="font-medium">
                      {profile.preferredMinHours} - {profile.preferredMaxHours} hrs/week
                    </span>
                  </div>
                  {profile.hasAdministrativeLoad && (
                    <div className="flex justify-between text-orange-600">
                      <span>Administrative Load:</span>
                      <span className="font-medium">{profile.administrativeHours || 0} hrs/week</span>
                    </div>
                  )}
                  {profile.hasResearchLoad && (
                    <div className="flex justify-between text-blue-600">
                      <span>Research Load:</span>
                      <span className="font-medium">{profile.researchHours || 0} hrs/week</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 px-6 pb-6">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}