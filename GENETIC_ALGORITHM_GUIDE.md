# Hybrid Genetic Algorithm for Schedule Optimization

## Overview

SchedulaPro now includes a sophisticated **Hybrid Genetic Algorithm** module for automated classroom schedule optimization. This AI-powered feature combines evolutionary computation with local search techniques to find near-optimal schedules that satisfy multiple constraints and objectives.

## Features

### Core Capabilities

1. **Multi-Objective Optimization**
   - Minimize scheduling conflicts (rooms, faculty, sections)
   - Maximize resource utilization (rooms, time slots)
   - Balance faculty workload distribution
   - Minimize gaps in student/faculty schedules
   - Satisfy faculty preferences

2. **Constraint Handling**
   - **Hard Constraints** (must be satisfied):
     - No room double-booking
     - No faculty overlaps
     - No section time clashes
     - Room capacity compliance
     - Lab requirements matching
   
   - **Soft Constraints** (preferred but flexible):
     - Faculty day/time preferences
     - Balanced workload distribution
     - Minimal scheduling gaps
     - Even time distribution
     - Efficient room utilization

3. **Hybrid Approach**
   - Genetic algorithm operators (selection, crossover, mutation)
   - Local search optimization (hill climbing)
   - Elitism for preserving best solutions
   - Adaptive convergence detection

## Architecture

### Main Components

```
/src/app/services/
├── GeneticAlgorithm.ts           # Core GA implementation
├── ScheduleOptimizationUtils.ts  # Analysis and utility functions
│
/src/app/components/
├── ScheduleOptimizer.tsx         # UI component for optimization
└── OptimizationDemo.tsx          # Demo and testing component
```

### Key Classes and Functions

#### 1. `HybridGeneticAlgorithm` Class

Main optimization engine:

```typescript
const ga = new HybridGeneticAlgorithm(
  courses,
  faculty,
  rooms,
  sections,
  constraints,
  config
);

const result = ga.optimize(existingSchedule);
```

#### 2. Helper Functions

```typescript
// Quick optimization
const result = optimizeSchedule(
  existingSchedule,
  courses,
  faculty,
  rooms,
  sections,
  config
);

// Schedule analysis
const analysis = analyzeSchedule(
  schedule,
  courses,
  faculty,
  rooms,
  sections
);

// Validation
const validation = validateSchedule(
  schedule,
  courses,
  faculty,
  rooms,
  sections
);

// Comparison
const comparison = compareSchedules(
  originalSchedule,
  optimizedSchedule,
  courses,
  faculty,
  rooms,
  sections
);
```

## Configuration

### Algorithm Parameters

```typescript
interface GAConfig {
  populationSize: number;          // Number of solutions in each generation
  generations: number;             // Maximum iterations
  crossoverRate: number;           // Probability of crossover (0-1)
  mutationRate: number;            // Probability of mutation (0-1)
  elitismRate: number;             // Percentage of elite preserved (0-1)
  tournamentSize: number;          // Selection tournament size
  localSearchIterations: number;   // Hill climbing iterations
  hybridActivationGeneration: number; // When to start local search
}
```

### Default Configuration

```typescript
{
  populationSize: 100,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.15,
  elitismRate: 0.1,
  tournamentSize: 5,
  localSearchIterations: 10,
  hybridActivationGeneration: 50
}
```

### Recommended Settings

**Quick Optimization** (< 10 seconds):
```typescript
{
  populationSize: 50,
  generations: 100,
  crossoverRate: 0.8,
  mutationRate: 0.15
}
```

**Balanced** (10-30 seconds):
```typescript
{
  populationSize: 100,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.15
}
```

**High Quality** (30-60 seconds):
```typescript
{
  populationSize: 200,
  generations: 500,
  crossoverRate: 0.85,
  mutationRate: 0.12
}
```

## Usage Examples

### Basic Usage

```typescript
import { optimizeSchedule } from './services/GeneticAlgorithm';

// Current schedule items
const currentSchedule = [...scheduleItems];

// Run optimization
const result = optimizeSchedule(
  currentSchedule,
  courses,
  faculty,
  rooms,
  sections
);

// Apply optimized schedule
console.log(`Improvement: ${result.statistics.improvement}%`);
console.log(`Conflicts: ${result.statistics.hardViolations}`);
applySchedule(result.bestSchedule);
```

