import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/lib/models/ApiKey';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const [
      totalKeys,
      providerStats,
      environmentStats,
      recentlyAccessed,
    ] = await Promise.all([
      ApiKey.countDocuments({ userId: session.user.id }),
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: '$provider', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: '$environment', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ApiKey.find({ userId: session.user.id })
        .sort({ lastAccessed: -1 })
        .limit(5)
        .select('label provider environment lastAccessed')
        .lean(),
    ]);

    return NextResponse.json({
      totalKeys,
      providerStats,
      environmentStats,
      recentlyAccessed,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}