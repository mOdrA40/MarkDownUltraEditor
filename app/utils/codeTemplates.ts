/**
 * Template code snippets untuk berbagai bahasa pemrograman
 * Digunakan untuk menampilkan contoh syntax highlighting yang menarik
 */

export interface CodeTemplate {
  language: string;
  title: string;
  description: string;
  code: string;
  category: 'programming' | 'web' | 'data' | 'config' | 'shell';
}

export const codeTemplates: CodeTemplate[] = [
  // Programming Languages
  {
    language: 'javascript',
    title: 'Modern JavaScript',
    description: 'ES6+ features with async/await and destructuring',
    category: 'programming',
    code: `// Modern JavaScript dengan ES6+ features
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const { data, status } = await response.json();
    
    return {
      ...data,
      isActive: status === 'active',
      lastSeen: new Date(data.lastLogin)
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('User data unavailable');
  }
};

// Array methods dan functional programming
const processUsers = (users) => 
  users
    .filter(user => user.isActive)
    .map(({ id, name, email }) => ({ id, name, email }))
    .sort((a, b) => a.name.localeCompare(b.name));`,
  },
  {
    language: 'typescript',
    title: 'TypeScript Interfaces & Generics',
    description: 'Type-safe code with interfaces and generic functions',
    category: 'programming',
    code: `interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
}

// Generic API response type
interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Generic function dengan constraints
function createRepository<T extends { id: string }>(
  items: T[]
): Repository<T> {
  return {
    findById: (id: string) => items.find(item => item.id === id),
    findAll: () => [...items],
    create: (item: T) => {
      items.push(item);
      return item;
    }
  };
}

type Repository<T> = {
  findById: (id: string) => T | undefined;
  findAll: () => T[];
  create: (item: T) => T;
};`,
  },
  {
    language: 'python',
    title: 'Python Data Processing',
    description: 'Modern Python with type hints and data classes',
    category: 'programming',
    code: `from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import asyncio
import aiohttp

@dataclass
class User:
    id: int
    name: str
    email: str
    is_active: bool = True
    
    def __post_init__(self):
        self.email = self.email.lower()

class UserService:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    async def fetch_users(self) -> List[User]:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/users") as response:
                data = await response.json()
                return [User(**user_data) for user_data in data]
    
    def filter_active_users(self, users: List[User]) -> List[User]:
        return [user for user in users if user.is_active]

# List comprehension dan generator
def process_data(numbers: List[int]) -> Dict[str, Any]:
    return {
        'squares': [n**2 for n in numbers if n % 2 == 0],
        'sum': sum(numbers),
        'stats': {
            'min': min(numbers),
            'max': max(numbers),
            'avg': sum(numbers) / len(numbers)
        }
    }`,
  },
  {
    language: 'java',
    title: 'Java Spring Boot API',
    description: 'RESTful API with Spring Boot and JPA',
    category: 'programming',
    code: `@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userService.findAll(pageable);
        
        List<UserDto> userDtos = users.getContent()
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(userDtos);
    }
    
    @PostMapping
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .createdAt(LocalDateTime.now())
            .build();
            
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(convertToDto(savedUser));
    }
}`,
  },
  {
    language: 'go',
    title: 'Go Concurrent Web Server',
    description: 'HTTP server with goroutines and channels',
    category: 'programming',
    code: `package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
    "time"
)

type User struct {
    ID    int    \`json:"id"\`
    Name  string \`json:"name"\`
    Email string \`json:"email"\`
}

type UserService struct {
    users []User
    mu    sync.RWMutex
}

func (s *UserService) GetUsers(w http.ResponseWriter, r *http.Request) {
    s.mu.RLock()
    defer s.mu.RUnlock()
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(s.users)
}

func (s *UserService) ProcessUsers(ctx context.Context) {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            s.mu.Lock()
            // Process users logic here
            fmt.Println("Processing users...")
            s.mu.Unlock()
        }
    }
}

func main() {
    service := &UserService{
        users: []User{
            {ID: 1, Name: "Alice", Email: "alice@example.com"},
            {ID: 2, Name: "Bob", Email: "bob@example.com"},
        },
    }
    
    http.HandleFunc("/users", service.GetUsers)
    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
  },
  {
    language: 'rust',
    title: 'Rust Error Handling',
    description: 'Safe Rust code with Result types and pattern matching',
    category: 'programming',
    code: `use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

#[derive(Debug)]
enum UserError {
    NotFound(u32),
    InvalidEmail(String),
    DatabaseError(String),
}

impl std::fmt::Display for UserError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            UserError::NotFound(id) => write!(f, "User with ID {} not found", id),
            UserError::InvalidEmail(email) => write!(f, "Invalid email: {}", email),
            UserError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
        }
    }
}

