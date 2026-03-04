# Genetic Algorithm Integration Example

## Adding Optimization to Existing Schedule Builder

Here's how to integrate the Hybrid Genetic Algorithm optimizer into your existing ScheduleBuilder component.

### Step 1: Import the Optimizer

Add these imports to your `ScheduleBuilder.tsx`:

```typescript
import { optimizeSchedule } from '../services/GeneticAlgorithm';
import { toast } from 'sonner';
```

### Step 2: Add State for Optimization

```typescript
const [isOptimizing, setIsOptimizing] = useState(false);
```

### Step 3: Add Optimization Function

```typescript
const handleOptimizeSchedule = async () => {
  if (scheduleItems.length === 0) {
    toast.error('No schedule items to optimize');
    return;
  }

  setIsOptimizing(true);
  toast.info('Starting AI optimization...');

  try {
    // Run optimization in a setTimeout to allow UI to update
    setTimeout(() => {
      const result = optimizeSchedule(
        scheduleItems,
        courses,
        faculty,
        rooms,
        sections,
        {
          populationSize: 100,
          generations: 150,
          crossoverRate: 0.8,
          mutationRate: 0.15,
        }
      );

      // Apply optimized schedule
      setScheduleItems(result.bestSchedule);
      
      // Show results
      const improvement = result.statistics.improvement.toFixed(1);
      const hardViolations = result.statistics.hardViolations;
      
      if (hardViolations === 0) {
        toast.success(
          `Optimization complete! ${improvement}% improvement with no conflicts`,
          { duration: 5000 }
        );
      } else {
        toast.warning(
          `Optimization complete with ${hardViolations} conflicts remaining`,
          { duration: 5000 }
        );
      }
      
      setIsOptimizing(false);
    }, 100);

  } catch (error) {
    console.error('Optimization error:', error);
    toast.error('Optimization failed. Please try again.');
    setIsOptimizing(false);
  }
};
```

### Step 4: Add UI Button

Add an "Optimize with AI" button to your component:

```tsx
<div className="flex gap-2">
  <Button 
    onClick={handleOptimizeSchedule}
    disabled={isOptimizing || scheduleItems.length === 0}
    variant="default"
  >
    {isOptimizing ? (
      <>
        <Clock className="w-4 h-4 mr-2 animate-spin" />
        Optimizing...
      </>
    ) : (
      <>
        <Sparkles className="w-4 h-4 mr-2" />
        Optimize with AI
      </>
    )}
  </Button>

  <Button onClick={() => setIsAddDialogOpen(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Add Class
  </Button>

  <Button onClick={() => onSave(scheduleItems)} variant="outline">
    <Save className="w-4 h-4 mr-2" />
    Save Draft
  </Button>

  <Button 
    onClick={() => onSubmitForApproval(scheduleItems)}
    disabled={conflicts.length > 0}
  >
    <Send className="w-4 h-4 mr-2" />
    Submit for Approval
  </Button>
</div>
```

### Complete Integration Example

Here's a minimal example showing the key parts:

```tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { optimizeSchedule } from '../services/GeneticAlgorithm';
import type { ScheduleItem, Course, Faculty, Room, Section } from '../types';

interface ScheduleBuilderProps {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  sections: Section[];
  onSave: (items: ScheduleItem[]) => void;
}

export function ScheduleBuilder({ 
  courses, 
  faculty, 
  rooms, 
  sections,
  onSave 
}: ScheduleBuilderProps) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimizeSchedule = async () => {
    if (scheduleItems.length === 0) {
      toast.error('No schedule items to optimize');
      return;
    }

    setIsOptimizing(true);
    toast.info('Starting AI optimization...');

    try {
      setTimeout(() => {
        const result = optimizeSchedule(
          scheduleItems,
          courses,
          faculty,
          rooms,
          sections
        );

        setScheduleItems(result.bestSchedule);
        
        toast.success(
          `Optimized! ${result.statistics.improvement.toFixed(1)}% improvement`
        );
        
        setIsOptimizing(false);
      }, 100);

    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed');
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2>Schedule Builder</h2>
        <Button 
          onClick={handleOptimizeSchedule}
          disabled={isOptimizing || scheduleItems.length === 0}
        >
          {isOptimizing ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Optimize with AI
            </>
          )}
        </Button>
      </div>

      {/* Rest of your schedule builder UI */}
    </div>
  );
}
```

## Adding to Main App

### Option 1: Add to Existing Schedule Builder

Integrate directly into `ScheduleBuilder.tsx` as shown above.

### Option 2: Separate Optimizer Page

Create a dedicated optimization page:

```tsx
// In App.tsx or routing
import { ScheduleOptimizer } from './components/ScheduleOptimizer';

function App() {
  return (
    <Routes>
      <Route path="/schedules/optimize" element={
        <ScheduleOptimizer
          currentSchedule={currentSchedule}
          courses={courses}
          faculty={faculty}
          rooms={rooms}
          sections={sections}
          onOptimizedSchedule={handleApplyOptimization}
        />
      } />
    </Routes>
  );
}
```

### Option 3: Add Demo Page for Testing

```tsx
// In App.tsx
import { OptimizationDemo } from './components/OptimizationDemo';

function App() {
  return (
    <Routes>
      <Route path="/demo/optimization" element={<OptimizationDemo />} />
    </Routes>
  );
}
```

