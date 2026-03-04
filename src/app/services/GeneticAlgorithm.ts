/**
 * Hybrid Genetic Algorithm for Classroom Scheduling Optimization
 * 
 * This module implements a sophisticated hybrid genetic algorithm that combines:
 * - Traditional genetic algorithm operators (selection, crossover, mutation)
 * - Local search optimization (hill climbing)
 * - Constraint satisfaction techniques
 * - Multi-objective optimization (conflicting goals balance)
 * 
 * The algorithm optimizes schedules based on:
 * - Hard constraints: No room conflicts, faculty overlaps, section clashes
 * - Soft constraints: Faculty preferences, room utilization, student convenience
 * - Optimization goals: Minimize gaps, balanced workload, efficient space usage
 */

import type { ScheduleItem, Course, Faculty, Room, Section, DayOfWeek } from '../types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface GAConfig {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  elitismRate: number;
  tournamentSize: number;
  localSearchIterations: number;
  hybridActivationGeneration: number;
}

export interface ScheduleConstraints {
  workDays: DayOfWeek[];
  timeSlots: string[];
  maxConsecutiveHours: number;
  minBreakMinutes: number;
  preferredRoomTypes: Map<string, string[]>; // courseId -> room types
  facultyPreferences: Map<string, FacultyPreference>;
}

export interface FacultyPreference {
  preferredDays?: DayOfWeek[];
  avoidDays?: DayOfWeek[];
  preferredTimeSlots?: string[];
  avoidTimeSlots?: string[];
  maxDailyLoad?: number;
}

export interface Chromosome {
  genes: Gene[];
  fitness: number;
  violations: ConstraintViolation[];
}

export interface Gene {
  scheduleItem: ScheduleItem;
  allele: TimeSlotAllele;
}

export interface TimeSlotAllele {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  roomId: string;
}

export interface ConstraintViolation {
  type: 'hard' | 'soft';
  category: 'room_conflict' | 'faculty_overlap' | 'section_clash' | 
            'capacity_exceeded' | 'room_type_mismatch' | 'faculty_overload' |
            'poor_distribution' | 'excessive_gaps' | 'preference_violation';
  severity: number; // 0-100
  message: string;
  affectedGenes: number[]; // indices
}

export interface OptimizationResult {
  bestSchedule: ScheduleItem[];
  fitness: number;
  violations: ConstraintViolation[];
  generations: number;
  convergenceHistory: number[];
  statistics: OptimizationStatistics;
}

export interface OptimizationStatistics {
  initialFitness: number;
  finalFitness: number;
  improvement: number;
  hardViolations: number;
  softViolations: number;
  roomUtilization: number;
  averageFacultyLoad: number;
  averageGapsPerDay: number;
  executionTimeMs: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_GA_CONFIG: GAConfig = {
  populationSize: 100,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.15,
  elitismRate: 0.1,
  tournamentSize: 5,
  localSearchIterations: 10,
  hybridActivationGeneration: 50,
};

// ============================================================================
// HYBRID GENETIC ALGORITHM CLASS
// ============================================================================

export class HybridGeneticAlgorithm {
  private config: GAConfig;
  private constraints: ScheduleConstraints;
  private courses: Course[];
  private faculty: Faculty[];
  private rooms: Room[];
  private sections: Section[];
  private population: Chromosome[] = [];
  private bestChromosome: Chromosome | null = null;
  private convergenceHistory: number[] = [];

  constructor(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    sections: Section[],
    constraints: ScheduleConstraints,
    config: Partial<GAConfig> = {}
  ) {
    this.config = { ...DEFAULT_GA_CONFIG, ...config };
    this.constraints = constraints;
    this.courses = courses;
    this.faculty = faculty;
    this.rooms = rooms;
    this.sections = sections;
  }

  // ============================================================================
  // MAIN OPTIMIZATION FUNCTION
  // ============================================================================

