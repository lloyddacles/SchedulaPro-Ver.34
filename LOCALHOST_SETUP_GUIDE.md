# 🏠 SchedulaPro - Localhost Setup Guide

**Complete guide for running SchedulaPro on XAMPP/WAMP/Laragon or Node.js**

---

## 📋 Table of Contents

1. [Option 1: Pure Demo Mode (No Backend)](#option-1-pure-demo-mode)
2. [Option 2: XAMPP + PHP + MySQL](#option-2-xampp--php--mysql)
3. [Option 3: Node.js + Express + MySQL](#option-3-nodejs--express--mysql)
4. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Option 1: Pure Demo Mode (No Backend)

**⏱️ Setup Time:** 2 minutes  
**💰 Cost:** Free  
**🎯 Best For:** Quick demos, offline presentations, testing UI

### ✅ Advantages
- No backend setup required
- Works 100% offline
- Perfect for capstone presentations
- Zero configuration

### ❌ Limitations
- No multi-user support
- Data stored in browser (lost on clear)
- Each browser instance has separate data

### 📝 Setup Steps

#### Step 1: Download & Extract
1. Download SchedulaPro ZIP from Figma Make
2. Extract to any folder (e.g., `C:\schedulapro`)

#### Step 2: Install Dependencies
```bash
cd schedulapro
npm install
```

#### Step 3: Run Development Server
```bash
npm run dev
```

#### Step 4: Open in Browser
```
http://localhost:5173
```

#### Step 5: Sign Up (Demo Mode)
1. Click "Sign Up"
2. Enter any email: `demo@test.com`
3. Enter any password: `demo123`
4. Enter name: `Demo User`
5. Select role: `Program Head`
6. Click "Create Account"

**✅ Done! System is now running in demo mode.**

### 💾 Data Storage

All data is stored in browser localStorage:
- `demo_user` - User information
- `demo_token` - Authentication token
- Mock data is used for all features

### 🎓 For Presentations

This mode is PERFECT for:
- Capstone defenses
- Client demonstrations
- UI/UX testing
- Offline scenarios

---

## Option 2: XAMPP + PHP + MySQL

**⏱️ Setup Time:** 2-3 hours  
**💰 Cost:** Free  
**🎯 Best For:** Traditional localhost, schools teaching PHP, WAMP/XAMPP users

### Prerequisites

- Windows, Mac, or Linux
- XAMPP/WAMP/Laragon installed
- Basic PHP knowledge

### 📥 Install XAMPP

#### Windows
1. Download XAMPP from https://www.apachefriends.org
2. Install to `C:\xampp`
3. Run XAMPP Control Panel
4. Start **Apache** and **MySQL**

#### Mac
```bash
brew install --cask xampp
```

### 📊 Step 1: Create Database

1. Open http://localhost/phpmyadmin
2. Click "New" to create database
3. Database name: `schedulapro`
4. Collation: `utf8mb4_general_ci`
5. Click "Create"

### 📄 Step 2: Import Schema

Click "Import" and paste this SQL:

```sql
-- SchedulaPro Database Schema
CREATE DATABASE IF NOT EXISTS schedulapro;
USE schedulapro;

-- Users Table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('program_assistant', 'program_head', 'admin', 'faculty') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schedules Table
CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  program VARCHAR(255) NOT NULL,
  status ENUM('draft', 'pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
  created_by VARCHAR(36) NOT NULL,
  created_by_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_locked BOOLEAN DEFAULT FALSE,
  sent_to_faculty BOOLEAN DEFAULT FALSE,
  items JSON NOT NULL,
  conflicts JSON,
  approvals JSON,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Faculty Table
CREATE TABLE faculty (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(255) NOT NULL,
  max_load INT DEFAULT 24,
  specialization JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rooms Table
CREATE TABLE rooms (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('lecture', 'laboratory', 'both') NOT NULL,
  capacity INT NOT NULL,
  building VARCHAR(255),
  floor INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_capacity (capacity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Courses Table
CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  units INT NOT NULL,
  type ENUM('lecture', 'laboratory', 'both') NOT NULL,
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sections Table
CREATE TABLE sections (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  year_level INT NOT NULL,
  semester INT NOT NULL,
  program VARCHAR(255) NOT NULL,
  student_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_program (program),
  INDEX idx_year_level (year_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs Table
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  before_state JSON,
  after_state JSON,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user
-- Password: admin123
INSERT INTO users (id, email, password_hash, name, role) VALUES 
('admin-001', 'admin@schedulapro.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');
```

**✅ Database created!**

### 🗂️ Step 3: Create PHP Backend

Create folder structure:
```
C:\xampp\htdocs\schedulapro-api\
├── config\
│   └── database.php
├── api\
│   ├── auth\
│   │   ├── login.php
│   │   ├── signup.php
│   │   └── logout.php
│   ├── schedules\
│   │   ├── index.php
│   │   ├── create.php
│   │   └── update.php
│   ├── faculty\
│   │   └── index.php
│   ├── rooms\
│   │   └── index.php
│   ├── courses\
│   │   └── index.php
│   └── sections\
│       └── index.php
└── .htaccess
```

#### Create `config/database.php`

```php
<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'schedulapro');
define('DB_USER', 'root');
define('DB_PASS', ''); // XAMPP default has no password

// Create database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper function to require authentication
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized - Please login']);
        exit();
    }
}

// Helper function to get current user
function getCurrentUser() {
    global $pdo;
    if (!isset($_SESSION['user_id'])) return null;
    
    $stmt = $pdo->prepare("SELECT id, email, name, role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

// Helper function to generate UUID
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
?>
```

#### Create `api/auth/login.php`

```php
<?php
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit();
    }
    
    // Create session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_role'] = $user['role'];
    
    echo json_encode([
        'session' => [
            'access_token' => session_id(),
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
            ]
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
}
?>
```

#### Create `api/auth/signup.php`

```php
<?php
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$name = $data['name'] ?? '';
$role = $data['role'] ?? 'program_assistant';

if (empty($email) || empty($password) || empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'All fields required']);
    exit();
}

try {
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists']);
        exit();
    }
    
    // Create user
    $id = generateUUID();
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (id, email, password_hash, name, role) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$id, $email, $passwordHash, $name, $role]);
    
    // Auto login
    $_SESSION['user_id'] = $id;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_role'] = $role;
    
    echo json_encode([
        'session' => [
            'access_token' => session_id(),
            'user' => [
                'id' => $id,
                'email' => $email,
                'name' => $name,
                'role' => $role,
            ]
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Signup failed: ' . $e->getMessage()]);
}
?>
```

#### Create `api/schedules/index.php`

```php
<?php
require_once '../../config/database.php';

// GET - List all schedules
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
    
    try {
        $stmt = $pdo->query("SELECT * FROM schedules ORDER BY created_at DESC");
        $schedules = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach ($schedules as &$schedule) {
            $schedule['items'] = json_decode($schedule['items'], true);
            $schedule['conflicts'] = json_decode($schedule['conflicts'] ?? '[]', true);
            $schedule['approvals'] = json_decode($schedule['approvals'] ?? '[]', true);
            $schedule['is_locked'] = (bool)$schedule['is_locked'];
            $schedule['sent_to_faculty'] = (bool)$schedule['sent_to_faculty'];
        }
        
        echo json_encode(['schedules' => $schedules]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch schedules: ' . $e->getMessage()]);
    }
}

// POST - Create new schedule
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    
    $data = json_decode(file_get_contents('php://input'), true);
    $currentUser = getCurrentUser();
    
    try {
        $id = $data['id'] ?? generateUUID();
        
        $stmt = $pdo->prepare("
            INSERT INTO schedules (
                id, name, academic_year, semester, program, status,
                created_by, created_by_name, items, conflicts, approvals,
                is_locked, sent_to_faculty
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['name'],
            $data['academicYear'],
            $data['semester'],
            $data['program'],
            $data['status'],
            $currentUser['id'],
            $currentUser['name'],
            json_encode($data['items']),
            json_encode($data['conflicts'] ?? []),
            json_encode($data['approvals'] ?? []),
            $data['isLocked'] ?? false,
            $data['sentToFaculty'] ?? false,
        ]);
        
        echo json_encode([
            'schedule' => array_merge(['id' => $id], $data)
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create schedule: ' . $e->getMessage()]);
    }
}

// PUT - Update schedule
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAuth();
    
    // Get ID from URL (e.g., /api/schedules/index.php?id=sch-123)
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Schedule ID required']);
        exit();
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $updates = [];
        $params = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['items', 'conflicts', 'approvals'])) {
                $updates[] = "$key = ?";
                $params[] = json_encode($value);
            } elseif (in_array($key, ['name', 'status', 'is_locked', 'sent_to_faculty'])) {
                $updates[] = "$key = ?";
                $params[] = $value;
            }
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields to update']);
            exit();
        }
        
        $params[] = $id;
        $sql = "UPDATE schedules SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // Fetch updated schedule
        $stmt = $pdo->prepare("SELECT * FROM schedules WHERE id = ?");
        $stmt->execute([$id]);
        $schedule = $stmt->fetch();
        
        if ($schedule) {
            $schedule['items'] = json_decode($schedule['items'], true);
            $schedule['conflicts'] = json_decode($schedule['conflicts'] ?? '[]', true);
            $schedule['approvals'] = json_decode($schedule['approvals'] ?? '[]', true);
            $schedule['is_locked'] = (bool)$schedule['is_locked'];
            $schedule['sent_to_faculty'] = (bool)$schedule['sent_to_faculty'];
        }
        
        echo json_encode(['schedule' => $schedule]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update schedule: ' . $e->getMessage()]);
    }
}

// DELETE - Delete schedule
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAuth();
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Schedule ID required']);
        exit();
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM schedules WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete schedule: ' . $e->getMessage()]);
    }
}
?>
```

### 🔧 Step 4: Update Frontend Configuration

Create `.env` file in project root:

```env
VITE_API_BASE_URL=http://localhost/schedulapro-api/api
VITE_USE_LOCALHOST=true
```

Update `src/app/services/ApiService.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/schedulapro-api/api';

class ApiService {
  async signIn(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    return data.session;
  }
  
  async getSchedules(): Promise<Schedule[]> {
    const response = await fetch(`${API_BASE_URL}/schedules/index.php`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }
    
    const data = await response.json();
    return data.schedules;
  }
  
  // ... similar updates for other methods
}
```

### ✅ Step 5: Test

1. Start XAMPP (Apache + MySQL)
2. Run frontend: `npm run dev`
3. Open http://localhost:5173
4. Login with:
   - Email: `admin@schedulapro.local`
   - Password: `admin123`

**✅ Done! Full localhost backend running!**

---

## Option 3: Node.js + Express + MySQL

**⏱️ Setup Time:** 1-2 hours  
**💰 Cost:** Free  
**🎯 Best For:** Modern JavaScript stack, learning full-stack JS

### Prerequisites

- Node.js 18+ installed
- MySQL installed (or use XAMPP's MySQL)

### 📝 Setup Steps

#### Step 1: Create Database

Use the same MySQL schema from Option 2 above.

#### Step 2: Create Backend Project

```bash
mkdir schedulapro-backend
cd schedulapro-backend
npm init -y
npm install express cors mysql2 bcrypt express-session dotenv
```

#### Step 3: Create `server.js`

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'schedulapro-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'schedulapro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized - Please login' });
  }
  next();
};

// ========== AUTH ROUTES ==========

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name;
    req.session.userRole = user.role;
    
    res.json({
      session: {
        access_token: req.sessionID,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, role = 'program_assistant' } = req.body;
  
  try {
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const id = `user-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, passwordHash, name, role]
    );
    
    req.session.userId = id;
    req.session.userEmail = email;
    req.session.userName = name;
    req.session.userRole = role;
    
    res.json({
      session: {
        access_token: req.sessionID,
        user: { id, email, name, role }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ========== SCHEDULES ROUTES ==========

app.get('/api/schedules', requireAuth, async (req, res) => {
  try {
    const [schedules] = await pool.query('SELECT * FROM schedules ORDER BY created_at DESC');
    
    schedules.forEach(s => {
      s.items = JSON.parse(s.items);
      s.conflicts = JSON.parse(s.conflicts || '[]');
      s.approvals = JSON.parse(s.approvals || '[]');
      s.is_locked = Boolean(s.is_locked);
      s.sent_to_faculty = Boolean(s.sent_to_faculty);
    });
    
    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

app.post('/api/schedules', requireAuth, async (req, res) => {
  const { name, academicYear, semester, program, status, items, conflicts = [], approvals = [] } = req.body;
  
  try {
    const id = `sch-${Date.now()}`;
    
    await pool.query(`
      INSERT INTO schedules 
      (id, name, academic_year, semester, program, status, created_by, created_by_name, items, conflicts, approvals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, name, academicYear, semester, program, status,
      req.session.userId, req.session.userName,
      JSON.stringify(items), JSON.stringify(conflicts), JSON.stringify(approvals)
    ]);
    
    res.json({ schedule: { id, ...req.body } });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SchedulaPro API running on http://localhost:${PORT}`);
  console.log(`📊 Frontend should connect to http://localhost:${PORT}/api`);
});
```

#### Step 4: Create `.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=schedulapro
SESSION_SECRET=change-this-to-random-string-in-production
PORT=3000
```

#### Step 5: Run Server

```bash
node server.js
```

#### Step 6: Update Frontend

Update `.env` in frontend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### ✅ Test

1. Backend: `node server.js` (port 3000)
2. Frontend: `npm run dev` (port 5173)
3. Open http://localhost:5173

---

## Testing & Troubleshooting

### Common Issues

#### CORS Errors
```
Access to fetch at 'http://localhost/api' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:** Ensure CORS headers are set correctly in PHP/Node backend

#### Session Not Persisting
```
401 Unauthorized on API calls
```

**Fix:** Make sure `credentials: 'include'` is set in fetch calls

#### MySQL Connection Failed
```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'
```

**Fix:** Check MySQL username/password in config

### Testing Checklist

- [ ] Can sign up new user
- [ ] Can login with credentials
- [ ] Dashboard loads with data
- [ ] Can create schedule
- [ ] Can save faculty
- [ ] Data persists after page refresh
- [ ] Can logout

---

## 🎯 Which Option Should You Choose?

| If you want... | Choose... |
|---------------|-----------|
| **Quickest setup** | Option 1: Demo Mode |
| **Traditional stack** | Option 2: PHP + MySQL |
| **Modern JavaScript** | Option 3: Node.js |
| **Capstone presentation** | Option 1 + Option 2/3 (show both!) |
| **Production deployment** | Current Supabase setup |

---

## 📚 Additional Resources

- [XAMPP Documentation](https://www.apachefriends.org/docs/)
- [PHP mysqli Tutorial](https://www.php.net/manual/en/book.mysqli.php)
- [Express.js Guide](https://expressjs.com/en/starter/installing.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Setup completed! Your SchedulaPro is now running on localhost! 🎉**
