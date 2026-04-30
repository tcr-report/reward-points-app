export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { level: 'asc' },
        { grade: 'asc' },
        { name: 'asc' }
      ]
    });
    return NextResponse.json(students);
  } catch (error: any) {
    console.error('DATABASE_FETCH_ERROR:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch students', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if it's an array (bulk) or single object
    if (Array.isArray(data)) {
      const results = await Promise.all(
        data.map(async (s) => {
          return prisma.student.upsert({
            where: { name_level_grade: { name: s.name, level: s.level, grade: s.grade } },
            update: {},
            create: {
              name: s.name,
              level: s.level,
              grade: s.grade,
              gender: s.gender || 'F',
            }
          });
        })
      );
      return NextResponse.json(results);
    } else {
      const student = await prisma.student.create({
        data: {
          name: data.name,
          level: data.level,
          grade: data.grade,
          gender: data.gender || 'F',
        }
      });
      return NextResponse.json(student);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create student(s)' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.student.delete({
      where: { id: Number(id) }
    });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, type } = await request.json();
    
    const updateData = type === 'reward' 
      ? { rewardPoints: { increment: 1 } }
      : { penaltyPoints: { increment: 1 } };

    const student = await prisma.student.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update points' }, { status: 500 });
  }
}
