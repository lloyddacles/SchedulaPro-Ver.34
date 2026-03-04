# Genetic Algorithm Quick Start Guide

## 🚀 5-Minute Quick Start

### 1. Import the Function
```typescript
import { optimizeSchedule } from './services/GeneticAlgorithm';
```

### 2. Run Optimization
```typescript
const result = optimizeSchedule(
  currentScheduleItems,  // Your schedule
  courses,               // Course data
  faculty,               // Faculty data
  rooms,                 // Room data
  sections              // Section data
);
```

### 3. Use the Result
```typescript
console.log('Improvement:', result.statistics.improvement + '%');
console.log('Conflicts:', result.statistics.hardViolations);

// Apply optimized schedule
setSchedule(result.bestSchedule);
```

---

## 📋 Common Use Cases

### Fix Conflicts
```typescript
const result = optimizeSchedule(conflictedSchedule, courses, faculty, rooms, sections);
if (result.statistics.hardViolations === 0) {
  applySchedule(result.bestSchedule);
}
```

### Quick Optimization (Fast)
```typescript
const result = optimizeSchedule(
  schedule, courses, faculty, rooms, sections,
  { populationSize: 50, generations: 50 }  // ~5 seconds
);
```

### High Quality (Slow)
```typescript
const result = optimizeSchedule(
  schedule, courses, faculty, rooms, sections,
  { populationSize: 200, generations: 300 }  // ~60 seconds
);
```

---

## 🎯 Configuration Cheat Sheet

| Speed | Population | Generations | Time | Quality |
|-------|-----------|-------------|------|---------|
| Fast | 50 | 50 | ~5s | Good |
| Balanced | 100 | 150 | ~15s | Better |
| Best | 200 | 300 | ~60s | Excellent |

---

## 📊 Understanding Results

```typescript
result.statistics = {
  improvement: 35.5,           // 35.5% better
  hardViolations: 0,           // No conflicts!
  softViolations: 3,           // Minor issues
  roomUtilization: 72.5,       // 72.5% rooms used
  averageFacultyLoad: 18.5,    // 18.5 hours average
  executionTimeMs: 15234       // 15.2 seconds
}
```

---

## 🎨 UI Component Usage

### Full Optimizer
```tsx
import { ScheduleOptimizer } from './components/ScheduleOptimizer';

<ScheduleOptimizer
  currentSchedule={schedule}
  courses={courses}
  faculty={faculty}
  rooms={rooms}
  sections={sections}
  onOptimizedSchedule={(optimized) => {
    setSchedule(optimized);
    toast.success('Schedule optimized!');
  }}
/>
```

### Demo Component
```tsx
import { OptimizationDemo } from './components/OptimizationDemo';

<OptimizationDemo />
```

### Add Button to Existing Component
```tsx
import { Sparkles } from 'lucide-react';
import { optimizeSchedule } from './services/GeneticAlgorithm';

const handleOptimize = () => {
  const result = optimizeSchedule(schedule, courses, faculty, rooms, sections);
  setSchedule(result.bestSchedule);
};

<Button onClick={handleOptimize}>
  <Sparkles className="mr-2" />
  Optimize
</Button>
```

---

## 🔍 Analysis Functions

### Check Quality
```typescript
import { analyzeSchedule } from './services/ScheduleOptimizationUtils';

const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);
console.log('Quality Score:', analysis.quality.overallScore);
```

### Validate Schedule
```typescript
import { validateSchedule } from './services/ScheduleOptimizationUtils';

const validation = validateSchedule(schedule, courses, faculty, rooms, sections);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}
```

### Compare Schedules
```typescript
import { compareSchedules } from './services/ScheduleOptimizationUtils';

const comparison = compareSchedules(
  original, optimized, courses, faculty, rooms, sections
);
console.log('Improvement:', comparison.improvement);
```

---

## 📤 Export Functions

### Export to CSV
```typescript
import { exportScheduleToCSV } from './services/OptimizationExport';
exportScheduleToCSV(schedule, 'schedule.csv');
```

### Export to JSON
```typescript
import { exportScheduleToJSON } from './services/OptimizationExport';
exportScheduleToJSON(schedule, 'schedule.json');
```

### Export to HTML (Print/PDF)
```typescript
import { exportScheduleToHTML } from './services/OptimizationExport';
exportScheduleToHTML(schedule, courses, faculty, rooms, sections, 'schedule.html');
```

### Export All Formats
```typescript
import { exportAllFormats } from './services/OptimizationExport';
exportAllFormats(schedule, courses, faculty, rooms, sections, 'my-schedule');
// Creates: my-schedule.csv, my-schedule.json, my-schedule.html
```

---

## 🛠️ Advanced Configuration

