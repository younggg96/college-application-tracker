import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const country = searchParams.get('country');
    const state = searchParams.get('state');
    const minRanking = searchParams.get('minRanking');
    const maxRanking = searchParams.get('maxRanking');
    const maxAcceptanceRate = searchParams.get('maxAcceptanceRate');
    const applicationSystem = searchParams.get('applicationSystem');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: {
      name?: { contains: string; mode: 'insensitive' };
      country?: string;
      state?: string;
      usNewsRanking?: { gte?: number; lte?: number };
      acceptanceRate?: { lte: number };
      applicationSystem?: string;
    } = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (country) {
      where.country = country;
    }

    if (state) {
      where.state = state;
    }

    if (minRanking) {
      where.usNewsRanking = {
        ...where.usNewsRanking,
        gte: parseInt(minRanking)
      };
    }

    if (maxRanking) {
      where.usNewsRanking = {
        ...where.usNewsRanking,
        lte: parseInt(maxRanking)
      };
    }

    if (maxAcceptanceRate) {
      where.acceptanceRate = {
        lte: parseFloat(maxAcceptanceRate)
      };
    }

    if (applicationSystem) {
      where.applicationSystem = applicationSystem;
    }

    const [universities, total] = await Promise.all([
      prisma.university.findMany({
        where,
        orderBy: { usNewsRanking: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.university.count({ where })
    ]);

    return NextResponse.json({
      universities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
