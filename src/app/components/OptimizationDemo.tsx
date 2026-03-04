import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Sparkles, Play, Download, BarChart3, 
  FileText, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  analyzeSchedule, 
  compareSchedules, 
  validateSchedule,
  generateScheduleReport,
  type ScheduleAnalysis 
} from '../services/ScheduleOptimizationUtils';
import { optimizeSchedule } from '../services/GeneticAlgorithm';
import type { ScheduleItem, Course, Faculty, Room, Section } from '../types';
import { 
  mockCourses, 
  mockFaculty, 
  mockRooms, 
  mockSections,
  mockScheduleItems 
} from '../data/mockData';

interface OptimizationDemoProps {
  onClose?: () => void;
}

export function OptimizationDemo({ onClose }: OptimizationDemoProps) {
  const [currentSchedule] = useState<ScheduleItem[]>(mockScheduleItems);
  const [optimizedSchedule, setOptimizedSchedule] = useState<ScheduleItem[] | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ScheduleAnalysis | null>(null);
  const [optimizedAnalysis, setOptimizedAnalysis] = useState<ScheduleAnalysis | null>(null);

  const handleAnalyzeCurrent = () => {
    const analysis = analyzeSchedule(
      currentSchedule,
      mockCourses,
      mockFaculty,
      mockRooms,
      mockSections
    );
    setCurrentAnalysis(analysis);
    toast.success('Analysis complete!');
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    toast.info('Starting optimization...');

    try {
      // Simulate async optimization
      setTimeout(() => {
        const result = optimizeSchedule(
          currentSchedule,
          mockCourses,
          mockFaculty,
          mockRooms,
          mockSections,
          {
            populationSize: 50,
            generations: 100,
            crossoverRate: 0.8,
            mutationRate: 0.15,
          }
        );

        setOptimizedSchedule(result.bestSchedule);
        
        const analysis = analyzeSchedule(
          result.bestSchedule,
          mockCourses,
          mockFaculty,
          mockRooms,
          mockSections
        );
        setOptimizedAnalysis(analysis);

        setIsOptimizing(false);
        toast.success(`Optimization complete! ${result.statistics.improvement.toFixed(1)}% improvement`);
      }, 2000);
    } catch (error) {
      console.error('Optimization error:', error);
      setIsOptimizing(false);
      toast.error('Optimization failed');
    }
  };

  const handleGenerateReport = () => {
    if (!currentSchedule) return;
    
    const report = generateScheduleReport(
      optimizedSchedule || currentSchedule,
      mockCourses,
      mockFaculty,
      mockRooms,
      mockSections
    );

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded!');
  };

  const validation = currentSchedule 
    ? validateSchedule(currentSchedule, mockCourses, mockFaculty, mockRooms, mockSections)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Genetic Algorithm Optimization Demo
              </CardTitle>
              <CardDescription>
                Explore AI-powered schedule optimization capabilities
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAnalyzeCurrent} variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze
              </Button>
              <Button onClick={handleOptimize} disabled={isOptimizing}>
                <Play className="w-4 h-4 mr-2" />
                {isOptimizing ? 'Optimizing...' : 'Optimize'}
              </Button>
              <Button onClick={handleGenerateReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Status */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {validation.isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Schedule Valid
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Schedule Has Issues
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-destructive">
                  Errors ({validation.errors.length})
                </h4>
                {validation.errors.map((error, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span>{error.message}</span>
                  </div>
                ))}
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-yellow-600">
                  Warnings ({validation.warnings.length})
                </h4>
                {validation.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {warning.severity}
                        </Badge>
                        <span>{warning.message}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Comparison */}
      {(currentAnalysis || optimizedAnalysis) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule Analysis</CardTitle>
            <CardDescription>
              Compare current and optimized schedule metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {currentAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Current Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Classes:</span>
                          <span className="font-medium">{currentAnalysis.totalClasses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Hours:</span>
                          <span className="font-medium">
                            {currentAnalysis.totalHours.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Conflicts:</span>
                          <span className="font-medium text-destructive">
                            {currentAnalysis.conflicts.totalConflicts}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quality Score:</span>
                          <span className="font-medium">
                            {currentAnalysis.quality.overallScore.toFixed(1)}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {optimizedAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Optimized Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Classes:</span>
                          <span className="font-medium">{optimizedAnalysis.totalClasses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Hours:</span>
                          <span className="font-medium">
                            {optimizedAnalysis.totalHours.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Conflicts:</span>
                          <span className="font-medium text-green-500">
                            {optimizedAnalysis.conflicts.totalConflicts}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quality Score:</span>
                          <span className="font-medium text-primary">
                            {optimizedAnalysis.quality.overallScore.toFixed(1)}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Rooms Tab */}
              <TabsContent value="rooms" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {currentAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Current Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rooms Used:</span>
                          <span className="font-medium">
                            {currentAnalysis.roomUtilization.roomsUsed}/
                            {currentAnalysis.roomUtilization.totalRooms}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Utilization:</span>
                          <span className="font-medium">
                            {currentAnalysis.roomUtilization.utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Occupancy:</span>
                          <span className="font-medium">
                            {currentAnalysis.roomUtilization.averageOccupancy.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Most Used Rooms</p>
                        <div className="space-y-1">
                          {currentAnalysis.roomUtilization.mostUsedRooms.slice(0, 3).map((room, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span>{room.roomCode}</span>
                              <Badge variant="secondary" className="text-xs">
                                {room.count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {optimizedAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Optimized Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rooms Used:</span>
                          <span className="font-medium">
                            {optimizedAnalysis.roomUtilization.roomsUsed}/
                            {optimizedAnalysis.roomUtilization.totalRooms}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Utilization:</span>
                          <span className="font-medium text-primary">
                            {optimizedAnalysis.roomUtilization.utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Occupancy:</span>
                          <span className="font-medium">
                            {optimizedAnalysis.roomUtilization.averageOccupancy.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Most Used Rooms</p>
                        <div className="space-y-1">
                          {optimizedAnalysis.roomUtilization.mostUsedRooms.slice(0, 3).map((room, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span>{room.roomCode}</span>
                              <Badge variant="secondary" className="text-xs">
                                {room.count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Faculty Tab */}
              <TabsContent value="faculty" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {currentAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Current Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Hours:</span>
                          <span className="font-medium">
                            {currentAnalysis.facultyWorkload.averageHours.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Balance Score:</span>
                          <span className="font-medium">
                            {currentAnalysis.facultyWorkload.workloadBalance.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Overloaded:</span>
                          <span className="font-medium text-destructive">
                            {currentAnalysis.facultyWorkload.overloadedFaculty.length}
                          </span>
                        </div>
                      </div>
                      {currentAnalysis.facultyWorkload.overloadedFaculty.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Overloaded Faculty</p>
                          {currentAnalysis.facultyWorkload.overloadedFaculty.map((f, i) => (
                            <div key={i} className="text-xs">
                              {f.name}: {f.hours.toFixed(1)}h / {f.maxLoad}h
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {optimizedAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Optimized Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Avg Hours:</span>
                          <span className="font-medium">
                            {optimizedAnalysis.facultyWorkload.averageHours.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Balance Score:</span>
                          <span className="font-medium text-primary">
                            {optimizedAnalysis.facultyWorkload.workloadBalance.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Overloaded:</span>
                          <span className="font-medium text-green-500">
                            {optimizedAnalysis.facultyWorkload.overloadedFaculty.length}
                          </span>
                        </div>
                      </div>
                      {optimizedAnalysis.facultyWorkload.overloadedFaculty.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Overloaded Faculty</p>
                          {optimizedAnalysis.facultyWorkload.overloadedFaculty.map((f, i) => (
                            <div key={i} className="text-xs">
                              {f.name}: {f.hours.toFixed(1)}h / {f.maxLoad}h
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Quality Tab */}
              <TabsContent value="quality" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {currentAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Current Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Overall:</span>
                          <span className="font-medium">
                            {currentAnalysis.quality.overallScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Conflict Score:</span>
                          <span className="font-medium">
                            {currentAnalysis.quality.conflictScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Distribution:</span>
                          <span className="font-medium">
                            {currentAnalysis.quality.distributionScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Efficiency:</span>
                          <span className="font-medium">
                            {currentAnalysis.quality.efficiencyScore.toFixed(1)}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {optimizedAnalysis && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Optimized Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Overall:</span>
                          <span className="font-medium text-primary">
                            {optimizedAnalysis.quality.overallScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Conflict Score:</span>
                          <span className="font-medium text-green-500">
                            {optimizedAnalysis.quality.conflictScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Distribution:</span>
                          <span className="font-medium">
                            {optimizedAnalysis.quality.distributionScore.toFixed(1)}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Efficiency:</span>
                          <span className="font-medium">
                            {optimizedAnalysis.quality.efficiencyScore.toFixed(1)}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-2">Hybrid Genetic Algorithm</h4>
              <p className="text-sm text-muted-foreground">
                The optimizer combines evolutionary computation with local search techniques to find 
                near-optimal schedules. It balances multiple objectives including conflict minimization, 
                workload distribution, and resource utilization.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Key Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Multi-objective optimization with configurable weights</li>
                <li>Hard constraints: No room/faculty/section conflicts</li>
                <li>Soft constraints: Preferences, balanced workload, minimal gaps</li>
                <li>Tournament selection for parent diversity</li>
                <li>Uniform crossover for gene combination</li>
                <li>Adaptive mutation rates for exploration</li>
                <li>Hill climbing local search for refinement</li>
                <li>Elitism to preserve best solutions</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Algorithm Process</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Initialize population with random and current schedules</li>
                <li>Evaluate fitness based on constraints and objectives</li>
                <li>Select parents using tournament selection</li>
                <li>Create offspring through crossover and mutation</li>
                <li>Apply local search for hybrid optimization</li>
                <li>Replace population keeping elite individuals</li>
                <li>Repeat until convergence or max generations</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