### Custom Parameters
```typescript
const config = {
  populationSize: 150,           // More solutions to explore
  generations: 250,              // More iterations
  crossoverRate: 0.85,           // More gene mixing
  mutationRate: 0.12,            // Less randomness
  elitismRate: 0.15,             // Preserve more best
  tournamentSize: 7,             // Larger tournament
  localSearchIterations: 12,     // More local refinement
  hybridActivationGeneration: 75 // Start local search earlier
};

const result = optimizeSchedule(schedule, courses, faculty, rooms, sections, config);
```

### With Faculty Preferences
```typescript
import { HybridGeneticAlgorithm, createDefaultConstraints } from './services/GeneticAlgorithm';

const constraints = createDefaultConstraints(rooms, faculty);

// Add preferences
constraints.facultyPreferences.set('faculty-id-1', {
  preferredDays: ['Monday', 'Wednesday', 'Friday'],
  avoidTimeSlots: ['07:00-08:00', '18:00-19:00'],
  maxDailyLoad: 6
});

const ga = new HybridGeneticAlgorithm(courses, faculty, rooms, sections, constraints);
const result = ga.optimize(schedule);
```

---

## 🐛 Troubleshooting

### Problem: Takes Too Long
```typescript
// Solution: Reduce parameters
const result = optimizeSchedule(schedule, courses, faculty, rooms, sections, {
  populationSize: 50,
  generations: 50
});
```

### Problem: Too Many Conflicts Remain
```typescript
// Solution: Increase parameters
const result = optimizeSchedule(schedule, courses, faculty, rooms, sections, {
  populationSize: 200,
  generations: 400,
  localSearchIterations: 20
});
```

### Problem: No Improvement
```typescript
// Solution 1: Current schedule might be optimal
const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);
console.log('Current quality:', analysis.quality.overallScore);

// Solution 2: Try different mutation rate
const result = optimizeSchedule(schedule, courses, faculty, rooms, sections, {
  mutationRate: 0.25  // More exploration
});
```

---

## 📈 Performance Tips

1. **Start Small**: Test with 20-30 items first
2. **Iterate**: Run multiple times
3. **Save Best**: Keep the best result
4. **Monitor**: Watch convergence history
5. **Validate**: Always check results

---

## ✅ Success Checklist

- [ ] Imported the function
- [ ] Prepared data (courses, faculty, rooms, sections)
- [ ] Ran optimization
- [ ] Checked statistics
- [ ] Validated results
- [ ] Applied to schedule
- [ ] Exported results

---

## 📚 Full Documentation

- **Complete Guide**: `/GENETIC_ALGORITHM_GUIDE.md`
- **Integration**: `/INTEGRATION_EXAMPLE.md`  
- **Summary**: `/GENETIC_ALGORITHM_SUMMARY.md`
- **Code**: `/src/app/services/GeneticAlgorithm.ts`

---

## 🎯 One-Liner Examples

```typescript
// Most common usage
const result = optimizeSchedule(schedule, courses, faculty, rooms, sections);

// Fast optimization
const result = optimizeSchedule(schedule, courses, faculty, rooms, sections, { generations: 50 });

// High quality
const result = optimizeSchedule(schedule, courses, faculty, rooms, sections, { populationSize: 200, generations: 300 });

// Analyze
const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);

// Validate
const validation = validateSchedule(schedule, courses, faculty, rooms, sections);

// Export
exportScheduleToCSV(schedule, 'schedule.csv');
```

---

## 💡 Pro Tips

1. **Use Demo First**: `<OptimizationDemo />` to understand behavior
2. **Save History**: Keep track of optimization attempts
3. **Compare Results**: Try different configurations
4. **Export Reports**: Document improvements
5. **Validate Always**: Check before applying

---

## 🎓 What It Does

The genetic algorithm:
- ✅ Removes scheduling conflicts
- ✅ Balances faculty workload
- ✅ Optimizes room usage
- ✅ Minimizes gaps
- ✅ Respects preferences
- ✅ Improves overall quality

---

## 🚀 Ready to Start!

```typescript
// Copy this to get started:
import { optimizeSchedule } from './services/GeneticAlgorithm';
import { toast } from 'sonner';

const handleOptimize = async () => {
  toast.info('Optimizing...');
  
  const result = optimizeSchedule(
    currentSchedule,
    courses,
    faculty,
    rooms,
    sections
  );
  
  if (result.statistics.hardViolations === 0) {
    setSchedule(result.bestSchedule);
    toast.success(`Optimized! ${result.statistics.improvement.toFixed(1)}% improvement`);
  } else {
    toast.warning(`${result.statistics.hardViolations} conflicts remaining`);
  }
};
```

**That's it! You're ready to optimize schedules with AI! 🎉**
