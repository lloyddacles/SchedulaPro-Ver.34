import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client for auth and admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

/* ===================== MIDDLEWARE ===================== */

// Auth middleware
async function authMiddleware(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Auth error:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
}

/* ===================== HEALTH CHECK ===================== */

app.get("/make-server-f3e46fd1/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ===================== AUTH ROUTES ===================== */

app.post("/make-server-f3e46fd1/auth/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.post("/make-server-f3e46fd1/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ session: null });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ session: null });
    }

    return c.json({ 
      session: { 
        user,
        access_token: accessToken 
      } 
    });
  } catch (error) {
    console.log('Session check error:', error);
    return c.json({ session: null });
  }
});

/* ===================== SCHEDULES ===================== */

app.get("/make-server-f3e46fd1/schedules", authMiddleware, async (c) => {
  try {
    const schedules = await kv.getByPrefix('schedule:');
    return c.json({ schedules: schedules || [] });
  } catch (error) {
    console.log('Get schedules error:', error);
    return c.json({ error: 'Failed to fetch schedules' }, 500);
  }
});

app.get("/make-server-f3e46fd1/schedules/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const schedule = await kv.get(`schedule:${id}`);
    
    if (!schedule) {
      return c.json({ error: 'Schedule not found' }, 404);
    }
    
    return c.json({ schedule });
  } catch (error) {
    console.log('Get schedule error:', error);
    return c.json({ error: 'Failed to fetch schedule' }, 500);
  }
});

app.post("/make-server-f3e46fd1/schedules", authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const scheduleData = await c.req.json();
    
    const schedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
      createdBy: user.id,
      createdByName: user.user_metadata?.name || user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`schedule:${schedule.id}`, schedule);
    
    // Log audit trail
    await kv.set(`audit:${Date.now()}-${schedule.id}`, {
      action: 'create',
      entityType: 'schedule',
      entityId: schedule.id,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userRole: user.user_metadata?.role || 'unknown',
      timestamp: new Date().toISOString(),
      afterState: schedule,
    });

    return c.json({ schedule });
  } catch (error) {
    console.log('Create schedule error:', error);
    return c.json({ error: 'Failed to create schedule' }, 500);
  }
});

app.put("/make-server-f3e46fd1/schedules/:id", authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`schedule:${id}`);
    if (!existing) {
      return c.json({ error: 'Schedule not found' }, 404);
    }

    const schedule = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`schedule:${id}`, schedule);
    
    // Log audit trail
    await kv.set(`audit:${Date.now()}-${id}`, {
      action: 'update',
      entityType: 'schedule',
      entityId: id,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userRole: user.user_metadata?.role || 'unknown',
      timestamp: new Date().toISOString(),
      beforeState: existing,
      afterState: schedule,
    });

    return c.json({ schedule });
  } catch (error) {
    console.log('Update schedule error:', error);
    return c.json({ error: 'Failed to update schedule' }, 500);
  }
});

app.delete("/make-server-f3e46fd1/schedules/:id", authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const existing = await kv.get(`schedule:${id}`);
    if (!existing) {
      return c.json({ error: 'Schedule not found' }, 404);
    }

    await kv.del(`schedule:${id}`);
    
    // Log audit trail
    await kv.set(`audit:${Date.now()}-${id}`, {
      action: 'delete',
      entityType: 'schedule',
      entityId: id,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userRole: user.user_metadata?.role || 'unknown',
      timestamp: new Date().toISOString(),
      beforeState: existing,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete schedule error:', error);
    return c.json({ error: 'Failed to delete schedule' }, 500);
  }
});

/* ===================== FACULTY ===================== */

app.get("/make-server-f3e46fd1/faculty", authMiddleware, async (c) => {
  try {
    const faculty = await kv.getByPrefix('faculty:');
    return c.json({ faculty: faculty || [] });
  } catch (error) {
    console.log('Get faculty error:', error);
    return c.json({ error: 'Failed to fetch faculty' }, 500);
  }
});

app.post("/make-server-f3e46fd1/faculty", authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const facultyData = await c.req.json();
    
    const newFaculty = {
      ...facultyData,
      id: `fac-${Date.now()}`,
    };

    await kv.set(`faculty:${newFaculty.id}`, newFaculty);
    
    await kv.set(`audit:${Date.now()}-${newFaculty.id}`, {
      action: 'create',
      entityType: 'faculty',
      entityId: newFaculty.id,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userRole: user.user_metadata?.role || 'unknown',
      timestamp: new Date().toISOString(),
      afterState: newFaculty,
    });

    return c.json({ faculty: newFaculty });
  } catch (error) {
    console.log('Create faculty error:', error);
    return c.json({ error: 'Failed to create faculty' }, 500);
  }
});

