import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

import type { Schedule, Faculty, Room, Course, Section } from '../types';
import { mockSchedules, mockFaculty, mockRooms, mockCourses, mockSections } from '../data/mockData';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const API_BASE_URL = `${SUPABASE_URL}/functions/v1/make-server-f3e46fd1`;

// Create Supabase client for auth operations
const supabase = createClient(SUPABASE_URL, publicAnonKey);

class ApiService {
  private accessToken: string | null = null;
  private isDemoMode: boolean = false;

  constructor() {
    // Initialize demo mode from localStorage
    console.log('ApiService: Constructor called, initializing...');
    this.checkDemoMode();
  }

  private checkDemoMode() {
    const demoUser = localStorage.getItem('demo_user');
    this.isDemoMode = !!demoUser;
    console.log('ApiService: checkDemoMode', { isDemoMode: this.isDemoMode, demoUser: !!demoUser });
  }

  /* ===================== AUTH ===================== */

  async signup(email: string, password: string, name: string, role: string) {
    try {
      // Use Supabase Auth directly instead of backend endpoint
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }

      return data.user;
    } catch (error) {
      console.error('Signup error in ApiService:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.accessToken = data.session?.access_token || null;
      return data.session;
    } catch (error) {
      console.error('Sign in error in ApiService:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      // Only call Supabase if not in demo mode
      if (!this.isDemoMode) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      this.accessToken = null;
      this.isDemoMode = false;
    } catch (error) {
      console.error('Sign out error in ApiService:', error);
      throw error;
    }
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      this.accessToken = data.session?.access_token || null;
      return data.session;
    } catch (error) {
      console.error('Get session error in ApiService:', error);
      return null;
    }
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    this.isDemoMode = token === 'demo-token';
    console.log('ApiService: setAccessToken called', { token, isDemoMode: this.isDemoMode });
  }

  /* ===================== HELPERS ===================== */

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /* ===================== SCHEDULES ===================== */

  async getSchedules(): Promise<Schedule[]> {
    this.checkDemoMode(); // Refresh demo mode status
    if (this.isDemoMode) {
      console.log('ApiService: Returning mock schedules (demo mode)');
      return JSON.parse(JSON.stringify(mockSchedules));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ schedules: Schedule[] }>(response);
      return data.schedules;
    } catch (error) {
      console.error('Get schedules error in ApiService:', error);
      throw error;
    }
  }

  async getSchedule(id: string): Promise<Schedule> {
    if (this.isDemoMode) {
      return mockSchedules.find(s => s.id === id) as Schedule;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ schedule: Schedule }>(response);
      return data.schedule;
    } catch (error) {
      console.error('Get schedule error in ApiService:', error);
      throw error;
    }
  }

  async createSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    if (this.isDemoMode) {
      const newSchedule = { ...schedule, id: `demo-${mockSchedules.length + 1}` } as Schedule;
      mockSchedules.push(newSchedule);
      return newSchedule;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/schedules`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(schedule),
      });

      const data = await this.handleResponse<{ schedule: Schedule }>(response);
      return data.schedule;
    } catch (error) {
      console.error('Create schedule error in ApiService:', error);
      throw error;
    }
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    if (this.isDemoMode) {
      const index = mockSchedules.findIndex(s => s.id === id);
      if (index !== -1) {
        mockSchedules[index] = { ...mockSchedules[index], ...updates };
        return mockSchedules[index];
      }
      throw new Error('Schedule not found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await this.handleResponse<{ schedule: Schedule }>(response);
      return data.schedule;
    } catch (error) {
      console.error('Update schedule error in ApiService:', error);
      throw error;
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    if (this.isDemoMode) {
      const index = mockSchedules.findIndex(s => s.id === id);
      if (index !== -1) {
        mockSchedules.splice(index, 1);
      } else {
        throw new Error('Schedule not found');
      }
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Delete schedule error in ApiService:', error);
      throw error;
    }
  }

  /* ===================== FACULTY ===================== */

  async getFaculty(): Promise<Faculty[]> {
    this.checkDemoMode(); // Refresh demo mode status
    if (this.isDemoMode) {
      console.log('ApiService: Returning mock faculty (demo mode)');
      return JSON.parse(JSON.stringify(mockFaculty));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/faculty`, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ faculty: Faculty[] }>(response);
      return data.faculty;
    } catch (error) {
      console.error('Get faculty error in ApiService:', error);
      throw error;
    }
  }

  async createFaculty(faculty: Partial<Faculty>): Promise<Faculty> {
    if (this.isDemoMode) {
      const newFaculty = { ...faculty, id: `demo-${mockFaculty.length + 1}` } as Faculty;
      mockFaculty.push(newFaculty);
      return newFaculty;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/faculty`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(faculty),
      });

      const data = await this.handleResponse<{ faculty: Faculty }>(response);
      return data.faculty;
    } catch (error) {
      console.error('Create faculty error in ApiService:', error);
      throw error;
    }
  }

  async updateFaculty(id: string, updates: Partial<Faculty>): Promise<Faculty> {
    if (this.isDemoMode) {
      const index = mockFaculty.findIndex(f => f.id === id);
      if (index !== -1) {
        mockFaculty[index] = { ...mockFaculty[index], ...updates };
        return mockFaculty[index];
      }
      throw new Error('Faculty not found');
    }
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await this.handleResponse<{ faculty: Faculty }>(response);
      return data.faculty;
    } catch (error) {
      console.error('Update faculty error in ApiService:', error);
      throw error;
    }
  }

  async deleteFaculty(id: string): Promise<void> {
    if (this.isDemoMode) {
      const index = mockFaculty.findIndex(f => f.id === id);
      if (index !== -1) {
        mockFaculty.splice(index, 1);
      } else {
        throw new Error('Faculty not found');
      }
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Delete faculty error in ApiService:', error);
      throw error;
    }
  }

  /* ===================== ROOMS ===================== */

  async getRooms(): Promise<Room[]> {
    this.checkDemoMode(); // Refresh demo mode status
    if (this.isDemoMode) {
      console.log('ApiService: Returning mock rooms (demo mode)');
      return JSON.parse(JSON.stringify(mockRooms));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ rooms: Room[] }>(response);
      return data.rooms;
    } catch (error) {
      console.error('Get rooms error in ApiService:', error);
      throw error;
    }
  }

  /* ===================== COURSES ===================== */

  async getCourses(): Promise<Course[]> {
    this.checkDemoMode(); // Refresh demo mode status
    if (this.isDemoMode) {
      console.log('ApiService: Returning mock courses (demo mode)');
      return JSON.parse(JSON.stringify(mockCourses));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ courses: Course[] }>(response);
      return data.courses;
    } catch (error) {
      console.error('Get courses error in ApiService:', error);
      throw error;
    }
  }

  /* ===================== SECTIONS ===================== */

  async getSections(): Promise<Section[]> {
    this.checkDemoMode(); // Refresh demo mode status
    if (this.isDemoMode) {
      console.log('ApiService: Returning mock sections (demo mode)');
      return JSON.parse(JSON.stringify(mockSections));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/sections`, {
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ sections: Section[] }>(response);
      return data.sections;
    } catch (error) {
      console.error('Get sections error in ApiService:', error);
      throw error;
    }
  }

  /* ===================== INITIALIZATION ===================== */

  async initializeData(data: {
    rooms: Room[];
    courses: Course[];
    sections: Section[];
    faculty: Faculty[];
    schedules: Schedule[];
  }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      await this.handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      console.error('Initialize data error in ApiService:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();