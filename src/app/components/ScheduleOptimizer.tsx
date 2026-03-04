import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { 
  Sparkles, Play, Square, TrendingUp, AlertCircle, 
  CheckCircle2, Clock, Users, Building, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import type { ScheduleItem, Course, Faculty, Room, Section } from '../types';
import { 
  HybridGeneticAlgorithm, 
  optimizeSchedule,
  createDefaultConstraints,
  type GAConfig,
  type OptimizationResult,
  type ScheduleConstraints,
  type FacultyPreference
} from '../services/GeneticAlgorithm';

interface ScheduleOptimizerProps {
  currentSchedule: ScheduleItem[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  sections: Section[];
  onOptimizedSchedule: (items: ScheduleItem[]) => void;
}

export function ScheduleOptimizer({
  currentSchedule,
  courses,
  faculty,
  rooms,
  sections,
  onOptimizedSchedule,
}: ScheduleOptimizerProps) {
  // State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [currentGeneration, setCurrentGeneration] = useState(0);

  // Configuration
  const [config, setConfig] = useState<GAConfig>({
    populationSize: 100,
    generations: 200,
    crossoverRate: 0.8,
    mutationRate: 0.15,
    elitismRate: 0.1,
    tournamentSize: 5,
    localSearchIterations: 10,
    hybridActivationGeneration: 50,
  });

  // Advanced settings
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Run optimization
  const handleOptimize = async () => {
    if (currentSchedule.length === 0) {
      toast.error('No schedule items to optimize');
      return;
    }

    setIsOptimizing(true);
    setProgress(0);
    setCurrentGeneration(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCurrentGeneration(prev => {
          const next = prev + 1;
          if (next <= config.generations) {
            setProgress((next / config.generations) * 100);
            return next;
          }
          return prev;
        });
      }, 50); // Update every 50ms for smooth animation

      // Run optimization in a setTimeout to allow UI to update
      setTimeout(() => {
        const optimizationResult = optimizeSchedule(
          currentSchedule,
          courses,
          faculty,
          rooms,
          sections,
          config
        );

        clearInterval(progressInterval);
        setProgress(100);
        setResult(optimizationResult);
        setIsOptimizing(false);

        // Show success message
        const improvement = optimizationResult.statistics.improvement.toFixed(1);
        const hardViolations = optimizationResult.statistics.hardViolations;
        
        if (hardViolations === 0) {
          toast.success(`Optimization complete! ${improvement}% improvement with no conflicts`);
        } else {
          toast.warning(`Optimization complete with ${hardViolations} hard violations remaining`);
        }
      }, 100);

    } catch (error) {
      console.error('Optimization error:', error);
      setIsOptimizing(false);
      toast.error('Optimization failed. Please try again.');
    }
  };

  const handleApplyOptimization = () => {
    if (result) {
      onOptimizedSchedule(result.bestSchedule);
      toast.success('Optimized schedule applied successfully!');
    }
  };

  const handleStopOptimization = () => {
    setIsOptimizing(false);
    toast.info('Optimization stopped');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Schedule Optimizer
              </CardTitle>
              <CardDescription>
                Use hybrid genetic algorithm to automatically optimize your schedule
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isOptimizing ? (
                <Button onClick={handleOptimize} disabled={currentSchedule.length === 0}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Optimization
                </Button>
              ) : (
                <Button onClick={handleStopOptimization} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {isOptimizing && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Generation {currentGeneration} / {config.generations}
                </span>
                <span className="font-medium">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Optimizing schedule using hybrid genetic algorithm...</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Algorithm Configuration</CardTitle>
          <CardDescription>
            Adjust genetic algorithm parameters for optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="populationSize">Population Size</Label>
                <span className="text-sm text-muted-foreground">{config.populationSize}</span>
              </div>
              <Slider
                id="populationSize"
                min={50}
                max={300}
                step={10}
                value={[config.populationSize]}
                onValueChange={([value]) => setConfig({ ...config, populationSize: value })}
                disabled={isOptimizing}
              />
              <p className="text-xs text-muted-foreground">
                Larger populations explore more solutions but take longer
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="generations">Generations</Label>
                <span className="text-sm text-muted-foreground">{config.generations}</span>
              </div>
              <Slider
                id="generations"
                min={50}
                max={500}
                step={10}
                value={[config.generations]}
                onValueChange={([value]) => setConfig({ ...config, generations: value })}
                disabled={isOptimizing}
              />
              <p className="text-xs text-muted-foreground">
                More generations allow better convergence
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="crossoverRate">Crossover Rate</Label>
                <span className="text-sm text-muted-foreground">
                  {(config.crossoverRate * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                id="crossoverRate"
                min={0.5}
                max={1.0}
                step={0.05}
                value={[config.crossoverRate]}
                onValueChange={([value]) => setConfig({ ...config, crossoverRate: value })}
                disabled={isOptimizing}
              />
              <p className="text-xs text-muted-foreground">
                Probability of combining two parent solutions
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mutationRate">Mutation Rate</Label>
                <span className="text-sm text-muted-foreground">
                  {(config.mutationRate * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                id="mutationRate"
                min={0.05}
                max={0.5}
                step={0.05}
                value={[config.mutationRate]}
                onValueChange={([value]) => setConfig({ ...config, mutationRate: value })}
                disabled={isOptimizing}
              />
              <p className="text-xs text-muted-foreground">
                Probability of random changes to explore new solutions
              </p>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Label htmlFor="advanced" className="cursor-pointer">
              Show Advanced Settings
            </Label>
            <Switch
              id="advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
              disabled={isOptimizing}
            />
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="elitismRate">Elitism Rate</Label>
                  <span className="text-sm text-muted-foreground">
                    {(config.elitismRate * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  id="elitismRate"
                  min={0.05}
                  max={0.3}
                  step={0.05}
                  value={[config.elitismRate]}
                  onValueChange={([value]) => setConfig({ ...config, elitismRate: value })}
                  disabled={isOptimizing}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of best solutions preserved each generation
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tournamentSize">Tournament Size</Label>
                  <span className="text-sm text-muted-foreground">{config.tournamentSize}</span>
                </div>
                <Slider
                  id="tournamentSize"
                  min={2}
                  max={10}
                  step={1}
                  value={[config.tournamentSize]}
                  onValueChange={([value]) => setConfig({ ...config, tournamentSize: value })}
                  disabled={isOptimizing}
                />
                <p className="text-xs text-muted-foreground">
                  Number of candidates competing for selection
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="localSearch">Local Search Iterations</Label>
                  <span className="text-sm text-muted-foreground">
                    {config.localSearchIterations}
                  </span>
                </div>
                <Slider
                  id="localSearch"
                  min={0}
                  max={20}
                  step={1}
                  value={[config.localSearchIterations]}
                  onValueChange={([value]) => setConfig({ ...config, localSearchIterations: value })}
                  disabled={isOptimizing}
                />
                <p className="text-xs text-muted-foreground">
                  Hill climbing iterations for hybrid optimization
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="hybridActivation">Hybrid Activation Gen.</Label>
                  <span className="text-sm text-muted-foreground">
                    {config.hybridActivationGeneration}
                  </span>
                </div>
                <Slider
                  id="hybridActivation"
                  min={10}
                  max={150}
                  step={10}
                  value={[config.hybridActivationGeneration]}
                  onValueChange={([value]) => 
                    setConfig({ ...config, hybridActivationGeneration: value })
                  }
                  disabled={isOptimizing}
                />
                <p className="text-xs text-muted-foreground">
                  Generation when local search begins
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Optimization Results</CardTitle>
                <CardDescription>
                  Algorithm performance and improvements
                </CardDescription>
              </div>
              <Button onClick={handleApplyOptimization} variant="default">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Apply Optimization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="convergence">Convergence</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <TrendingUp className="w-8 h-8 mx-auto text-primary" />
                        <div className="text-2xl font-bold">
                          {result.statistics.improvement.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Improvement</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
                        <div className="text-2xl font-bold">
                          {result.statistics.hardViolations}
                        </div>
                        <div className="text-xs text-muted-foreground">Hard Violations</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Building className="w-8 h-8 mx-auto text-blue-500" />
                        <div className="text-2xl font-bold">
                          {result.statistics.roomUtilization.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Room Utilization</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <Users className="w-8 h-8 mx-auto text-green-500" />
                        <div className="text-2xl font-bold">
                          {result.statistics.averageFacultyLoad.toFixed(1)}h
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Faculty Load</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Initial Fitness</Label>
                    <div className="text-2xl font-bold">
                      {result.statistics.initialFitness.toFixed(0)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Final Fitness</Label>
                    <div className="text-2xl font-bold text-primary">
                      {result.statistics.finalFitness.toFixed(0)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Execution Time</Label>
                    <div className="text-2xl font-bold">
                      {(result.statistics.executionTimeMs / 1000).toFixed(2)}s
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Soft Violations</Label>
                    <div className="text-xl font-semibold">
                      {result.statistics.softViolations}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Average Gaps Per Day</Label>
                    <div className="text-xl font-semibold">
                      {result.statistics.averageGapsPerDay.toFixed(2)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Violations Tab */}
              <TabsContent value="violations" className="space-y-4 mt-4">
                {result.violations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Perfect Schedule!</h3>
                    <p className="text-muted-foreground">
                      No violations detected in the optimized schedule
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.violations.map((violation, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0">
                              {violation.type === 'hard' ? (
                                <AlertCircle className="w-5 h-5 text-destructive" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={violation.type === 'hard' ? 'destructive' : 'secondary'}>
                                  {violation.type}
                                </Badge>
                                <Badge variant="outline">
                                  {violation.category.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  Severity: {violation.severity}/100
                                </span>
                              </div>
                              <p className="text-sm">{violation.message}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Convergence Tab */}
              <TabsContent value="convergence" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Fitness Evolution</Label>
                  <div className="h-64 flex items-end gap-1">
                    {result.convergenceHistory.map((fitness, index) => {
                      const maxFitness = Math.max(...result.convergenceHistory);
                      const minFitness = Math.min(...result.convergenceHistory);
                      const range = maxFitness - minFitness || 1;
                      const height = ((fitness - minFitness) / range) * 100;
                      
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-primary rounded-t transition-all"
                          style={{ height: `${height}%` }}
                          title={`Gen ${index}: ${fitness.toFixed(0)}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Generation 0</span>
                    <span>Generation {result.generations}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Best Fitness</Label>
                    <div className="text-xl font-bold text-primary">
                      {Math.max(...result.convergenceHistory).toFixed(0)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Generations Run</Label>
                    <div className="text-xl font-bold">
                      {result.generations}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About the Hybrid Genetic Algorithm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This optimizer uses a sophisticated hybrid genetic algorithm that combines evolutionary 
            computation with local search techniques to find optimal classroom schedules.
          </p>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Key Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Multi-objective optimization balancing multiple constraints</li>
              <li>Hard constraints: No room conflicts, faculty overlaps, or section clashes</li>
              <li>Soft constraints: Faculty preferences, balanced workload, minimal gaps</li>
              <li>Hybrid approach: Combines genetic operators with hill climbing</li>
              <li>Elitism: Preserves best solutions across generations</li>
              <li>Tournament selection for diverse parent selection</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Optimization Process:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Initialize population with random and current schedules</li>
              <li>Select parents using tournament selection</li>
              <li>Create offspring through uniform crossover</li>
              <li>Apply mutations to explore new solutions</li>
              <li>Perform local search (hill climbing) for refinement</li>
              <li>Replace population keeping elite individuals</li>
              <li>Repeat until convergence or max generations</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