app.put("/make-server-f3e46fd1/faculty/:id", authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`faculty:${id}`);
    if (!existing) {
      return c.json({ error: 'Faculty not found' }, 404);
    }

    const updatedFaculty = {
      ...existing,
      ...updates,
    };

    await kv.set(`faculty:${id}`, updatedFaculty);
    
    await kv.set(`audit:${Date.now()}-${id}`, {
      action: 'update',
      entityType: 'faculty',
      entityId: id,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userRole: user.user_metadata?.role || 'unknown',
      timestamp: new Date().toISOString(),
      beforeState: existing,
      afterState: updatedFaculty,
    });

    return c.json({ faculty: updatedFaculty });
  } catch (error) {
    console.log('Update faculty error:', error);
    return c.json({ error: 'Failed to update faculty' }, 500);
  }
});

app.delete("/make-server-f3e46fd1/faculty/:id", authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const existing = await kv.get(`faculty:${id}`);
    if (!existing) {
      return c.json({ error: 'Faculty not found' }, 404);
    }

    await kv.del(`faculty:${id}`);
    
    await kv.set(`audit:${Date.now()}-${id}`, {
      action: 'delete',
      entityType: 'faculty',
      entityId: id,
      userId: user.id,
      userName: user.user_metadata?.name || user.email,
      userRole: user.user_metadata?.role || 'unknown',
      timestamp: new Date().toISOString(),
      beforeState: existing,
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete faculty error:', error);
    return c.json({ error: 'Failed to delete faculty' }, 500);
  }
});

/* ===================== ROOMS ===================== */

app.get("/make-server-f3e46fd1/rooms", authMiddleware, async (c) => {
  try {
    const rooms = await kv.getByPrefix('room:');
    return c.json({ rooms: rooms || [] });
  } catch (error) {
    console.log('Get rooms error:', error);
    return c.json({ error: 'Failed to fetch rooms' }, 500);
  }
});

/* ===================== COURSES ===================== */

app.get("/make-server-f3e46fd1/courses", authMiddleware, async (c) => {
  try {
    const courses = await kv.getByPrefix('course:');
    return c.json({ courses: courses || [] });
  } catch (error) {
    console.log('Get courses error:', error);
    return c.json({ error: 'Failed to fetch courses' }, 500);
  }
});

/* ===================== SECTIONS ===================== */

app.get("/make-server-f3e46fd1/sections", authMiddleware, async (c) => {
  try {
    const sections = await kv.getByPrefix('section:');
    return c.json({ sections: sections || [] });
  } catch (error) {
    console.log('Get sections error:', error);
    return c.json({ error: 'Failed to fetch sections' }, 500);
  }
});

/* ===================== AUDIT LOGS ===================== */

app.get("/make-server-f3e46fd1/audit", authMiddleware, async (c) => {
  try {
    const logs = await kv.getByPrefix('audit:');
    return c.json({ logs: logs || [] });
  } catch (error) {
    console.log('Get audit logs error:', error);
    return c.json({ error: 'Failed to fetch audit logs' }, 500);
  }
});

/* ===================== INITIALIZE MOCK DATA ===================== */

app.post("/make-server-f3e46fd1/init", async (c) => {
  try {
    const { rooms, courses, sections, faculty, schedules } = await c.req.json();
    
    // Initialize rooms
    if (rooms && Array.isArray(rooms)) {
      for (const room of rooms) {
        await kv.set(`room:${room.id}`, room);
      }
    }
    
    // Initialize courses
    if (courses && Array.isArray(courses)) {
      for (const course of courses) {
        await kv.set(`course:${course.id}`, course);
      }
    }
    
    // Initialize sections
    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        await kv.set(`section:${section.id}`, section);
      }
    }
    
    // Initialize faculty
    if (faculty && Array.isArray(faculty)) {
      for (const fac of faculty) {
        await kv.set(`faculty:${fac.id}`, fac);
      }
    }
    
    // Initialize schedules
    if (schedules && Array.isArray(schedules)) {
      for (const schedule of schedules) {
        await kv.set(`schedule:${schedule.id}`, schedule);
      }
    }

    return c.json({ success: true, message: 'Data initialized successfully' });
  } catch (error) {
    console.log('Init data error:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

Deno.serve(app.fetch);