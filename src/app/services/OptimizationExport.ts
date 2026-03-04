/**
 * Optimization Export Utilities
 * 
 * Functions for exporting optimization results in various formats
 */

import type { 
  ScheduleItem, 
  Course, 
  Faculty, 
  Room, 
  Section 
} from '../types';
import type { OptimizationResult } from './GeneticAlgorithm';
import { analyzeSchedule, type ScheduleAnalysis } from './ScheduleOptimizationUtils';

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Export schedule to CSV format
 */
export function exportScheduleToCSV(
  schedule: ScheduleItem[],
  filename: string = 'schedule.csv'
): void {
  const headers = [
    'Course Code',
    'Course Name',
    'Faculty',
    'Section',
    'Room',
    'Day',
    'Start Time',
    'End Time',
    'Duration (hours)'
  ];

  const rows = schedule.map(item => {
    const duration = calculateDuration(item.startTime, item.endTime);
    return [
      item.courseCode,
      item.courseName,
      item.facultyName,
      item.sectionName,
      item.roomCode,
      item.day,
      item.startTime,
      item.endTime,
      duration.toFixed(1)
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export optimization result to detailed CSV
 */
export function exportOptimizationResultToCSV(
  result: OptimizationResult,
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[],
  filename: string = 'optimization-result.csv'
): void {
  const analysis = analyzeSchedule(
    result.bestSchedule,
    courses,
    faculty,
    rooms,
    sections
  );

  const headers = [
    'Course Code',
    'Course Name',
    'Faculty',
    'Section',
    'Room',
    'Day',
    'Start Time',
    'End Time',
    'Duration (hours)',
    'Has Conflicts'
  ];

  const rows = result.bestSchedule.map(item => {
    const duration = calculateDuration(item.startTime, item.endTime);
    const hasConflicts = result.violations.some(v => 
      v.affectedGenes.includes(result.bestSchedule.indexOf(item))
    );
    
    return [
      item.courseCode,
      item.courseName,
      item.facultyName,
      item.sectionName,
      item.roomCode,
      item.day,
      item.startTime,
      item.endTime,
      duration.toFixed(1),
      hasConflicts ? 'Yes' : 'No'
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Export schedule to JSON format
 */
export function exportScheduleToJSON(
  schedule: ScheduleItem[],
  filename: string = 'schedule.json'
): void {
  const jsonContent = JSON.stringify(schedule, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Export optimization result to JSON
 */
export function exportOptimizationResultToJSON(
  result: OptimizationResult,
  filename: string = 'optimization-result.json'
): void {
  const exportData = {
    schedule: result.bestSchedule,
    statistics: result.statistics,
    violations: result.violations,
    convergenceHistory: result.convergenceHistory,
    exportedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

// ============================================================================
// EXCEL EXPORT (CSV format compatible with Excel)
// ============================================================================

/**
 * Export schedule to Excel-compatible format
 */
export function exportScheduleToExcel(
  schedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[],
  filename: string = 'schedule.csv'
): void {
  const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);

  // Summary sheet data
  const summary = [
    ['SCHEDULE SUMMARY'],
    [''],
    ['Total Classes', schedule.length],
    ['Total Hours', analysis.totalHours.toFixed(2)],
    ['Room Utilization', `${analysis.roomUtilization.utilizationRate.toFixed(1)}%`],
    ['Average Faculty Load', `${analysis.facultyWorkload.averageHours.toFixed(1)} hours`],
    ['Workload Balance', `${analysis.facultyWorkload.workloadBalance.toFixed(1)}/100`],
    ['Quality Score', `${analysis.quality.overallScore.toFixed(1)}/100`],
    ['Total Conflicts', analysis.conflicts.totalConflicts],
    [''],
    ['SCHEDULE DETAILS'],
    [''],
    [
      'Course Code',
      'Course Name',
      'Faculty',
      'Section',
      'Room',
      'Building',
      'Day',
      'Start Time',
      'End Time',
      'Duration (hours)'
    ],
  ];

  const scheduleRows = schedule.map(item => {
    const course = courses.find(c => c.id === item.courseId);
    const room = rooms.find(r => r.id === item.roomId);
    const duration = calculateDuration(item.startTime, item.endTime);
    
    return [
      item.courseCode,
      item.courseName,
      item.facultyName,
      item.sectionName,
      item.roomCode,
      room?.building || '',
      item.day,
      item.startTime,
      item.endTime,
      duration.toFixed(1)
    ];
  });

  const csvContent = [
    ...summary,
    ...scheduleRows
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

// ============================================================================
// PDF-READY HTML EXPORT
// ============================================================================

/**
 * Export schedule as HTML (can be printed to PDF)
 */
export function exportScheduleToHTML(
  schedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[],
  filename: string = 'schedule.html'
): void {
  const analysis = analyzeSchedule(schedule, courses, faculty, rooms, sections);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schedule Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      border-bottom: 2px solid #ddd;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #2563eb;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .summary-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 14px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .conflict {
      background-color: #fee;
      color: #c00;
    }
    @media print {
      body {
        margin: 20px;
      }
      .summary {
        page-break-inside: avoid;
      }
      table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <h1>SchedulaPro - Schedule Report</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>

  <h2>Summary Statistics</h2>
  <div class="summary">
    <div class="summary-card">
      <h3>Total Classes</h3>
      <div class="value">${schedule.length}</div>
    </div>
    <div class="summary-card">
      <h3>Total Hours</h3>
      <div class="value">${analysis.totalHours.toFixed(1)}h</div>
    </div>
    <div class="summary-card">
      <h3>Quality Score</h3>
      <div class="value">${analysis.quality.overallScore.toFixed(1)}/100</div>
    </div>
    <div class="summary-card">
      <h3>Room Utilization</h3>
      <div class="value">${analysis.roomUtilization.utilizationRate.toFixed(1)}%</div>
    </div>
    <div class="summary-card">
      <h3>Avg Faculty Load</h3>
      <div class="value">${analysis.facultyWorkload.averageHours.toFixed(1)}h</div>
    </div>
    <div class="summary-card">
      <h3>Total Conflicts</h3>
      <div class="value ${analysis.conflicts.totalConflicts > 0 ? 'conflict' : ''}">
        ${analysis.conflicts.totalConflicts}
      </div>
    </div>
  </div>

  <h2>Schedule Details</h2>
  <table>
    <thead>
      <tr>
        <th>Course</th>
        <th>Faculty</th>
        <th>Section</th>
        <th>Room</th>
        <th>Day</th>
        <th>Time</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      ${schedule.map(item => {
        const duration = calculateDuration(item.startTime, item.endTime);
        return `
          <tr>
            <td><strong>${item.courseCode}</strong><br/>${item.courseName}</td>
            <td>${item.facultyName}</td>
            <td>${item.sectionName}</td>
            <td>${item.roomCode}</td>
            <td>${item.day}</td>
            <td>${item.startTime} - ${item.endTime}</td>
            <td>${duration.toFixed(1)}h</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  ${analysis.conflicts.totalConflicts > 0 ? `
    <h2>Conflicts Detected</h2>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Room Conflicts</td>
          <td>${analysis.conflicts.roomConflicts}</td>
        </tr>
        <tr>
          <td>Faculty Conflicts</td>
          <td>${analysis.conflicts.facultyConflicts}</td>
        </tr>
        <tr>
          <td>Section Conflicts</td>
          <td>${analysis.conflicts.sectionConflicts}</td>
        </tr>
        <tr>
          <td>Capacity Violations</td>
          <td>${analysis.conflicts.capacityViolations}</td>
        </tr>
      </tbody>
    </table>
  ` : ''}

  <h2>Room Utilization</h2>
  <table>
    <thead>
      <tr>
        <th>Room</th>
        <th>Usage Count</th>
      </tr>
    </thead>
    <tbody>
      ${analysis.roomUtilization.mostUsedRooms.map(room => `
        <tr>
          <td>${room.roomCode}</td>
          <td>${room.count}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Faculty Workload</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Average Hours</td>
        <td>${analysis.facultyWorkload.averageHours.toFixed(2)}h</td>
      </tr>
      <tr>
        <td>Min Hours</td>
        <td>${analysis.facultyWorkload.minHours.toFixed(2)}h</td>
      </tr>
      <tr>
        <td>Max Hours</td>
        <td>${analysis.facultyWorkload.maxHours.toFixed(2)}h</td>
      </tr>
      <tr>
        <td>Workload Balance</td>
        <td>${analysis.facultyWorkload.workloadBalance.toFixed(1)}/100</td>
      </tr>
    </tbody>
  </table>

  ${analysis.facultyWorkload.overloadedFaculty.length > 0 ? `
    <h2>Overloaded Faculty</h2>
    <table>
      <thead>
        <tr>
          <th>Faculty Name</th>
          <th>Assigned Hours</th>
          <th>Max Load</th>
          <th>Excess</th>
        </tr>
      </thead>
      <tbody>
        ${analysis.facultyWorkload.overloadedFaculty.map(f => `
          <tr class="conflict">
            <td>${f.name}</td>
            <td>${f.hours.toFixed(1)}h</td>
            <td>${f.maxLoad}h</td>
            <td>${(f.hours - f.maxLoad).toFixed(1)}h</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  <hr style="margin-top: 40px; border: none; border-top: 2px solid #ddd;">
  <p style="text-align: center; color: #666; font-size: 12px;">
    Generated by SchedulaPro - Enterprise Classroom Scheduling System
  </p>
</body>
</html>
  `;

  downloadFile(html, filename, 'text/html');
}

// ============================================================================
// OPTIMIZATION COMPARISON EXPORT
// ============================================================================

/**
 * Export before/after optimization comparison
 */
export function exportOptimizationComparison(
  originalSchedule: ScheduleItem[],
  optimizedSchedule: ScheduleItem[],
  result: OptimizationResult,
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[],
  filename: string = 'optimization-comparison.csv'
): void {
  const originalAnalysis = analyzeSchedule(originalSchedule, courses, faculty, rooms, sections);
  const optimizedAnalysis = analyzeSchedule(optimizedSchedule, courses, faculty, rooms, sections);

  const comparisonData = [
    ['OPTIMIZATION COMPARISON REPORT'],
    [''],
    ['Metric', 'Original', 'Optimized', 'Change'],
    ['Total Classes', originalSchedule.length, optimizedSchedule.length, ''],
    ['Quality Score', originalAnalysis.quality.overallScore.toFixed(1), optimizedAnalysis.quality.overallScore.toFixed(1), `${result.statistics.improvement.toFixed(1)}%`],
    ['Total Conflicts', originalAnalysis.conflicts.totalConflicts, optimizedAnalysis.conflicts.totalConflicts, (originalAnalysis.conflicts.totalConflicts - optimizedAnalysis.conflicts.totalConflicts).toString()],
    ['Room Utilization', `${originalAnalysis.roomUtilization.utilizationRate.toFixed(1)}%`, `${optimizedAnalysis.roomUtilization.utilizationRate.toFixed(1)}%`, `${(optimizedAnalysis.roomUtilization.utilizationRate - originalAnalysis.roomUtilization.utilizationRate).toFixed(1)}%`],
    ['Avg Faculty Load', `${originalAnalysis.facultyWorkload.averageHours.toFixed(1)}h`, `${optimizedAnalysis.facultyWorkload.averageHours.toFixed(1)}h`, `${(optimizedAnalysis.facultyWorkload.averageHours - originalAnalysis.facultyWorkload.averageHours).toFixed(1)}h`],
    ['Workload Balance', originalAnalysis.facultyWorkload.workloadBalance.toFixed(1), optimizedAnalysis.facultyWorkload.workloadBalance.toFixed(1), `${(optimizedAnalysis.facultyWorkload.workloadBalance - originalAnalysis.facultyWorkload.workloadBalance).toFixed(1)}`],
    ['Overloaded Faculty', originalAnalysis.facultyWorkload.overloadedFaculty.length, optimizedAnalysis.facultyWorkload.overloadedFaculty.length, (originalAnalysis.facultyWorkload.overloadedFaculty.length - optimizedAnalysis.facultyWorkload.overloadedFaculty.length).toString()],
    [''],
    ['OPTIMIZATION STATISTICS'],
    [''],
    ['Generations', result.generations],
    ['Execution Time', `${(result.statistics.executionTimeMs / 1000).toFixed(2)}s`],
    ['Initial Fitness', result.statistics.initialFitness.toFixed(0)],
    ['Final Fitness', result.statistics.finalFitness.toFixed(0)],
    ['Hard Violations', result.statistics.hardViolations],
    ['Soft Violations', result.statistics.softViolations],
  ];

  const csvContent = comparisonData
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate duration between two times
 */
function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return (endTotalMinutes - startTotalMinutes) / 60;
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// BATCH EXPORT
// ============================================================================

/**
 * Export all formats at once
 */
export function exportAllFormats(
  schedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[],
  baseFilename: string = 'schedule'
): void {
  exportScheduleToCSV(schedule, `${baseFilename}.csv`);
  exportScheduleToJSON(schedule, `${baseFilename}.json`);
  exportScheduleToHTML(schedule, courses, faculty, rooms, sections, `${baseFilename}.html`);
}