  public optimize(existingSchedule: ScheduleItem[]): OptimizationResult {
    const startTime = performance.now();
    
    // Initialize population
    this.initializePopulation(existingSchedule);
    
    // Track initial fitness
    const initialBest = this.getBestChromosome();
    const initialFitness = initialBest.fitness;
    this.convergenceHistory.push(initialFitness);

    // Evolutionary loop
    for (let generation = 0; generation < this.config.generations; generation++) {
      // Selection
      const parents = this.selection();
      
      // Crossover
      const offspring = this.crossover(parents);
      
      // Mutation
      this.mutation(offspring);
      
      // Local Search (Hybrid Component) - activated after certain generation
      if (generation >= this.config.hybridActivationGeneration) {
        this.localSearch(offspring);
      }
      
      // Evaluation
      offspring.forEach(child => {
        this.evaluateFitness(child);
      });
      
      // Elitism + Replacement
      this.replacement(offspring);
      
      // Track convergence
      const currentBest = this.getBestChromosome();
      this.convergenceHistory.push(currentBest.fitness);
      
      // Early stopping if converged
      if (this.hasConverged(generation)) {
        console.log(`Converged at generation ${generation}`);
        break;
      }
    }

    const endTime = performance.now();
    const finalBest = this.getBestChromosome();

    // Build result
    return {
      bestSchedule: this.chromosomeToScheduleItems(finalBest),
      fitness: finalBest.fitness,
      violations: finalBest.violations,
      generations: this.convergenceHistory.length,
      convergenceHistory: this.convergenceHistory,
      statistics: this.calculateStatistics(initialFitness, finalBest, endTime - startTime),
    };
  }

  // ============================================================================
  // POPULATION INITIALIZATION
  // ============================================================================

  private initializePopulation(existingSchedule: ScheduleItem[]): void {
    this.population = [];

    // First chromosome: existing schedule (seeding with current solution)
    if (existingSchedule.length > 0) {
      const seedChromosome = this.scheduleItemsToChromosome(existingSchedule);
      this.evaluateFitness(seedChromosome);
      this.population.push(seedChromosome);
    }

    // Generate random chromosomes
    while (this.population.length < this.config.populationSize) {
      const chromosome = this.generateRandomChromosome(existingSchedule);
      this.evaluateFitness(chromosome);
      this.population.push(chromosome);
    }
  }

  private generateRandomChromosome(template: ScheduleItem[]): Chromosome {
    const genes: Gene[] = template.map(item => ({
      scheduleItem: { ...item },
      allele: this.generateRandomAllele(item),
    }));

    return {
      genes,
      fitness: 0,
      violations: [],
    };
  }

  private generateRandomAllele(item: ScheduleItem): TimeSlotAllele {
    const day = this.constraints.workDays[
      Math.floor(Math.random() * this.constraints.workDays.length)
    ];
    
    const timeSlot = this.constraints.timeSlots[
      Math.floor(Math.random() * this.constraints.timeSlots.length)
    ];
    
    const [startTime, endTime] = this.parseTimeSlot(timeSlot);
    
    const eligibleRooms = this.getEligibleRooms(item.courseId);
    const roomId = eligibleRooms[
      Math.floor(Math.random() * eligibleRooms.length)
    ].id;

    return { day, startTime, endTime, roomId };
  }

  // ============================================================================
  // SELECTION
  // ============================================================================

  private selection(): Chromosome[] {
    const parents: Chromosome[] = [];
    const numParents = Math.floor(this.config.populationSize * this.config.crossoverRate);

    for (let i = 0; i < numParents; i++) {
      const parent = this.tournamentSelection();
      parents.push(parent);
    }

    return parents;
  }

  private tournamentSelection(): Chromosome {
    const tournament: Chromosome[] = [];
    
    for (let i = 0; i < this.config.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }

    // Return the fittest from tournament
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  // ============================================================================
  // CROSSOVER
  // ============================================================================

  private crossover(parents: Chromosome[]): Chromosome[] {
    const offspring: Chromosome[] = [];

    for (let i = 0; i < parents.length - 1; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1];

      if (Math.random() < this.config.crossoverRate) {
        const [child1, child2] = this.uniformCrossover(parent1, parent2);
        offspring.push(child1, child2);
      } else {
        offspring.push(this.cloneChromosome(parent1), this.cloneChromosome(parent2));
      }
    }

    return offspring;
  }

  private uniformCrossover(parent1: Chromosome, parent2: Chromosome): [Chromosome, Chromosome] {
    const child1: Chromosome = { genes: [], fitness: 0, violations: [] };
    const child2: Chromosome = { genes: [], fitness: 0, violations: [] };

    const minLength = Math.min(parent1.genes.length, parent2.genes.length);

    for (let i = 0; i < minLength; i++) {
      if (Math.random() < 0.5) {
        child1.genes.push({ ...parent1.genes[i] });
        child2.genes.push({ ...parent2.genes[i] });
      } else {
        child1.genes.push({ ...parent2.genes[i] });
        child2.genes.push({ ...parent1.genes[i] });
      }
    }

    return [child1, child2];
  }