## Advanced Integration

### With Real-time Analysis

```tsx
import { analyzeSchedule } from '../services/ScheduleOptimizationUtils';

const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null);

// Update analysis whenever schedule changes
useEffect(() => {
  if (scheduleItems.length > 0) {
    const newAnalysis = analyzeSchedule(
      scheduleItems,
      courses,
      faculty,
      rooms,
      sections
    );
    setAnalysis(newAnalysis);
  }
}, [scheduleItems, courses, faculty, rooms, sections]);

// Display quality score
{analysis && (
  <div className="text-sm">
    Quality Score: {analysis.quality.overallScore.toFixed(1)}/100
  </div>
)}
```

### With Validation

```tsx
import { validateSchedule } from '../services/ScheduleOptimizationUtils';

const validation = validateSchedule(
  scheduleItems,
  courses,
  faculty,
  rooms,
  sections
);

{!validation.isValid && (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Schedule has errors</AlertTitle>
    <AlertDescription>
      {validation.errors.map((error, i) => (
        <div key={i}>• {error.message}</div>
      ))}
    </AlertDescription>
  </Alert>
)}
```

### With Progress Tracking

```tsx
const [optimizationProgress, setOptimizationProgress] = useState(0);

// For more advanced tracking, you'd need to modify the GA class
// to emit progress events. Here's a simple simulation:

const handleOptimizeWithProgress = async () => {
  setIsOptimizing(true);
  setOptimizationProgress(0);

  // Simulate progress updates
  const progressInterval = setInterval(() => {
    setOptimizationProgress(prev => Math.min(prev + 5, 95));
  }, 200);

  setTimeout(() => {
    const result = optimizeSchedule(scheduleItems, ...);
    clearInterval(progressInterval);
    setOptimizationProgress(100);
    setScheduleItems(result.bestSchedule);
    setIsOptimizing(false);
  }, 5000);
};

// Display progress
{isOptimizing && (
  <Progress value={optimizationProgress} className="w-full" />
)}
```

## Configuration Examples

### Quick Optimization (Fast)

```typescript
const result = optimizeSchedule(
  scheduleItems,
  courses,
  faculty,
  rooms,
  sections,
  {
    populationSize: 50,
    generations: 50,
    crossoverRate: 0.8,
    mutationRate: 0.2,
  }
);
```

### Balanced Optimization

```typescript
const result = optimizeSchedule(
  scheduleItems,
  courses,
  faculty,
  rooms,
  sections,
  {
    populationSize: 100,
    generations: 150,
    crossoverRate: 0.8,
    mutationRate: 0.15,
  }
);
```

### High Quality Optimization (Slow)

```typescript
const result = optimizeSchedule(
  scheduleItems,
  courses,
  faculty,
  rooms,
  sections,
  {
    populationSize: 200,
    generations: 300,
    crossoverRate: 0.85,
    mutationRate: 0.12,
    localSearchIterations: 15,
  }
);
```

## Testing

### Unit Test Example

```typescript
import { optimizeSchedule } from '../services/GeneticAlgorithm';
import { mockScheduleItems, mockCourses, mockFaculty, mockRooms, mockSections } from '../data/mockData';

describe('Genetic Algorithm', () => {
  test('should optimize schedule', () => {
    const result = optimizeSchedule(
      mockScheduleItems,
      mockCourses,
      mockFaculty,
      mockRooms,
      mockSections,
      { generations: 10, populationSize: 20 }
    );

    expect(result.bestSchedule).toBeDefined();
    expect(result.bestSchedule.length).toBe(mockScheduleItems.length);
    expect(result.fitness).toBeGreaterThan(0);
  });

  test('should reduce conflicts', () => {
    const result = optimizeSchedule(
      mockScheduleItems,
      mockCourses,
      mockFaculty,
      mockRooms,
      mockSections
    );

    expect(result.statistics.hardViolations).toBeLessThanOrEqual(
      // Initial conflicts count
    );
  });
});
```

## Troubleshooting Integration

### Common Issues

**1. "Optimization takes too long"**
- Reduce `generations` and `populationSize`
- Use setTimeout to avoid blocking UI
- Consider Web Workers for heavy computation

**2. "Results are not applied"**
- Ensure you're updating state: `setScheduleItems(result.bestSchedule)`
- Check that parent component receives updates

**3. "TypeScript errors"**
- Ensure all types are imported from `../types`
- Check that schedule items have all required fields

**4. "Optimization doesn't improve schedule"**
- Verify input data is valid
- Check if current schedule is already optimal
- Increase generations or population size

## Next Steps

1. ✅ Add the optimizer button to ScheduleBuilder
2. ✅ Test with small schedules first
3. ✅ Add validation before optimization
4. ✅ Show results and statistics to users
5. ✅ Add progress indicators for UX
6. ✅ Save optimization history
7. ✅ Allow users to compare versions
8. ✅ Add export/import functionality

## Support

Refer to:
- `/GENETIC_ALGORITHM_GUIDE.md` - Full documentation
- `/src/app/services/GeneticAlgorithm.ts` - Implementation
- `/src/app/components/OptimizationDemo.tsx` - Working example
