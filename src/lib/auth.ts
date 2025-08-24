import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<{
  id: string;
  email: string;
  role: string;
  student?: { id: string; name: string };
  parent?: { id: string; name: string };
} | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        student: true,
        parent: {
          include: {
            studentLinks: {
              include: {
                student: true
              }
            }
          }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      student: user.student ? {
        id: user.student.id,
        name: user.student.name
      } : undefined,
      parent: user.parent ? {
        id: user.parent.id,
        name: user.parent.name
      } : undefined
    };
  } catch {
    return null;
  }
}

export function requireAuth(allowedRoles?: string[]) {
  return async function(request: NextRequest) {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return user;
  };
}
