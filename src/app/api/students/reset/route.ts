export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    await prisma.student.updateMany({
      data: {
        rewardPoints: 0,
        penaltyPoints: 0,
      }
    });
    return NextResponse.json({ message: 'All points reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset points' }, { status: 500 });
  }
}
