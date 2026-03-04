import { useState } from 'react';
import { Faculty, Schedule } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Plus, Edit, Trash2, Search, Mail, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface FacultyManagementProps {
  faculty: Faculty[];
  schedules: Schedule[];
  onAddFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  onEditFaculty: (id: string, faculty: Partial<Faculty>) => void;
  onDeleteFaculty: (id: string) => void;
}

export function FacultyManagement({ 
  faculty, 
  schedules,
  onAddFaculty, 
  onEditFaculty,
  onDeleteFaculty 
}: FacultyManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    maxLoad: 24,
    specialization: [] as string[],
  });

  const departments = Array.from(new Set(faculty.map(f => f.department)));

  const filteredFaculty = faculty.filter(f => {
    if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !f.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (departmentFilter !== 'all' && f.department !== departmentFilter) {
      return false;
    }
    return true;
  });

  const calculateFacultyLoad = (facultyId: string): number => {
    let totalHours = 0;
    schedules.forEach(schedule => {
      if (schedule.status === 'approved') {
        schedule.items.forEach(item => {
          if (item.facultyId === facultyId) {
            const start = parseInt(item.startTime.split(':')[0]);
            const end = parseInt(item.endTime.split(':')[0]);
            totalHours += (end - start);
          }
        });
      }
    });
    return totalHours;
  };

  const getFacultyClassCount = (facultyId: string): number => {
    let count = 0;
    schedules.forEach(schedule => {
      if (schedule.status === 'approved') {
        schedule.items.forEach(item => {
          if (item.facultyId === facultyId) {
            count++;
          }
        });
      }
    });
    return count;
  };

  const getLoadPercentage = (facultyId: string, maxLoad: number): number => {
    const currentLoad = calculateFacultyLoad(facultyId);
    return Math.round((currentLoad / maxLoad) * 100);
  };

  const getLoadColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      maxLoad: 24,
      specialization: [],
    });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (f: Faculty) => {
    setSelectedFaculty(f);
    setFormData({
      name: f.name,
      email: f.email,
      department: f.department,
      maxLoad: f.maxLoad,
      specialization: f.specialization,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddFaculty = () => {
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAddFaculty(formData);
    toast.success('Faculty member added successfully');
    setIsAddDialogOpen(false);
  };

  const handleEditFaculty = () => {
    if (!selectedFaculty) return;
    
    if (!formData.name || !formData.email || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    onEditFaculty(selectedFaculty.id, formData);
    toast.success('Faculty member updated successfully');
    setIsEditDialogOpen(false);
  };

  const handleDeleteFaculty = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      onDeleteFaculty(id);
      toast.success('Faculty member deleted successfully');
    }
  };

  const FacultyCard = ({ f }: { f: Faculty }) => {
    const currentLoad = calculateFacultyLoad(f.id);
    const loadPercentage = getLoadPercentage(f.id, f.maxLoad);
    const classCount = getFacultyClassCount(f.id);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{f.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="w-3 h-3" />
                {f.email}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                {f.department}
              </p>
            </div>
            <Badge variant={loadPercentage >= 90 ? 'destructive' : 'secondary'}>
              {loadPercentage}% Load
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Load</p>
              <p className={`text-sm ${getLoadColor(loadPercentage)}`}>
                {currentLoad} / {f.maxLoad} hrs
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Classes</p>
              <p className="text-sm text-foreground">{classCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Specialization</p>
              <p className="text-sm text-foreground">{f.specialization.length}</p>
            </div>
          </div>

          {/* Specializations */}
          {f.specialization.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Areas of Expertise</p>
              <div className="flex flex-wrap gap-1">
                {f.specialization.map((spec, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Load Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Weekly Load</p>
              <p className="text-xs text-muted-foreground">{loadPercentage}%</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  loadPercentage >= 90 ? 'bg-red-500' :
                  loadPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(loadPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOpenEditDialog(f)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteFaculty(f.id, f.name)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Faculty Management</h2>
          <p className="text-sm text-muted-foreground">Manage faculty information and teaching assignments</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{faculty.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{departments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(faculty.reduce((sum, f) => sum + getLoadPercentage(f.id, f.maxLoad), 0) / faculty.length || 0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Overloaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {faculty.filter(f => getLoadPercentage(f.id, f.maxLoad) >= 90).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Faculty List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map(f => (
          <FacultyCard key={f.id} f={f} />
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-foreground mb-2">No Faculty Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || departmentFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Add faculty members to get started'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Faculty Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Faculty Member</DialogTitle>
            <DialogDescription>
              Fill in the faculty member details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="add-name">Full Name *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <Label htmlFor="add-email">Email Address *</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@university.edu"
              />
            </div>

            <div>
              <Label htmlFor="add-department">Department *</Label>
              <Input
                id="add-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
              />
            </div>

            <div>
              <Label htmlFor="add-maxLoad">Maximum Weekly Load (hours) *</Label>
              <Input
                id="add-maxLoad"
                type="number"
                min="1"
                max="40"
                value={formData.maxLoad}
                onChange={(e) => setFormData({ ...formData, maxLoad: parseInt(e.target.value) || 24 })}
              />
            </div>

            <div>
              <Label htmlFor="add-specialization">Specialization (comma-separated)</Label>
              <Input
                id="add-specialization"
                value={formData.specialization.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specialization: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Programming, Web Development, Databases"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFaculty}>
              Add Faculty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Faculty Member</DialogTitle>
            <DialogDescription>
              Fill in the faculty member details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@university.edu"
              />
            </div>

            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
              />
            </div>

            <div>
              <Label htmlFor="edit-maxLoad">Maximum Weekly Load (hours) *</Label>
              <Input
                id="edit-maxLoad"
                type="number"
                min="1"
                max="40"
                value={formData.maxLoad}
                onChange={(e) => setFormData({ ...formData, maxLoad: parseInt(e.target.value) || 24 })}
              />
            </div>

            <div>
              <Label htmlFor="edit-specialization">Specialization (comma-separated)</Label>
              <Input
                id="edit-specialization"
                value={formData.specialization.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  specialization: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Programming, Web Development, Databases"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFaculty}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}