struct UserRepository {
    users: HashMap<u32, User>,
}

impl UserRepository {
    fn new() -> Self {
        Self {
            users: HashMap::new(),
        }
    }
    
    fn find_user(&self, id: u32) -> Result<&User, UserError> {
        self.users.get(&id).ok_or(UserError::NotFound(id))
    }
    
    fn create_user(&mut self, name: String, email: String) -> Result<u32, UserError> {
        if !email.contains('@') {
            return Err(UserError::InvalidEmail(email));
        }
        
        let id = self.users.len() as u32 + 1;
        let user = User { id, name, email };
        self.users.insert(id, user);
        
        Ok(id)
    }
}`,
  },
  // Web Technologies
  {
    language: 'html',
    title: 'Modern HTML5 Structure',
    description: 'Semantic HTML with accessibility features',
    category: 'web',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Modern web application with accessibility">
    <title>Modern Web App</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header role="banner">
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="#home" aria-current="page">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main role="main">
        <section aria-labelledby="hero-heading">
            <h1 id="hero-heading">Welcome to Our Platform</h1>
            <p>Building accessible and modern web experiences.</p>
            
            <form aria-label="Newsletter signup">
                <label for="email">Email address:</label>
                <input type="email" id="email" required 
                       aria-describedby="email-help">
                <small id="email-help">We'll never share your email.</small>
                <button type="submit">Subscribe</button>
            </form>
        </section>
    </main>
    
    <footer role="contentinfo">
        <p>&copy; 2024 Modern Web App. All rights reserved.</p>
    </footer>
</body>
</html>`,
  },
  {
    language: 'css',
    title: 'Modern CSS with Grid & Flexbox',
    description: 'Responsive design with CSS Grid and custom properties',
    category: 'web',
    code: `:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background: #ffffff;
  --surface: #f8fafc;
  --text: #1e293b;
  --border-radius: 0.5rem;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0f172a;
    --surface: #1e293b;
    --text: #f1f5f9;
  }
}

.container {
  display: grid;
  grid-template-columns: 
    [full-start] minmax(1rem, 1fr)
    [content-start] minmax(0, 1200px)
    [content-end] minmax(1rem, 1fr)
    [full-end];
  gap: 2rem;
}

.card {
  background: var(--surface);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

@container (min-width: 768px) {
  .card {
    padding: 2rem;
  }
}`,
  },
  // Database & Data
  {
    language: 'sql',
    title: 'Advanced SQL Queries',
    description: 'Complex queries with CTEs and window functions',
    category: 'data',
    code: `-- Common Table Expression dengan Window Functions
WITH user_stats AS (
  SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) OVER (PARTITION BY u.country) as avg_country_spend,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total_amount) DESC) as spending_rank
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.created_at >= '2024-01-01'
  GROUP BY u.id, u.name, u.email, u.country
),
top_customers AS (
  SELECT *
  FROM user_stats
  WHERE spending_rank <= 10
)
SELECT
  tc.name,
  tc.email,
  tc.order_count,
  tc.total_spent,
  tc.avg_country_spend,
  CASE
    WHEN tc.total_spent > tc.avg_country_spend * 1.5 THEN 'Premium'
    WHEN tc.total_spent > tc.avg_country_spend THEN 'Standard'
    ELSE 'Basic'
  END as customer_tier
FROM top_customers tc
ORDER BY tc.total_spent DESC;`,
  },
  {
    language: 'json',
    title: 'API Response Schema',
    description: 'Well-structured JSON API response with metadata',
    category: 'data',
    code: `{
  "meta": {
    "version": "1.0",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789",
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8
    }
  },
  "data": {
    "users": [
      {
        "id": "user_001",
        "type": "user",
        "attributes": {
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "avatar_url": "https://api.example.com/avatars/alice.jpg",
          "created_at": "2024-01-10T08:15:30Z",
          "last_login": "2024-01-15T09:45:22Z",
          "preferences": {
            "theme": "dark",
            "notifications": {
              "email": true,
              "push": false,
              "sms": true
            },
            "privacy": {
              "profile_visibility": "public",
              "show_email": false
            }
          }
        },
        "relationships": {
          "organization": {
            "data": {
              "type": "organization",
              "id": "org_456"
            }
          }
        }
      }
    ]
  },
  "included": [
    {
      "id": "org_456",
      "type": "organization",
      "attributes": {
        "name": "Tech Corp",
        "domain": "techcorp.com"
      }
    }
  ],
  "links": {
    "self": "https://api.example.com/users?page=1",
    "next": "https://api.example.com/users?page=2",
    "last": "https://api.example.com/users?page=8"
  }
}`,
  },
  // Shell & Config
  {
    language: 'bash',
    title: 'Advanced Bash Scripting',
    description: 'Production-ready bash script with error handling',
    category: 'shell',
    code: [
      '#!/bin/bash',
      '',
      '# Advanced bash script dengan error handling dan logging',
      'set -euo pipefail  # Exit on error, undefined vars, pipe failures',
      '',
      '# Configuration',
      'readonly SCRIPT_DIR="$(cd "$(dirname "$' + '{BASH_SOURCE[0]}")" && pwd)"',
      'readonly LOG_FILE="$' + '{SCRIPT_DIR}/deploy.log"',
      'readonly CONFIG_FILE="$' + '{SCRIPT_DIR}/config.env"',
      '',
      '# Colors untuk output',
      "readonly RED='\\033[0;31m'",
      "readonly GREEN='\\033[0;32m'",
      "readonly YELLOW='\\033[1;33m'",
      "readonly NC='\\033[0m' # No Color",
      '',
      '# Logging function',
      'log() {',
      '    local level="$1"',
      '    shift',
      '    echo -e "[$(date +\'%Y-%m-%d %H:%M:%S\')] [$level] $*" | tee -a "$LOG_FILE"',
      '}',
      '',
      'info() { log "INFO" "$@"; }',
      'warn() { log "WARN" "$' + '{YELLOW}$*$' + '{NC}"; }',
      'error() { log "ERROR" "$' + '{RED}$*$' + '{NC}"; }',
      'success() { log "SUCCESS" "$' + '{GREEN}$*$' + '{NC}"; }',
      '',
      '# Error handler',
      'cleanup() {',
      '    local exit_code=$?',
      '    if [[ $exit_code -ne 0 ]]; then',
      '        error "Script failed with exit code $exit_code"',
      '        error "Check log file: $LOG_FILE"',
      '    fi',
      '    exit $exit_code',
      '}',
      '',
      'trap cleanup EXIT',
      '',
      '# Load configuration',
      'if [[ -f "$CONFIG_FILE" ]]; then',
      '    source "$CONFIG_FILE"',
      '    info "Configuration loaded from $CONFIG_FILE"',
      'else',
      '    warn "Configuration file not found: $CONFIG_FILE"',
      'fi',
      '',
      '# Main deployment function',
      'deploy_application() {',
      '    local app_name="$' + '{1:-myapp}"',
      '    local environment="$' + '{2:-staging}"',
      '    ',
      '    info "Starting deployment of $app_name to $environment"',
      '    ',
      '    # Pre-deployment checks',
      '    if ! command -v docker &> /dev/null; then',
      '        error "Docker is not installed"',
      '        return 1',
      '    fi',
      '    ',
      '    # Build and deploy',
      '    info "Building Docker image..."',
      '    docker build -t "$app_name:latest" . || {',
      '        error "Docker build failed"',
      '        return 1',
      '    }',
      '    ',
      '    success "Deployment completed successfully!"',
      '}',
      '',
      '# Main execution',
      'main() {',
      '    info "Deployment script started"',
      '    deploy_application "$@"',
      '}',
      '',
      '# Run main function with all arguments',
      'main "$@"',
    ].join('\n'),
  },
  {
    language: 'powershell',
    title: 'PowerShell Automation',
    description: 'Windows automation with error handling and logging',
    category: 'shell',
    code: [
      '# PowerShell Automation Script',
      'param(',
      '    [Parameter(Mandatory = $true)]',
      '    [string]$Environment,',
      '    ',
      '    [Parameter(Mandatory = $false)]',
      '    [string]$ConfigPath = ".\\config.json"',
      ')',
      '',
      '# Set error handling',
      '$ErrorActionPreference = "Stop"',
      '',
      '# Logging function',
      'function Write-Log {',
      '    param(',
      '        [string]$Message,',
      '        [string]$Level = "INFO"',
      '    )',
      '    ',
      '    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"',
      '    $logEntry = "[$timestamp] [$Level] $Message"',
      '    ',
      '    switch ($Level) {',
      '        "ERROR" { Write-Host $logEntry -ForegroundColor Red }',
      '        "WARN" { Write-Host $logEntry -ForegroundColor Yellow }',
      '        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }',
      '        default { Write-Host $logEntry }',
      '    }',
      '}',
      '',
      '# Main function',
      'function Deploy-Application {',
      '    param([string]$Env, [string]$Config)',
      '    ',
      '    try {',
      '        Write-Log "Starting deployment to $Env" -Level "INFO"',
      '        ',
      '        if (Test-Path $Config) {',
      '            $settings = Get-Content $Config | ConvertFrom-Json',
      '            Write-Log "Configuration loaded" -Level "SUCCESS"',
      '        } else {',
      '            Write-Log "Config file not found: $Config" -Level "WARN"',
      '        }',
      '        ',
      '        # Deployment logic here',
      '        Write-Log "Deployment completed successfully" -Level "SUCCESS"',
      '        ',
      '    } catch {',
      '        Write-Log "Deployment failed: $($_.Exception.Message)" -Level "ERROR"',
      '        throw',
      '    }',
      '}',
      '',
      '# Execute',
      'try {',
      '    Write-Log "Script started" -Level "INFO"',
      '    Deploy-Application -Env $Environment -Config $ConfigPath',
      '} catch {',
      '    Write-Log "Script failed" -Level "ERROR"',
      '    exit 1',
      '}',
    ].join('\n'),
  },
  // Additional Languages
  {
    language: 'yaml',
    title: 'Docker Compose Configuration',
    description: 'Multi-service application with Docker Compose',
    category: 'config',
    code: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge`,
  },
  {
    language: 'dockerfile',
    title: 'Multi-stage Node.js Dockerfile',
    description: 'Optimized Docker image with multi-stage build',
    category: 'config',
    code: `# Multi-stage build untuk Node.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]`,
  },
];

/**
 * Get code templates by category
 */
export const getTemplatesByCategory = (category: CodeTemplate['category']): CodeTemplate[] => {
  return codeTemplates.filter((template) => template.category === category);
};

/**
 * Get template by language
 */
export const getTemplateByLanguage = (language: string): CodeTemplate | undefined => {
  return codeTemplates.find((template) => template.language === language);
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = (): string[] => {
  return codeTemplates.map((template) => template.language);
};