  // ============================================================================
  // MUTATION
  // ============================================================================

  private mutation(offspring: Chromosome[]): void {
    offspring.forEach(chromosome => {
      chromosome.genes.forEach((gene, index) => {
        if (Math.random() < this.config.mutationRate) {
          this.mutateGene(gene, chromosome, index);
        }
      });
    });
  }

  private mutateGene(gene: Gene, chromosome: Chromosome, index: number): void {
    const mutationType = Math.random();

    if (mutationType < 0.25) {
      // Mutate day
      gene.allele.day = this.constraints.workDays[
        Math.floor(Math.random() * this.constraints.workDays.length)
      ];
    } else if (mutationType < 0.5) {
      // Mutate time slot
      const timeSlot = this.constraints.timeSlots[
        Math.floor(Math.random() * this.constraints.timeSlots.length)
      ];
      [gene.allele.startTime, gene.allele.endTime] = this.parseTimeSlot(timeSlot);
    } else if (mutationType < 0.75) {
      // Mutate room
      const eligibleRooms = this.getEligibleRooms(gene.scheduleItem.courseId);
      const room = eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)];
      gene.allele.roomId = room.id;
    } else {
      // Swap mutation: swap with another gene
      const swapIndex = Math.floor(Math.random() * chromosome.genes.length);
      if (swapIndex !== index) {
        const temp = { ...gene.allele };
        gene.allele = { ...chromosome.genes[swapIndex].allele };
        chromosome.genes[swapIndex].allele = temp;
      }
    }
  }

  // ============================================================================
  // LOCAL SEARCH (HYBRID COMPONENT)
  // ============================================================================

  private localSearch(offspring: Chromosome[]): void {
    offspring.forEach(chromosome => {
      for (let i = 0; i < this.config.localSearchIterations; i++) {
        const improved = this.hillClimbing(chromosome);
        if (!improved) break; // Local optimum reached
      }
    });
  }

  private hillClimbing(chromosome: Chromosome): boolean {
    const currentFitness = chromosome.fitness;
    let bestNeighbor: Chromosome | null = null;
    let bestFitness = currentFitness;

    // Generate neighbors by small modifications
    for (let i = 0; i < 5; i++) {
      const neighbor = this.cloneChromosome(chromosome);
      
      // Make small random change
      const geneIndex = Math.floor(Math.random() * neighbor.genes.length);
      this.mutateGene(neighbor.genes[geneIndex], neighbor, geneIndex);
      
      this.evaluateFitness(neighbor);
      
      if (neighbor.fitness > bestFitness) {
        bestFitness = neighbor.fitness;
        bestNeighbor = neighbor;
      }
    }

    // If improvement found, replace current
    if (bestNeighbor && bestFitness > currentFitness) {
      chromosome.genes = bestNeighbor.genes;
      chromosome.fitness = bestNeighbor.fitness;
      chromosome.violations = bestNeighbor.violations;
      return true;
    }

    return false;
  }

  // ============================================================================
  // FITNESS EVALUATION
  // ============================================================================

  private evaluateFitness(chromosome: Chromosome): void {
    const violations: ConstraintViolation[] = [];
    let hardPenalty = 0;
    let softPenalty = 0;

    // Check hard constraints
    hardPenalty += this.checkRoomConflicts(chromosome, violations);
    hardPenalty += this.checkFacultyOverlaps(chromosome, violations);
    hardPenalty += this.checkSectionClashes(chromosome, violations);
    hardPenalty += this.checkRoomCapacity(chromosome, violations);
    hardPenalty += this.checkRoomTypeMismatch(chromosome, violations);

    // Check soft constraints
    softPenalty += this.checkFacultyPreferences(chromosome, violations);
    softPenalty += this.checkTimeDistribution(chromosome, violations);
    softPenalty += this.checkGapMinimization(chromosome, violations);
    softPenalty += this.checkFacultyLoad(chromosome, violations);

    chromosome.violations = violations;

    // Fitness calculation (higher is better)
    // Hard violations are heavily penalized
    const hardWeight = 1000;
    const softWeight = 100;
    const maxFitness = 10000;

    chromosome.fitness = maxFitness - (hardPenalty * hardWeight + softPenalty * softWeight);
  }

  private checkRoomConflicts(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const item1 = schedule[i];
        const item2 = schedule[j];

        if (item1.day === item2.day && item1.roomId === item2.roomId) {
          if (this.timeOverlaps(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
            violations.push({
              type: 'hard',
              category: 'room_conflict',
              severity: 100,
              message: `Room ${item1.roomCode} conflict on ${item1.day}`,
              affectedGenes: [i, j],
            });
            penalty += 10;
          }
        }
      }
    }

    return penalty;
  }

  private checkFacultyOverlaps(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const item1 = schedule[i];
        const item2 = schedule[j];

        if (item1.day === item2.day && item1.facultyId === item2.facultyId) {
          if (this.timeOverlaps(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
            violations.push({
              type: 'hard',
              category: 'faculty_overlap',
              severity: 100,
              message: `Faculty ${item1.facultyName} overlap on ${item1.day}`,
              affectedGenes: [i, j],
            });
            penalty += 10;
          }
        }
      }
    }

    return penalty;
  }

  private checkSectionClashes(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        const item1 = schedule[i];
        const item2 = schedule[j];

        if (item1.day === item2.day && item1.sectionId === item2.sectionId) {
          if (this.timeOverlaps(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) {
            violations.push({
              type: 'hard',
              category: 'section_clash',
              severity: 90,
              message: `Section ${item1.sectionName} clash on ${item1.day}`,
              affectedGenes: [i, j],
            });
            penalty += 8;
          }
        }
      }
    }

    return penalty;
  }

  private checkRoomCapacity(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    schedule.forEach((item, index) => {
      const room = this.rooms.find(r => r.id === item.roomId);
      const section = this.sections.find(s => s.id === item.sectionId);

      if (room && section && section.studentCount > room.capacity) {
        violations.push({
          type: 'hard',
          category: 'capacity_exceeded',
          severity: 95,
          message: `Room ${room.code} capacity (${room.capacity}) exceeded by section ${section.code} (${section.studentCount})`,
          affectedGenes: [index],
        });
        penalty += 5;
      }
    });

    return penalty;
  }

  private checkRoomTypeMismatch(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    schedule.forEach((item, index) => {
      const course = this.courses.find(c => c.id === item.courseId);
      const room = this.rooms.find(r => r.id === item.roomId);

      if (course && room) {
        if (course.requiresLab && room.type === 'lecture') {
          violations.push({
            type: 'hard',
            category: 'room_type_mismatch',
            severity: 85,
            message: `Course ${course.code} requires lab but assigned to lecture room ${room.code}`,
            affectedGenes: [index],
          });
          penalty += 4;
        }
      }
    });

    return penalty;
  }

  private checkFacultyPreferences(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    schedule.forEach((item, index) => {
      const faculty = this.faculty.find(f => f.id === item.facultyId);
      const profile = faculty?.profile;
      const preferences = this.constraints.facultyPreferences.get(item.facultyId);
      
      // Enhanced Profile-Based Preferences
      if (profile) {
        // Check unavailable time slots (HARD CONSTRAINT)
        const isUnavailable = profile.unavailableSlots.some(slot => 
          slot.day === item.day && 
          this.timeOverlaps(item.startTime, item.endTime, slot.startTime, slot.endTime)
        );
        if (isUnavailable) {
          violations.push({
            type: 'hard',
            category: 'faculty_unavailable',
            severity: 100,
            message: `Faculty ${item.facultyName} is unavailable on ${item.day} at ${item.startTime}`,
            affectedGenes: [index],
          });
          penalty += 15; // Heavy penalty for unavailability
        }

        // Check course preferences (weighted)
        const course = this.courses.find(c => c.id === item.courseId);
        if (course) {
          const coursePref = profile.preferredCourses.find(p => p.courseId === course.id);
          if (coursePref) {
            // Reward preferred courses (negative penalty = bonus)
            penalty -= coursePref.weight * 0.1;
          } else if (profile.preferredCourses.length > 0) {
            // Slight penalty for non-preferred courses
            violations.push({
              type: 'soft',
              category: 'preference_violation',
              severity: 20,
              message: `Course ${course.code} is not in ${item.facultyName}'s preferred list`,
              affectedGenes: [index],
            });
            penalty += 0.5;
          }
        }

        // Check preferred days
        if (profile.preferredDays.length > 0 && !profile.preferredDays.includes(item.day)) {
          violations.push({
            type: 'soft',
            category: 'preference_violation',
            severity: 30,
            message: `Faculty ${item.facultyName} prefers not to teach on ${item.day}`,
            affectedGenes: [index],
          });
          penalty += 1;
        }

        // Check time preferences (morning/afternoon)
        const hour = parseInt(item.startTime.split(':')[0]);
        if (profile.preferMorning && hour >= 13) {
          violations.push({
            type: 'soft',
            category: 'preference_violation',
            severity: 25,
            message: `Faculty ${item.facultyName} prefers morning classes`,
            affectedGenes: [index],
          });
          penalty += 0.8;
        }
        if (profile.preferAfternoon && hour < 13) {
          violations.push({
            type: 'soft',
            category: 'preference_violation',
            severity: 25,
            message: `Faculty ${item.facultyName} prefers afternoon classes`,
            affectedGenes: [index],
          });
          penalty += 0.8;
        }

        // Check room type preferences
        const room = this.rooms.find(r => r.id === item.roomId);
        if (room && profile.preferredRoomTypes.length > 0) {
          if (!profile.preferredRoomTypes.includes(room.type)) {
            violations.push({
              type: 'soft',
              category: 'preference_violation',
              severity: 15,
              message: `Faculty ${item.facultyName} prefers different room type`,
              affectedGenes: [index],
            });
            penalty += 0.3;
          }
        }

        // Check building preferences
        if (room && profile.preferSpecificBuildings.length > 0) {
          if (!profile.preferSpecificBuildings.includes(room.building)) {
            violations.push({
              type: 'soft',
              category: 'preference_violation',
              severity: 10,
              message: `Faculty ${item.facultyName} prefers ${profile.preferSpecificBuildings.join(', ')} building(s)`,
              affectedGenes: [index],
            });
            penalty += 0.2;
          }
        }

        // Check avoided rooms
        if (room && profile.avoidSpecificRooms.includes(room.id)) {
          violations.push({
            type: 'soft',
            category: 'preference_violation',
            severity: 40,
            message: `Faculty ${item.facultyName} prefers to avoid room ${room.code}`,
            affectedGenes: [index],
          });
          penalty += 1.5;
        }
      }

      // Legacy preferences support
      if (preferences) {
        if (preferences.avoidDays?.includes(item.day)) {
          violations.push({
            type: 'soft',
            category: 'preference_violation',
            severity: 50,
            message: `Faculty ${item.facultyName} prefers to avoid ${item.day}`,
            affectedGenes: [index],
          });
          penalty += 2;
        }

        if (preferences.avoidTimeSlots?.some(slot => this.timeInSlot(item.startTime, slot))) {
          violations.push({
            type: 'soft',
            category: 'preference_violation',
            severity: 40,
            message: `Faculty ${item.facultyName} prefers to avoid this time slot`,
            affectedGenes: [index],
          });
          penalty += 1;
        }
      }
    });

    // Check workload preferences and constraints
    penalty += this.checkFacultyWorkloadPreferences(chromosome, violations);
    
    // Check teaching constraints (no back-to-back, max daily hours, etc.)
    penalty += this.checkFacultyTeachingConstraints(chromosome, violations);

    return penalty;
  }

  private checkFacultyWorkloadPreferences(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);
    
    // Group by faculty
    const facultySchedule = new Map<string, ScheduleItem[]>();
    schedule.forEach(item => {
      if (!facultySchedule.has(item.facultyId)) {
        facultySchedule.set(item.facultyId, []);
      }
      facultySchedule.get(item.facultyId)!.push(item);
    });

    facultySchedule.forEach((items, facultyId) => {
      const faculty = this.faculty.find(f => f.id === facultyId);
      const profile = faculty?.profile;

      if (!profile) return;

      // Calculate total hours
      let totalHours = 0;
      items.forEach(item => {
        const duration = this.calculateDuration(item.startTime, item.endTime);
        totalHours += duration / 60; // Convert to hours
      });

      // Add administrative and research hours
      if (profile.hasAdministrativeLoad && profile.administrativeHours) {
        totalHours += profile.administrativeHours;
      }
      if (profile.hasResearchLoad && profile.researchHours) {
        totalHours += profile.researchHours;
      }

      // Check against preferred range
      if (totalHours < profile.preferredMinHours) {
        violations.push({
          type: 'soft',
          category: 'workload_imbalance',
          severity: 35,
          message: `Faculty ${faculty?.name} has ${totalHours.toFixed(1)} hrs (min: ${profile.preferredMinHours})`,
          affectedGenes: [],
        });
        penalty += (profile.preferredMinHours - totalHours) * 0.2;
      }

      if (totalHours > profile.preferredMaxHours) {
        violations.push({
          type: 'soft',
          category: 'workload_imbalance',
          severity: 45,
          message: `Faculty ${faculty?.name} has ${totalHours.toFixed(1)} hrs (max: ${profile.preferredMaxHours})`,
          affectedGenes: [],
        });
        penalty += (totalHours - profile.preferredMaxHours) * 0.3;
      }

      // Check days per week preference
      const daysTeaching = new Set(items.map(i => i.day)).size;
      if (Math.abs(daysTeaching - profile.preferredDaysPerWeek) > 1) {
        violations.push({
          type: 'soft',
          category: 'preference_violation',
          severity: 20,
          message: `Faculty ${faculty?.name} teaching ${daysTeaching} days (prefers ${profile.preferredDaysPerWeek})`,
          affectedGenes: [],
        });
        penalty += Math.abs(daysTeaching - profile.preferredDaysPerWeek) * 0.3;
      }
    });

    return penalty;
  }

  private checkFacultyTeachingConstraints(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);
    
    // Group by faculty and day
    const facultyDaySchedule = new Map<string, Map<string, ScheduleItem[]>>();
    schedule.forEach(item => {
      if (!facultyDaySchedule.has(item.facultyId)) {
        facultyDaySchedule.set(item.facultyId, new Map());
      }
      const daySchedule = facultyDaySchedule.get(item.facultyId)!;
      if (!daySchedule.has(item.day)) {
        daySchedule.set(item.day, []);
      }
      daySchedule.get(item.day)!.push(item);
    });

    facultyDaySchedule.forEach((daySchedule, facultyId) => {
      const faculty = this.faculty.find(f => f.id === facultyId);
      const profile = faculty?.profile;

      if (!profile) return;

      daySchedule.forEach((items, day) => {
        // Sort by start time
        items.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Check max daily hours
        let dailyHours = 0;
        items.forEach(item => {
          dailyHours += this.calculateDuration(item.startTime, item.endTime) / 60;
        });

        if (dailyHours > profile.maxDailyHours) {
          violations.push({
            type: 'soft',
            category: 'constraint_violation',
            severity: 50,
            message: `Faculty ${faculty?.name} exceeds max daily hours on ${day} (${dailyHours.toFixed(1)}/${profile.maxDailyHours})`,
            affectedGenes: [],
          });
          penalty += (dailyHours - profile.maxDailyHours) * 0.5;
        }

        // Check back-to-back classes
        if (profile.noBackToBack) {
          for (let i = 0; i < items.length - 1; i++) {
            const breakMinutes = this.calculateDuration(items[i].endTime, items[i + 1].startTime);
            if (breakMinutes < profile.minBreakBetweenClasses) {
              violations.push({
                type: 'soft',
                category: 'constraint_violation',
                severity: 40,
                message: `Faculty ${faculty?.name} has insufficient break on ${day} (${breakMinutes}/${profile.minBreakBetweenClasses} min)`,
                affectedGenes: [],
              });
              penalty += (profile.minBreakBetweenClasses - breakMinutes) * 0.02;
            }
          }
        }

        // Check consecutive hours
        let maxConsecutive = 0;
        let currentConsecutive = 0;
        for (let i = 0; i < items.length; i++) {
          const duration = this.calculateDuration(items[i].startTime, items[i].endTime) / 60;
          if (i === 0) {
            currentConsecutive = duration;
          } else {
            const breakMinutes = this.calculateDuration(items[i - 1].endTime, items[i].startTime);
            if (breakMinutes < profile.minBreakBetweenClasses) {
              currentConsecutive += duration;
            } else {
              maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
              currentConsecutive = duration;
            }
          }
        }
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);

        if (maxConsecutive > profile.maxConsecutiveHours) {
          violations.push({
            type: 'soft',
            category: 'constraint_violation',
            severity: 45,
            message: `Faculty ${faculty?.name} exceeds max consecutive hours on ${day} (${maxConsecutive.toFixed(1)}/${profile.maxConsecutiveHours})`,
            affectedGenes: [],
          });
          penalty += (maxConsecutive - profile.maxConsecutiveHours) * 0.4;
        }
      });
    });

    return penalty;
  }

  private checkTimeDistribution(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);
    
    // Check for poor distribution across days
    const dayDistribution = new Map<DayOfWeek, number>();
    schedule.forEach(item => {
      dayDistribution.set(item.day, (dayDistribution.get(item.day) || 0) + 1);
    });

    const avgPerDay = schedule.length / this.constraints.workDays.length;
    dayDistribution.forEach((count, day) => {
      const deviation = Math.abs(count - avgPerDay);
      if (deviation > avgPerDay * 0.5) {
        violations.push({
          type: 'soft',
          category: 'poor_distribution',
          severity: 30,
          message: `Poor distribution on ${day}: ${count} classes vs average ${avgPerDay.toFixed(1)}`,
          affectedGenes: [],
        });
        penalty += deviation * 0.5;
      }
    });

    return penalty;
  }

  private checkGapMinimization(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    // Group by faculty and day
    const facultyDaySchedule = new Map<string, Map<DayOfWeek, ScheduleItem[]>>();
    
    schedule.forEach(item => {
      if (!facultyDaySchedule.has(item.facultyId)) {
        facultyDaySchedule.set(item.facultyId, new Map());
      }
      const dayMap = facultyDaySchedule.get(item.facultyId)!;
      if (!dayMap.has(item.day)) {
        dayMap.set(item.day, []);
      }
      dayMap.get(item.day)!.push(item);
    });

    // Calculate gaps
    facultyDaySchedule.forEach((dayMap, facultyId) => {
      dayMap.forEach((items, day) => {
        const sorted = items.sort((a, b) => 
          this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
        );

        for (let i = 0; i < sorted.length - 1; i++) {
          const gapMinutes = this.timeToMinutes(sorted[i + 1].startTime) - 
                            this.timeToMinutes(sorted[i].endTime);
          
          if (gapMinutes > 60) { // More than 1 hour gap
            const faculty = this.faculty.find(f => f.id === facultyId);
            violations.push({
              type: 'soft',
              category: 'excessive_gaps',
              severity: 45,
              message: `${faculty?.name} has ${gapMinutes} minute gap on ${day}`,
              affectedGenes: [],
            });
            penalty += gapMinutes / 60;
          }
        }
      });
    });

    return penalty;
  }

  private checkFacultyLoad(chromosome: Chromosome, violations: ConstraintViolation[]): number {
    let penalty = 0;
    const schedule = this.chromosomeToScheduleItems(chromosome);

    const facultyHours = new Map<string, number>();
    schedule.forEach(item => {
      const hours = (this.timeToMinutes(item.endTime) - this.timeToMinutes(item.startTime)) / 60;
      facultyHours.set(item.facultyId, (facultyHours.get(item.facultyId) || 0) + hours);
    });

    facultyHours.forEach((hours, facultyId) => {
      const faculty = this.faculty.find(f => f.id === facultyId);
      if (faculty && hours > faculty.maxLoad) {
        violations.push({
          type: 'hard',
          category: 'faculty_overload',
          severity: 90,
          message: `${faculty.name} overloaded: ${hours}h / ${faculty.maxLoad}h`,
          affectedGenes: [],
        });
        penalty += (hours - faculty.maxLoad) * 2;
      }
    });

    return penalty;
  }

  // ============================================================================
  // REPLACEMENT (ELITISM)
  // ============================================================================

  private replacement(offspring: Chromosome[]): void {
    // Sort population by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    // Keep elite individuals
    const eliteCount = Math.floor(this.config.populationSize * this.config.elitismRate);
    const elite = this.population.slice(0, eliteCount);
    
    // Combine elite with offspring
    const newPopulation = [...elite, ...offspring];
    
    // Sort and keep best individuals
    newPopulation.sort((a, b) => b.fitness - a.fitness);
    this.population = newPopulation.slice(0, this.config.populationSize);
  }

  // ============================================================================
  // CONVERGENCE CHECK
  // ============================================================================

  private hasConverged(generation: number): boolean {
    if (generation < 20) return false;
    
    const last20 = this.convergenceHistory.slice(-20);
    const variance = this.calculateVariance(last20);
    
    return variance < 0.01; // Very small improvement
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  private getBestChromosome(): Chromosome {
    return this.population.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  private cloneChromosome(chromosome: Chromosome): Chromosome {
    return {
      genes: chromosome.genes.map(g => ({ ...g, allele: { ...g.allele } })),
      fitness: chromosome.fitness,
      violations: [...chromosome.violations],
    };
  }

  private scheduleItemsToChromosome(items: ScheduleItem[]): Chromosome {
    const genes: Gene[] = items.map(item => ({
      scheduleItem: { ...item },
      allele: {
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        roomId: item.roomId,
      },
    }));

    return { genes, fitness: 0, violations: [] };
  }

  private chromosomeToScheduleItems(chromosome: Chromosome): ScheduleItem[] {
    return chromosome.genes.map(gene => {
      const room = this.rooms.find(r => r.id === gene.allele.roomId);
      return {
        ...gene.scheduleItem,
        day: gene.allele.day,
        startTime: gene.allele.startTime,
        endTime: gene.allele.endTime,
        roomId: gene.allele.roomId,
        roomCode: room?.code || gene.scheduleItem.roomCode,
      };
    });
  }

  private getEligibleRooms(courseId: string): Room[] {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return this.rooms;

    return this.rooms.filter(room => {
      if (course.requiresLab) {
        return room.type === 'laboratory' || room.type === 'hybrid';
      }
      return true;
    });
  }

  private parseTimeSlot(timeSlot: string): [string, string] {
    // Assumes format like "08:00-10:00"
    const [start, end] = timeSlot.split('-');
    return [start.trim(), end.trim()];
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && e1 > s2;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private timeInSlot(time: string, slot: string): boolean {
    const [slotStart, slotEnd] = this.parseTimeSlot(slot);
    const timeMin = this.timeToMinutes(time);
    const slotStartMin = this.timeToMinutes(slotStart);
    const slotEndMin = this.timeToMinutes(slotEnd);
    
    return timeMin >= slotStartMin && timeMin < slotEndMin;
  }

  private calculateStatistics(
    initialFitness: number,
    finalBest: Chromosome,
    executionTimeMs: number
  ): OptimizationStatistics {
    const schedule = this.chromosomeToScheduleItems(finalBest);
    
    // Count violations
    const hardViolations = finalBest.violations.filter(v => v.type === 'hard').length;
    const softViolations = finalBest.violations.filter(v => v.type === 'soft').length;

    // Calculate room utilization
    const totalSlots = this.constraints.workDays.length * this.constraints.timeSlots.length * this.rooms.length;
    const usedSlots = schedule.length;
    const roomUtilization = (usedSlots / totalSlots) * 100;

    // Calculate average faculty load
    const facultyHours = new Map<string, number>();
    schedule.forEach(item => {
      const hours = (this.timeToMinutes(item.endTime) - this.timeToMinutes(item.startTime)) / 60;
      facultyHours.set(item.facultyId, (facultyHours.get(item.facultyId) || 0) + hours);
    });
    const avgFacultyLoad = Array.from(facultyHours.values()).reduce((sum, h) => sum + h, 0) / 
                          (facultyHours.size || 1);

    // Calculate average gaps per day
    let totalGaps = 0;
    let totalDays = 0;
    const facultyDaySchedule = new Map<string, Map<DayOfWeek, ScheduleItem[]>>();
    
    schedule.forEach(item => {
      if (!facultyDaySchedule.has(item.facultyId)) {
        facultyDaySchedule.set(item.facultyId, new Map());
      }
      const dayMap = facultyDaySchedule.get(item.facultyId)!;
      if (!dayMap.has(item.day)) {
        dayMap.set(item.day, []);
      }
      dayMap.get(item.day)!.push(item);
    });

    facultyDaySchedule.forEach(dayMap => {
      dayMap.forEach(items => {
        totalDays++;
        const sorted = items.sort((a, b) => 
          this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
        );
        totalGaps += sorted.length > 1 ? sorted.length - 1 : 0;
      });
    });

    const avgGapsPerDay = totalDays > 0 ? totalGaps / totalDays : 0;

    return {
      initialFitness,
      finalFitness: finalBest.fitness,
      improvement: ((finalBest.fitness - initialFitness) / initialFitness) * 100,
      hardViolations,
      softViolations,
      roomUtilization,
      averageFacultyLoad: avgFacultyLoad,
      averageGapsPerDay: avgGapsPerDay,
      executionTimeMs,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createDefaultConstraints(
  rooms: Room[],
  faculty: Faculty[]
): ScheduleConstraints {
  return {
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: [
      '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00',
      '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
      '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00',
    ],
    maxConsecutiveHours: 4,
    minBreakMinutes: 15,
    preferredRoomTypes: new Map(),
    facultyPreferences: new Map(),
  };
}

export function optimizeSchedule(
  existingSchedule: ScheduleItem[],
  courses: Course[],
  faculty: Faculty[],
  rooms: Room[],
  sections: Section[],
  config?: Partial<GAConfig>
): OptimizationResult {
  const constraints = createDefaultConstraints(rooms, faculty);
  const ga = new HybridGeneticAlgorithm(courses, faculty, rooms, sections, constraints, config);
  return ga.optimize(existingSchedule);
}
