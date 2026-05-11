import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/lib/models/ApiKey';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const result = await ApiKey.deleteMany({
      userId: session.user.id,
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} API keys`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}