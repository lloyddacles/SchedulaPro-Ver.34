import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ReportsProps {
  // In a real app, these would be computed from actual data
}

export function Reports({}: ReportsProps) {
  // Mock data for charts
  const roomUtilizationData = [
    { room: 'CS-101', utilization: 85, capacity: 40, hours: 34 },
    { room: 'CS-201', utilization: 72, capacity: 35, hours: 29 },
    { room: 'GH-301', utilization: 90, capacity: 60, hours: 36 },
    { room: 'GH-302', utilization: 65, capacity: 50, hours: 26 },
    { room: 'GH-401', utilization: 70, capacity: 45, hours: 28 },
  ];

  const facultyLoadData = [
    { name: 'Prof. Garcia', load: 24, max: 24 },
    { name: 'Dr. Martinez', load: 18, max: 21 },
    { name: 'Prof. Tan', load: 21, max: 24 },
    { name: 'Dr. Lee', load: 15, max: 18 },
    { name: 'Prof. Chen', load: 22, max: 24 },
  ];

  const timeSlotDistribution = [
    { slot: '6-9 AM', classes: 12, color: '#1e3a8a' },
    { slot: '9-12 PM', classes: 28, color: '#3b82f6' },
    { slot: '12-3 PM', classes: 18, color: '#60a5fa' },
    { slot: '3-6 PM', classes: 24, color: '#10b981' },
    { slot: '6-10 PM', classes: 8, color: '#6366f1' },
  ];

  const dayUtilization = [
    { day: 'Monday', classes: 32, percentage: 88 },
    { day: 'Tuesday', classes: 28, percentage: 75 },
    { day: 'Wednesday', classes: 30, percentage: 82 },
    { day: 'Thursday', classes: 26, percentage: 70 },
    { day: 'Friday', classes: 24, percentage: 65 },
    { day: 'Saturday', classes: 15, percentage: 45 },
  ];

  const programDistribution = [
    { name: 'BS Computer Science', value: 45, color: '#1e3a8a' },
    { name: 'BS Information Technology', value: 38, color: '#3b82f6' },
    { name: 'BS Information Systems', value: 22, color: '#10b981' },
    { name: 'Other Programs', value: 15, color: '#6366f1' },
  ];

  const handleExportPDF = () => {
    alert('Export to PDF - Would generate comprehensive PDF report in production');
  };

  const handleExportExcel = () => {
    alert('Export to Excel - Would generate Excel workbook in production');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Comprehensive scheduling insights and statistics</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024-2025">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
              <SelectItem value="2023-2024">2023-2024</SelectItem>
              <SelectItem value="2022-2023">2022-2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="default" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs for different report types */}
      <Tabs defaultValue="utilization" className="w-full">
        <TabsList>
          <TabsTrigger value="utilization">Room Utilization</TabsTrigger>
          <TabsTrigger value="faculty">Faculty Load</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Room Utilization Report */}
        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Utilization Rate</CardTitle>
                <CardDescription>Percentage of time each room is occupied</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roomUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="room" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#1e3a8a" name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Utilization</CardTitle>
                <CardDescription>Class distribution across the week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayUtilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="classes" fill="#10b981" name="Number of Classes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Room Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Room Statistics</CardTitle>
              <CardDescription>Comprehensive breakdown of room usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm text-muted-foreground">Room</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Capacity</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Hours/Week</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Utilization</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomUtilizationData.map((room) => (
                      <tr key={room.room} className="border-b border-border">
                        <td className="p-3">{room.room}</td>
                        <td className="p-3">{room.capacity}</td>
                        <td className="p-3">{room.hours}</td>
                        <td className="p-3">{room.utilization}%</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            room.utilization >= 80 ? 'bg-green-100 text-green-800' :
                            room.utilization >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {room.utilization >= 80 ? 'Optimal' : 
                             room.utilization >= 60 ? 'Moderate' : 'Under-utilized'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Load Report */}
        <TabsContent value="faculty" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Teaching Load</CardTitle>
                <CardDescription>Current load vs maximum capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={facultyLoadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="load" fill="#1e3a8a" name="Current Load" />
                    <Bar dataKey="max" fill="#94a3b8" name="Max Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Load Distribution Summary</CardTitle>
                <CardDescription>Faculty workload statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Load</p>
                      <p className="text-2xl text-foreground">20 hrs</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Faculty at Full Capacity</p>
                      <p className="text-2xl text-foreground">2 of 5</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Faculty</p>
                      <p className="text-2xl text-foreground">5</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Faculty Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Faculty Load Details</CardTitle>
              <CardDescription>Individual faculty assignments and capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm text-muted-foreground">Faculty</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Department</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Current Load</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Max Load</th>
                      <th className="text-left p-3 text-sm text-muted-foreground">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyLoadData.map((faculty) => (
                      <tr key={faculty.name} className="border-b border-border">
                        <td className="p-3">{faculty.name}</td>
                        <td className="p-3">Computer Science</td>
                        <td className="p-3">{faculty.load} hrs</td>
                        <td className="p-3">{faculty.max} hrs</td>
                        <td className="p-3">{Math.round((faculty.load / faculty.max) * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Report */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Slot Distribution</CardTitle>
                <CardDescription>Classes scheduled by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timeSlotDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ slot, classes }) => `${slot}: ${classes}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="classes"
                    >
                      {timeSlotDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Distribution</CardTitle>
                <CardDescription>Classes by academic program</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={programDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {programDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Saturday Classes</CardTitle>
              <CardDescription>Weekend schedule utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Saturday Classes</p>
                  <p className="text-2xl text-foreground">15</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Saturday Utilization</p>
                  <p className="text-2xl text-foreground">45%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Programs Using Saturday</p>
                  <p className="text-2xl text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Report */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-foreground">157</div>
                <p className="text-xs text-muted-foreground mt-1">This semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-foreground">4</div>
                <p className="text-xs text-muted-foreground mt-1">Active programs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-foreground">5</div>
                <p className="text-xs text-muted-foreground mt-1">Teaching this semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-foreground">6</div>
                <p className="text-xs text-muted-foreground mt-1">Available rooms</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Overall scheduling performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="text-sm text-muted-foreground mb-2">Resource Efficiency</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Room Utilization</span>
                        <span className="text-foreground">68.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Faculty Load</span>
                        <span className="text-foreground">75.2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time Slot Usage</span>
                        <span className="text-foreground">72.3%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="text-sm text-muted-foreground mb-2">Schedule Health</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Approved Schedules</span>
                        <span className="text-green-600">3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pending Approval</span>
                        <span className="text-yellow-600">2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Active Conflicts</span>
                        <span className="text-red-600">1</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                  <h4 className="text-sm text-foreground mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Consider increasing Saturday class offerings to improve facility utilization</li>
                    <li>• Room GH-302 is underutilized - consider scheduling additional classes</li>
                    <li>• Dr. Lee has available capacity for 3 more hours of teaching</li>
                    <li>• Peak time slots (9 AM - 12 PM) are heavily utilized - consider evening alternatives</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
