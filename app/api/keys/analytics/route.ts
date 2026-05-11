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
      keysByProvider,
      keysByEnvironment,
      usageOverTime,
      securityScore,
      riskAnalysis
    ] = await Promise.all([
      ApiKey.countDocuments({ userId: session.user.id }),
      
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: '$provider', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        { $group: { _id: '$environment', count: { $sum: 1 } } }
      ]),
      
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        {
          $group: {
            _id: {
              year: { $year: '$lastAccessed' },
              month: { $month: '$lastAccessed' },
              day: { $dayOfMonth: '$lastAccessed' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]),
      
      // Calculate security score based on various factors
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        {
          $group: {
            _id: null,
            avgKeyAge: { $avg: { $subtract: [new Date(), '$createdAt'] } },
            productionKeys: { $sum: { $cond: [{ $eq: ['$environment', 'production'] }, 1, 0] } },
            totalKeys: { $sum: 1 }
          }
        }
      ]),
      
      // Risk analysis
      ApiKey.aggregate([
        { $match: { userId: session.user.id } },
        {
          $project: {
            provider: 1,
            environment: 1,
            daysSinceAccessed: {
              $divide: [
                { $subtract: [new Date(), '$lastAccessed'] },
                1000 * 60 * 60 * 24
              ]
            },
            daysSinceCreated: {
              $divide: [
                { $subtract: [new Date(), '$createdAt'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      ])
    ]);

    // Calculate security score (0-100)
    let score = 100;
    const scoreData = securityScore[0];
    
    if (scoreData) {
      const avgKeyAgeDays = scoreData.avgKeyAge / (1000 * 60 * 60 * 24);
      const productionRatio = scoreData.productionKeys / scoreData.totalKeys;
      
      // Deduct points for old keys
      if (avgKeyAgeDays > 365) score -= 20;
      else if (avgKeyAgeDays > 180) score -= 10;
      
      // Deduct points for too many production keys
      if (productionRatio > 0.8) score -= 15;
      
      // Add points for good practices
      if (scoreData.totalKeys > 5) score += 5;
    }

    // Analyze risks
    const risks = [];
    const oldKeys = riskAnalysis.filter(key => key.daysSinceAccessed > 90);
    const veryOldKeys = riskAnalysis.filter(key => key.daysSinceCreated > 365);
    
    if (oldKeys.length > 0) {
      risks.push({
        type: 'unused_keys',
        severity: 'medium',
        count: oldKeys.length,
        message: `${oldKeys.length} keys haven't been accessed in 90+ days`
      });
    }
    
    if (veryOldKeys.length > 0) {
      risks.push({
        type: 'old_keys',
        severity: 'high',
        count: veryOldKeys.length,
        message: `${veryOldKeys.length} keys are over 1 year old and should be rotated`
      });
    }

    return NextResponse.json({
      totalKeys,
      keysByProvider,
      keysByEnvironment,
      usageOverTime,
      securityScore: Math.max(0, Math.min(100, score)),
      risks,
      insights: {
        mostUsedProvider: keysByProvider[0]?._id || 'none',
        environmentDistribution: keysByEnvironment,
        averageKeyAge: scoreData?.avgKeyAge || 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}