### Advanced Usage with Custom Configuration

```typescript
import { 
  HybridGeneticAlgorithm,
  createDefaultConstraints 
} from './services/GeneticAlgorithm';

// Create custom constraints
const constraints = createDefaultConstraints(rooms, faculty);

// Add faculty preferences
constraints.facultyPreferences.set('faculty-1', {
  preferredDays: ['Monday', 'Wednesday', 'Friday'],
  avoidTimeSlots: ['07:00-08:00', '18:00-19:00'],
  maxDailyLoad: 6
});

// Custom configuration
const config = {
  populationSize: 150,
  generations: 300,
  crossoverRate: 0.85,
  mutationRate: 0.12,
  localSearchIterations: 15
};

// Initialize and run
const ga = new HybridGeneticAlgorithm(
  courses,
  faculty,
  rooms,
  sections,
  constraints,
  config
);

const result = ga.optimize(currentSchedule);
```

### Schedule Analysis

```typescript
import { analyzeSchedule } from './services/ScheduleOptimizationUtils';

const analysis = analyzeSchedule(
  schedule,
  courses,
  faculty,
  rooms,
  sections
);

console.log('Room Utilization:', analysis.roomUtilization.utilizationRate);
console.log('Faculty Workload Balance:', analysis.facultyWorkload.workloadBalance);
console.log('Total Conflicts:', analysis.conflicts.totalConflicts);
console.log('Quality Score:', analysis.quality.overallScore);
```

### Validation

```typescript
import { validateSchedule } from './services/ScheduleOptimizationUtils';

const validation = validateSchedule(
  schedule,
  courses,
  faculty,
  rooms,
  sections
);

if (!validation.isValid) {
  console.error('Schedule has errors:');
  validation.errors.forEach(error => {
    console.error(`- ${error.message}`);
  });
}

if (validation.warnings.length > 0) {
  console.warn('Schedule has warnings:');
  validation.warnings.forEach(warning => {
    console.warn(`- [${warning.severity}] ${warning.message}`);
  });
}
```

### Generate Report

```typescript
import { generateScheduleReport } from './services/ScheduleOptimizationUtils';

const report = generateScheduleReport(
  schedule,
  courses,
  faculty,
  rooms,
  sections
);

console.log(report);
// or save to file
```

## Integration with UI Components

### Using ScheduleOptimizer Component

```tsx
import { ScheduleOptimizer } from './components/ScheduleOptimizer';

function MySchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const handleOptimized = (optimizedSchedule: ScheduleItem[]) => {
    setSchedule(optimizedSchedule);
    // Save to backend
  };

  return (
    <ScheduleOptimizer
      currentSchedule={schedule}
      courses={courses}
      faculty={faculty}
      rooms={rooms}
      sections={sections}
      onOptimizedSchedule={handleOptimized}
    />
  );
}
```

### Using OptimizationDemo Component

```tsx
import { OptimizationDemo } from './components/OptimizationDemo';

function TestOptimization() {
  return (
    <div>
      <h1>Optimization Demo</h1>
      <OptimizationDemo />
    </div>
  );
}
```

## Algorithm Details

### Fitness Function

The fitness function evaluates each schedule based on:

```
Fitness = MaxFitness - (HardPenalty × 1000 + SoftPenalty × 100)

Where:
- MaxFitness = 10,000
- HardPenalty = sum of hard constraint violations
- SoftPenalty = sum of soft constraint violations
```

### Hard Constraint Penalties

- Room conflict: 10 points per conflict
- Faculty overlap: 10 points per conflict
- Section clash: 8 points per conflict
- Capacity violation: 5 points per violation
- Room type mismatch: 4 points per mismatch

### Soft Constraint Penalties

- Faculty preference violation: 1-2 points
- Poor time distribution: 0.5 points per deviation
- Excessive gaps: 1 point per hour
- Faculty overload: 2 points per excess hour

### Selection Process

Tournament Selection:
1. Randomly select `tournamentSize` individuals
2. Choose the fittest among them
3. Repeat for each parent needed

### Crossover Operation

Uniform Crossover:
1. For each gene position
2. Randomly select from parent1 or parent2
3. Copy to offspring

### Mutation Operations

Four mutation types (equal probability):
1. **Day mutation**: Change assigned day
2. **Time mutation**: Change time slot
3. **Room mutation**: Change assigned room
4. **Swap mutation**: Swap two schedule items

