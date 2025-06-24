/**
 * Document Templates untuk berbagai jenis dokumen
 * Sistem template yang canggih dengan kategori dan metadata
 */

import { DocumentTemplate } from '@/types/templates';

export const documentTemplates: DocumentTemplate[] = [
  // README Templates
  {
    id: 'readme-basic',
    name: 'Basic README',
    description: 'Simple and clean README template for any project',
    category: 'readme',
    tags: ['project', 'github', 'basic'],
    icon: '📄',
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    preview: 'A comprehensive README with project description, installation, and usage instructions.',
    content: `# Project Name

> Brief description of your project

## 🚀 Features

- Feature 1
- Feature 2
- Feature 3

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to project directory
cd project-name

# Install dependencies
npm install
\`\`\`

## 🔧 Usage

\`\`\`javascript
// Basic usage example
import { ProjectName } from './project-name';

const project = new ProjectName();
project.start();
\`\`\`

## 📖 Documentation

For detailed documentation, visit [our docs](https://docs.example.com).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
`
  },
  {
    id: 'readme-advanced',
    name: 'Advanced README',
    description: 'Professional README with badges, detailed sections, and best practices',
    category: 'readme',
    tags: ['professional', 'badges', 'comprehensive'],
    icon: '🏆',
    difficulty: 'advanced',
    estimatedTime: '15 minutes',
    preview: 'Professional README with CI/CD badges, detailed API docs, and contribution guidelines.',
    content: `# 🚀 Project Name

[![Build Status](https://travis-ci.org/username/project.svg?branch=main)](https://travis-ci.org/username/project)
[![Coverage Status](https://coveralls.io/repos/github/username/project/badge.svg?branch=main)](https://coveralls.io/github/username/project?branch=main)
[![npm version](https://badge.fury.io/js/project-name.svg)](https://badge.fury.io/js/project-name)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🎯 A modern, feature-rich solution for [problem description]

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Examples](#-examples)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Changelog](#-changelog)
- [License](#-license)

## ✨ Features

- 🎨 **Modern UI/UX** - Beautiful and intuitive interface
- ⚡ **High Performance** - Optimized for speed and efficiency
- 🔒 **Secure** - Built with security best practices
- 📱 **Responsive** - Works on all devices
- 🌐 **Internationalization** - Multi-language support
- 🔧 **Customizable** - Highly configurable
- 📊 **Analytics** - Built-in analytics and monitoring
- 🚀 **Easy Deployment** - One-click deployment options

## 🎬 Demo

![Demo GIF](https://via.placeholder.com/800x400/09f/fff.png?text=Demo+GIF)

**Live Demo:** [https://project-demo.com](https://project-demo.com)

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0 or yarn >= 1.22.0

### Install via npm

\`\`\`bash
npm install project-name
\`\`\`

### Install via yarn

\`\`\`bash
yarn add project-name
\`\`\`

### Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/username/project-name.git

# Navigate to project directory
cd project-name

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 🚀 Quick Start

\`\`\`javascript
import { ProjectName } from 'project-name';

// Initialize with default configuration
const app = new ProjectName({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Start the application
await app.start();

// Use the API
const result = await app.process(data);
console.log(result);
\`\`\`

## 📚 API Reference

### Core Methods

#### \`initialize(options)\`

Initialize the application with configuration options.

**Parameters:**
- \`options\` (Object): Configuration options
  - \`apiKey\` (string): Your API key
  - \`environment\` (string): Environment ('development' | 'production')
  - \`debug\` (boolean): Enable debug mode

**Returns:** Promise<void>

**Example:**
\`\`\`javascript
await app.initialize({
  apiKey: 'your-api-key',
  environment: 'production',
  debug: false
});
\`\`\`

#### \`process(data)\`

Process data using the configured pipeline.

**Parameters:**
- \`data\` (any): Input data to process

**Returns:** Promise<ProcessResult>

**Example:**
\`\`\`javascript
const result = await app.process({
  input: 'sample data',
  options: { format: 'json' }
});
\`\`\`

## ⚙️ Configuration

Create a \`config.json\` file in your project root:

\`\`\`json
{
  "apiKey": "your-api-key",
  "environment": "production",
  "features": {
    "analytics": true,
    "caching": true,
    "compression": true
  },
  "limits": {
    "maxRequests": 1000,
    "timeout": 30000
  }
}
\`\`\`

## 💡 Examples

### Basic Usage

\`\`\`javascript
import { ProjectName } from 'project-name';

const app = new ProjectName();
const result = await app.process('Hello World');
\`\`\`

### Advanced Configuration

\`\`\`javascript
import { ProjectName, Middleware } from 'project-name';

const app = new ProjectName({
  middleware: [
    new Middleware.Logger(),
    new Middleware.Cache({ ttl: 3600 }),
    new Middleware.RateLimit({ max: 100 })
  ]
});
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "specific test"
\`\`\`

## 🚀 Deployment

### Docker

\`\`\`dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Vercel

\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

### AWS Lambda

\`\`\`bash
npm run build:lambda
aws lambda update-function-code --function-name my-function --zip-file fileb://dist.zip
\`\`\`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass: \`npm test\`
6. Commit your changes: \`git commit -m 'Add amazing feature'\`
7. Push to the branch: \`git push origin feature/amazing-feature\`
8. Submit a Pull Request

### Code Style

We use ESLint and Prettier for code formatting:

\`\`\`bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Format code
npm run format
\`\`\`

## 📈 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **John Doe** - *Project Lead* - [@johndoe](https://github.com/johndoe)
- **Jane Smith** - *Lead Developer* - [@janesmith](https://github.com/janesmith)
- **Bob Johnson** - *DevOps Engineer* - [@bobjohnson](https://github.com/bobjohnson)

## 🙏 Acknowledgments

- [Awesome Library](https://github.com/awesome/library) - For inspiration
- [Another Tool](https://github.com/another/tool) - For utilities
- All our [contributors](https://github.com/username/project/contributors)

## 📞 Support

- 📧 Email: support@project.com
- 💬 Discord: [Join our server](https://discord.gg/project)
- 🐛 Issues: [GitHub Issues](https://github.com/username/project/issues)
- 📖 Docs: [Documentation](https://docs.project.com)

---

<p align="center">
  Made with ❤️ by the Project Team
</p>
`
  },
  // Blog Post Templates
  {
    id: 'blog-tech',
    name: 'Tech Blog Post',
    description: 'Technical blog post template with code examples and best practices',
    category: 'blog',
    tags: ['technology', 'tutorial', 'programming'],
    icon: '💻',
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    preview: 'Professional tech blog post with code examples, explanations, and conclusions.',
    content: `# How to Build Amazing Web Applications in 2024

*Published on ${new Date().toLocaleDateString()} • 8 min read*

![Hero Image](https://via.placeholder.com/800x400/6366f1/ffffff?text=Web+Development+2024)

## Introduction

In the rapidly evolving world of web development, staying current with the latest technologies and best practices is crucial for building modern, scalable applications. This comprehensive guide will walk you through the essential tools, frameworks, and methodologies that define web development in 2024.

## Table of Contents

1. [Modern Frontend Frameworks](#modern-frontend-frameworks)
2. [Backend Technologies](#backend-technologies)
3. [Database Solutions](#database-solutions)
4. [Development Tools](#development-tools)
5. [Best Practices](#best-practices)
6. [Conclusion](#conclusion)

## Modern Frontend Frameworks

### React 18+ with Concurrent Features

React continues to dominate the frontend landscape with its latest concurrent features:

\`\`\`jsx
import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

// Lazy loading components for better performance
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}

// Using the new createRoot API
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
\`\`\`

### Next.js 14 with App Router

Next.js has revolutionized full-stack React development:

\`\`\`typescript
// app/page.tsx - Server Component by default
export default async function HomePage() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache' // Built-in caching
  });
  
  return (
    <main>
      <h1>Welcome to Next.js 14</h1>
      <DataComponent data={data} />
    </main>
  );
}
\`\`\`

## Backend Technologies

### Node.js with TypeScript

TypeScript has become essential for large-scale Node.js applications:

\`\`\`typescript
import express, { Request, Response } from 'express';
import { z } from 'zod';

const app = express();

// Type-safe request validation
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18)
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const userData = UserSchema.parse(req.body);
    // Process user data with full type safety
    const user = await createUser(userData);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Invalid user data' });
  }
});
\`\`\`

### Serverless Functions

Serverless architecture continues to gain popularity:

\`\`\`typescript
// Vercel Edge Function
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'World';
  
  return new Response(\`Hello, \${name}!\`, {
    headers: { 'content-type': 'text/plain' },
  });
}
\`\`\`

## Database Solutions

### Modern Database Choices

#### PostgreSQL with Prisma

\`\`\`typescript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
\`\`\`

\`\`\`typescript
// Using Prisma Client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUserWithPost() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      posts: {
        create: {
          title: 'My First Post',
          content: 'This is my first blog post!'
        }
      }
    },
    include: {
      posts: true
    }
  });
  
  return user;
}
\`\`\`

## Development Tools

### Essential Tools for 2024

1. **Vite** - Lightning-fast build tool
2. **Tailwind CSS** - Utility-first CSS framework
3. **ESLint + Prettier** - Code quality and formatting
4. **Husky** - Git hooks for quality gates
5. **Docker** - Containerization for consistent environments

### Example Vite Configuration

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button'],
        },
      },
    },
  },
});
\`\`\`

## Best Practices

### 1. Performance Optimization

- **Code Splitting**: Use dynamic imports and lazy loading
- **Image Optimization**: Implement next/image or similar solutions
- **Caching Strategies**: Leverage browser and CDN caching
- **Bundle Analysis**: Regular bundle size monitoring

### 2. Security Considerations

\`\`\`typescript
// Input validation and sanitization
import { z } from 'zod';
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string) => {
  return DOMPurify.sanitize(input);
};

const validateAndSanitize = (data: unknown) => {
  const schema = z.object({
    content: z.string().transform(sanitizeInput),
    title: z.string().max(100).transform(sanitizeInput),
  });
  
  return schema.parse(data);
};
\`\`\`

### 3. Testing Strategy

\`\`\`typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

## Key Takeaways

1. **Choose the Right Stack**: Consider your project requirements and team expertise
2. **Prioritize Performance**: Implement optimization strategies from the start
3. **Embrace TypeScript**: Type safety prevents bugs and improves developer experience
4. **Focus on Developer Experience**: Good tooling leads to better productivity
5. **Stay Updated**: The web development landscape evolves rapidly

## Conclusion

Building amazing web applications in 2024 requires a combination of modern tools, best practices, and continuous learning. The technologies and approaches outlined in this guide provide a solid foundation for creating scalable, performant, and maintainable applications.

Remember that the best technology stack is the one that fits your specific needs and constraints. Start with the fundamentals, gradually adopt new technologies, and always prioritize user experience and code quality.

---

**What's your experience with these technologies? Share your thoughts in the comments below!**

### Related Articles

- [Advanced React Patterns for 2024](link-to-article)
- [Building Scalable APIs with Node.js](link-to-article)
- [Modern CSS Techniques and Best Practices](link-to-article)

### Tags

#WebDevelopment #React #NextJS #TypeScript #NodeJS #Programming #Tutorial

---

*Follow me on [Twitter](https://twitter.com/yourhandle) for more web development tips and tutorials!*
`
  },
  // Documentation Templates
  {
    id: 'api-docs',
    name: 'API Documentation',
    description: 'Comprehensive API documentation template with examples',
    category: 'documentation',
    tags: ['api', 'rest', 'documentation', 'endpoints'],
    icon: '📚',
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    preview: 'Professional API documentation with endpoint details, examples, and authentication.',
    content: `# API Documentation

## Overview

Welcome to the **Project API** documentation. This RESTful API provides access to our core services and data.

**Base URL:** \`https://api.example.com/v1\`

**Version:** 1.0.0

## Authentication

All API requests require authentication using an API key.

### API Key Authentication

Include your API key in the request header:

\`\`\`http
Authorization: Bearer YOUR_API_KEY
\`\`\`

### Getting an API Key

1. Sign up for an account at [dashboard.example.com](https://dashboard.example.com)
2. Navigate to API Settings
3. Generate a new API key
4. Copy and securely store your key

## Rate Limiting

- **Free Tier:** 1,000 requests per hour
- **Pro Tier:** 10,000 requests per hour
- **Enterprise:** Unlimited

Rate limit headers are included in all responses:

\`\`\`http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
\`\`\`

## Endpoints

### Users

#### Get All Users

\`\`\`http
GET /users
\`\`\`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`page\` | integer | No | Page number (default: 1) |
| \`limit\` | integer | No | Items per page (default: 20, max: 100) |
| \`search\` | string | No | Search users by name or email |

**Example Request:**

\`\`\`bash
curl -X GET "https://api.example.com/v1/users?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 150,
    "total_pages": 15
  }
}
\`\`\`

#### Get User by ID

\`\`\`http
GET /users/{id}
\`\`\`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | integer | Yes | User ID |

**Example Request:**

\`\`\`bash
curl -X GET "https://api.example.com/v1/users/1" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "bio": "Software developer",
      "location": "San Francisco, CA",
      "website": "https://johndoe.com"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

#### Create User

\`\`\`http
POST /users
\`\`\`

**Request Body:**

\`\`\`json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123"
}
\`\`\`

**Example Request:**

\`\`\`bash
curl -X POST "https://api.example.com/v1/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "created_at": "2024-01-15T11:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "message": "User created successfully"
}
\`\`\`

### Posts

#### Get All Posts

\`\`\`http
GET /posts
\`\`\`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`author_id\` | integer | No | Filter by author ID |
| \`status\` | string | No | Filter by status (draft, published) |
| \`page\` | integer | No | Page number |
| \`limit\` | integer | No | Items per page |

**Example Request:**

\`\`\`bash
curl -X GET "https://api.example.com/v1/posts?status=published&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"
\`\`\`

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure.

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
\`\`\`

## SDKs and Libraries

### JavaScript/Node.js

\`\`\`bash
npm install @example/api-client
\`\`\`

\`\`\`javascript
import { ApiClient } from '@example/api-client';

const client = new ApiClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.example.com/v1'
});

// Get all users
const users = await client.users.list();

// Create a new user
const newUser = await client.users.create({
  name: 'John Doe',
  email: 'john@example.com'
});
\`\`\`

### Python

\`\`\`bash
pip install example-api-client
\`\`\`

\`\`\`python
from example_api import ApiClient

client = ApiClient(api_key='YOUR_API_KEY')

# Get all users
users = client.users.list()

# Create a new user
new_user = client.users.create(
    name='John Doe',
    email='john@example.com'
)
\`\`\`

## Webhooks

Configure webhooks to receive real-time notifications about events.

### Supported Events

- \`user.created\`
- \`user.updated\`
- \`user.deleted\`
- \`post.published\`
- \`post.updated\`

### Webhook Payload Example

\`\`\`json
{
  "event": "user.created",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

## Support

- **Documentation:** [docs.example.com](https://docs.example.com)
- **Support Email:** support@example.com
- **Status Page:** [status.example.com](https://status.example.com)
- **Community:** [community.example.com](https://community.example.com)

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- User management endpoints
- Post management endpoints
- Authentication system
`
  },
  // Business Templates
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    description: 'Professional business proposal template',
    category: 'business',
    tags: ['proposal', 'business', 'professional', 'client'],
    icon: '💼',
    difficulty: 'intermediate',
    estimatedTime: '45 minutes',
    preview: 'Comprehensive business proposal with executive summary, scope, and pricing.',
    content: `# Business Proposal

**Prepared for:** [Client Name]
**Prepared by:** [Your Company Name]
**Date:** ${new Date().toLocaleDateString()}
**Proposal #:** BP-2024-001

---

## Executive Summary

We are pleased to present this proposal for [Project Name]. Our team at [Your Company] has extensive experience in [relevant field] and is excited about the opportunity to partner with [Client Name] to achieve [main objective].

### Key Benefits

- ✅ **Increased Efficiency** - Streamline operations by 40%
- ✅ **Cost Reduction** - Save $50,000 annually
- ✅ **Improved Performance** - Enhance productivity by 25%
- ✅ **Future-Ready** - Scalable solution for growth

## Company Overview

### About [Your Company]

[Your Company] is a leading [industry] company with over [X] years of experience serving clients across [regions/industries]. We specialize in:

- Service/Product 1
- Service/Product 2
- Service/Product 3

### Our Team

**[Your Name]** - Project Lead
*[Brief bio and relevant experience]*

**[Team Member 2]** - [Role]
*[Brief bio and relevant experience]*

### Client Success Stories

> "Working with [Your Company] transformed our business operations. We saw immediate improvements in efficiency and cost savings." - Previous Client

## Project Understanding

### Current Situation

Based on our initial discussions and analysis, we understand that [Client Name] is facing the following challenges:

1. **Challenge 1** - [Description]
2. **Challenge 2** - [Description]
3. **Challenge 3** - [Description]

### Objectives

Our proposed solution will help you achieve:

- **Primary Objective** - [Description]
- **Secondary Objective** - [Description]
- **Long-term Goal** - [Description]

## Proposed Solution

### Approach

We recommend a [methodology] approach consisting of [number] phases:

#### Phase 1: Discovery & Planning (Weeks 1-2)
- Stakeholder interviews
- Current state analysis
- Requirements gathering
- Project planning

#### Phase 2: Design & Development (Weeks 3-8)
- Solution design
- Development/Implementation
- Testing and quality assurance
- Documentation

#### Phase 3: Deployment & Training (Weeks 9-10)
- System deployment
- User training
- Go-live support
- Knowledge transfer

#### Phase 4: Support & Optimization (Ongoing)
- Ongoing support
- Performance monitoring
- Continuous improvement
- Regular reviews

### Deliverables

| Deliverable | Description | Timeline |
|-------------|-------------|----------|
| Project Plan | Detailed project roadmap | Week 1 |
| Design Documents | Technical specifications | Week 3 |
| Solution Implementation | Fully functional system | Week 8 |
| Training Materials | User guides and documentation | Week 9 |
| Final Report | Project summary and recommendations | Week 10 |

## Timeline

\`\`\`
Week 1-2:  Discovery & Planning
Week 3-4:  Initial Design
Week 5-6:  Development Phase 1
Week 7-8:  Development Phase 2
Week 9:    Testing & Deployment
Week 10:   Training & Go-live
\`\`\`

## Investment

### Project Costs

| Item | Description | Cost |
|------|-------------|------|
| **Discovery & Planning** | Requirements analysis, project planning | $5,000 |
| **Design & Development** | Solution design and implementation | $25,000 |
| **Testing & QA** | Quality assurance and testing | $3,000 |
| **Training & Support** | User training and go-live support | $2,000 |
| **Project Management** | Overall project coordination | $5,000 |
| | **Total Project Cost** | **$40,000** |

### Payment Schedule

- **25%** - Upon contract signing ($10,000)
- **50%** - At project milestone completion ($20,000)
- **25%** - Upon final delivery and acceptance ($10,000)

### Ongoing Support (Optional)

- **Monthly Support** - $2,000/month
- **Annual Maintenance** - $20,000/year

## Why Choose [Your Company]?

### Competitive Advantages

1. **Proven Track Record** - 95% client satisfaction rate
2. **Expert Team** - Certified professionals with [X] years experience
3. **Innovative Solutions** - Cutting-edge technology and methodologies
4. **Ongoing Support** - Comprehensive post-implementation support
5. **Transparent Process** - Regular updates and clear communication

### Risk Mitigation

- **Fixed-price contract** - No surprise costs
- **Milestone-based delivery** - Regular checkpoints
- **Quality guarantee** - 30-day warranty on deliverables
- **Experienced team** - Reduced project risk

## Terms & Conditions

### Project Scope

This proposal covers the work outlined in the "Proposed Solution" section. Any additional work will be subject to a separate agreement.

### Timeline

The project timeline is based on timely client feedback and approval at each milestone.

### Assumptions

- Client will provide necessary access to systems and stakeholders
- Required third-party integrations are available and accessible
- Client team will be available for training sessions

### Acceptance Criteria

Project deliverables will be considered complete when:
- All specified functionality is implemented
- Testing is completed successfully
- Client training is conducted
- Documentation is delivered

## Next Steps

1. **Review Proposal** - Please review this proposal and provide feedback
2. **Schedule Meeting** - Let's discuss any questions or modifications
3. **Contract Signing** - Finalize agreement and begin project
4. **Project Kickoff** - Start with discovery phase

## Contact Information

**[Your Name]**
[Title]
[Your Company]

📧 Email: [email@company.com]
📞 Phone: [phone number]
🌐 Website: [website.com]
📍 Address: [company address]

---

*This proposal is valid for 30 days from the date above. We look forward to partnering with you on this exciting project!*
`
  }
];

// Helper functions for template management
export const getTemplatesByCategory = (category: DocumentTemplate['category']) => {
  return documentTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return documentTemplates.find(template => template.id === id);
};

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return documentTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTemplateCategories = () => {
  const categories = Array.from(new Set(documentTemplates.map(t => t.category)));
  return categories.map(category => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1),
    count: documentTemplates.filter(t => t.category === category).length
  }));
};
