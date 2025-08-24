# College Application Tracker

A comprehensive college application management platform designed for students and parents to track application progress, manage deadlines, and monitor admission results.

## Features

### 🎓 Student Features
- **Application Management**: Full CRUD operations supporting multiple application types (Early Decision, Early Action, Regular Decision, Rolling Admission)
- **University Search**: Powerful search and filtering capabilities by location, ranking, acceptance rate, and more
- **Progress Tracking**: Real-time tracking of application status and requirement completion
- **Deadline Reminders**: Smart alerts for upcoming important dates
- **Visual Analytics**: Rich charts and statistical analysis including application progress, timeline, and admission results
- **Profile Management**: Manage academic information (GPA, SAT/ACT scores, etc.)

### 👨‍👩‍👧‍👦 Parent Features
- **Read-only Access**: View child's application progress and status
- **Note Taking**: Add parent notes and suggestions to applications
- **Financial Planning**: View tuition information and cost analysis for accepted schools
- **Multi-student Support**: Link multiple children's accounts

### 🔒 Security Features
- **Role-based Access Control**: Separate student and parent roles with permission management
- **JWT Authentication**: Secure user authentication and session management
- **API Route Protection**: Middleware protection for sensitive data access

## Tech Stack

### Frontend
- **Next.js 15**: React full-stack framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled accessible components
- **Recharts**: Data visualization chart library
- **Lucide React**: Modern icon library

### Backend
- **Next.js API Routes**: Server-side API
- **Prisma**: Modern database ORM
- **SQLite**: Development database (scalable to PostgreSQL/MySQL)
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management

### Development Tools
- **ESLint**: Code quality checking
- **TypeScript**: Static type checking
- **date-fns**: Date manipulation utilities

## Quick Start

### Prerequisites
- Node.js 18.0+
- npm or yarn

### Installation Steps

1. **Clone the project**
```bash
git clone <repository-url>
cd college-application-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Run seed data
npm run db:seed
```

4. **Start development server**
```bash
npm run dev
```

5. **Access the application**
Open [http://localhost:3000](http://localhost:3000) to view the app

## Database Design

### Core Entities
- **User**: User accounts (student/parent)
- **Student**: Student profile and academic information
- **Parent**: Parent profile
- **University**: University information and data
- **Application**: Application records and status
- **ApplicationRequirement**: Application requirements and materials
- **ParentNote**: Parent notes

### Relationship Design
- One-to-one relationship between users and roles
- Many-to-many relationship between parents and students
- One-to-many relationship between students and applications
- Many-to-one relationship between applications and universities

## API Routes

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user information

### Student Routes
- `GET /api/student/profile` - Get student profile
- `PUT /api/student/profile` - Update student profile
- `GET /api/student/applications` - Get application list
- `POST /api/student/applications` - Create new application
- `GET /api/student/applications/[id]` - Get application details
- `PUT /api/student/applications/[id]` - Update application
- `DELETE /api/student/applications/[id]` - Delete application

### Parent Routes
- `GET /api/parent/students` - Get linked students
- `POST /api/parent/students` - Link new student
- `GET /api/parent/applications` - Get student applications
- `POST /api/parent/applications/[id]/notes` - Add parent notes

### Public Routes
- `GET /api/universities` - Search universities

## Page Structure

```
/                          # Home page
/login                     # Login page
/register                  # Registration page
/student                   # Student dashboard
/student/universities      # University search
/student/applications      # Application management
/student/applications/[id] # Application details
/student/applications/new  # New application
/student/analytics         # Application analytics
/parent                    # Parent dashboard
/parent/applications       # Student application view
```

## Deployment

### Environment Variables
Create a `.env` file:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
```

### Production Deployment
1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

### Vercel Deployment
The project is configured for one-click Vercel deployment.

## Development Guide

### Code Standards
- Use TypeScript for type-safe development
- Follow ESLint configuration standards
- Use Prettier for code formatting
- Follow SOLID principles and DRY principles

### Component Structure
```
src/
├── app/                   # Next.js App Router pages
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components
│   └── charts/           # Chart components
├── lib/                  # Utility functions and configuration
└── types/                # TypeScript type definitions
```

### Database Operations
Use Prisma ORM for database operations:
```bash
# View database
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate migration
npx prisma migrate dev
```

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For questions or suggestions, please contact us through:
- Create a GitHub Issue
- Send email to project maintainers

---

**Note**: This is a demonstration project showcasing modern web application development best practices. Please ensure proper security review and performance optimization before using in production environments.