### Local Search (Hill Climbing)

Activated after generation `hybridActivationGeneration`:
1. Generate neighbor solutions by small mutations
2. Evaluate fitness of neighbors
3. Move to better neighbor if found
4. Repeat for `localSearchIterations`
5. Stop at local optimum

## Performance Metrics

### Output Statistics

```typescript
interface OptimizationStatistics {
  initialFitness: number;
  finalFitness: number;
  improvement: number;           // Percentage improvement
  hardViolations: number;        // Hard constraint violations
  softViolations: number;        // Soft constraint violations
  roomUtilization: number;       // Percentage (0-100)
  averageFacultyLoad: number;    // Hours
  averageGapsPerDay: number;     // Number
  executionTimeMs: number;       // Milliseconds
}
```

### Typical Performance

- **Small schedules** (< 50 items): 1-5 seconds
- **Medium schedules** (50-150 items): 5-20 seconds
- **Large schedules** (150-300 items): 20-60 seconds

### Convergence

The algorithm typically converges within:
- 50-100 generations for small problems
- 100-200 generations for medium problems
- 200-500 generations for complex problems

Early stopping occurs if no improvement for 20 consecutive generations.

## Best Practices

### 1. Start with Current Schedule

Always seed the population with your current schedule:
```typescript
// The algorithm automatically uses existing schedule as seed
const result = optimizeSchedule(currentSchedule, ...);
```

### 2. Adjust Parameters Based on Problem Size

- Small problems: Lower population, fewer generations
- Large problems: Higher population, more generations
- Complex constraints: Higher mutation rate

### 3. Monitor Convergence

Check the convergence history to understand optimization progress:
```typescript
console.log('Convergence:', result.convergenceHistory);
// Plot or analyze the fitness evolution
```

### 4. Balance Quality vs Speed

- For draft schedules: Use quick settings
- For final schedules: Use high-quality settings
- For iterative improvements: Use balanced settings

### 5. Handle Infeasible Problems

If optimization yields many hard violations:
1. Check if problem is feasible (enough rooms, time slots)
2. Relax some soft constraints
3. Increase generations and population size
4. Consider manual adjustments first

### 6. Validate Results

Always validate the optimized schedule:
```typescript
const validation = validateSchedule(result.bestSchedule, ...);
if (!validation.isValid) {
  // Handle errors or re-optimize
}
```

## Troubleshooting

### Common Issues

**1. High conflict count after optimization**
- Increase generations and population size
- Check if problem is feasible
- Verify room capacities and availability

**2. Slow performance**
- Reduce population size or generations
- Disable local search (set iterations to 0)
- Profile with smaller dataset first

**3. No improvement**
- Current schedule may already be optimal
- Try different mutation/crossover rates
- Increase exploration (higher mutation rate)

**4. Getting worse results**
- Check fitness function weights
- Verify constraint definitions
- Review initial schedule quality

## Future Enhancements

Planned improvements:

1. **Multi-population GA**: Island model for better exploration
2. **Adaptive parameters**: Self-adjusting mutation/crossover rates
3. **Parallel evaluation**: Web Workers for faster computation
4. **Constraint relaxation**: Automatic soft constraint adjustment
5. **Interactive optimization**: Real-time parameter tuning
6. **Machine learning integration**: Learn from past schedules
7. **Multi-semester optimization**: Optimize across semesters
8. **What-if analysis**: Compare multiple optimization scenarios

## References

### Academic Papers

1. Abdullah, S., & Turabieh, H. (2012). "A hybrid metaheuristic approach for the university course timetabling problem"
2. Pillay, N. (2014). "A survey of school timetabling research"
3. Lewis, R. (2008). "A survey of metaheuristic-based techniques for university timetabling problems"

### Implementation Resources

- Genetic Algorithms: Holland, J. H. (1975)
- Hybrid Metaheuristics: Blum, C., et al. (2008)
- Constraint Satisfaction: Rossi, F., et al. (2006)

## Support

For questions or issues:
1. Check this documentation
2. Review the OptimizationDemo component
3. Examine the code comments in GeneticAlgorithm.ts
4. Test with small datasets first

## License

Part of SchedulaPro - Enterprise Classroom Scheduling System
© 2025 All Rights Reserved
