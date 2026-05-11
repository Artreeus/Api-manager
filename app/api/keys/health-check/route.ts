import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ApiKey from '@/lib/models/ApiKey';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keyIds } = await request.json();

    await dbConnect();

    const keys = await ApiKey.find({
      _id: { $in: keyIds },
      userId: session.user.id
    }).lean();

    const healthResults = await Promise.all(
      keys.map(async (key) => {
        const result = await checkKeyHealth(key);
        return {
          keyId: key._id,
          label: key.label,
          provider: key.provider,
          ...result
        };
      })
    );

    return NextResponse.json({
      results: healthResults,
      summary: {
        total: healthResults.length,
        healthy: healthResults.filter(r => r.status === 'healthy').length,
        warning: healthResults.filter(r => r.status === 'warning').length,
        error: healthResults.filter(r => r.status === 'error').length
      }
    });
  } catch (error) {
    console.error('Error checking key health:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkKeyHealth(key: any) {
  const now = new Date();
  const createdAt = new Date(key.createdAt);
  const lastAccessed = new Date(key.lastAccessed);
  
  const daysSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceAccessed = (now.getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
  
  const issues = [];
  let status = 'healthy';
  
  // Check age
  if (daysSinceCreated > 365) {
    issues.push({
      type: 'age',
      severity: 'high',
      message: 'Key is over 1 year old and should be rotated'
    });
    status = 'error';
  } else if (daysSinceCreated > 180) {
    issues.push({
      type: 'age',
      severity: 'medium',
      message: 'Key is getting old, consider rotation'
    });
    if (status === 'healthy') status = 'warning';
  }
  
  // Check usage
  if (daysSinceAccessed > 90) {
    issues.push({
      type: 'usage',
      severity: 'medium',
      message: 'Key hasn\'t been accessed in 90+ days'
    });
    if (status === 'healthy') status = 'warning';
  }
  
  // Check environment vs age
  if (key.environment === 'production' && daysSinceCreated > 180) {
    issues.push({
      type: 'security',
      severity: 'high',
      message: 'Production key should be rotated more frequently'
    });
    status = 'error';
  }
  
  // Provider-specific checks
  const providerChecks = await performProviderSpecificChecks(key);
  issues.push(...providerChecks.issues);
  
  if (providerChecks.status === 'error') status = 'error';
  else if (providerChecks.status === 'warning' && status === 'healthy') status = 'warning';
  
  return {
    status,
    issues,
    score: calculateHealthScore(issues),
    recommendations: generateRecommendations(issues, key)
  };
}

async function performProviderSpecificChecks(key: any) {
  const issues = [];
  let status = 'healthy';
  
  // Simulate provider-specific health checks
  // In a real implementation, you would make actual API calls to check key validity
  
  switch (key.provider) {
    case 'stripe':
      // Simulate Stripe API key validation
      if (Math.random() < 0.1) { // 10% chance of issues for demo
        issues.push({
          type: 'provider',
          severity: 'high',
          message: 'Key may be invalid or restricted'
        });
        status = 'error';
      }
      break;
      
    case 'aws':
      // Simulate AWS key validation
      if (Math.random() < 0.05) { // 5% chance of issues for demo
        issues.push({
          type: 'provider',
          severity: 'medium',
          message: 'Key permissions may be overly broad'
        });
        status = 'warning';
      }
      break;
      
    case 'github':
      // Simulate GitHub token validation
      if (Math.random() < 0.08) { // 8% chance of issues for demo
        issues.push({
          type: 'provider',
          severity: 'medium',
          message: 'Token scope may be too permissive'
        });
        status = 'warning';
      }
      break;
  }
  
  return { issues, status };
}

function calculateHealthScore(issues: any[]) {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'high':
        score -= 25;
        break;
      case 'medium':
        score -= 15;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });
  
  return Math.max(0, score);
}

function generateRecommendations(issues: any[], key: any) {
  const recommendations = [];
  
  const hasAgeIssue = issues.some(i => i.type === 'age');
  const hasUsageIssue = issues.some(i => i.type === 'usage');
  const hasSecurityIssue = issues.some(i => i.type === 'security');
  
  if (hasAgeIssue) {
    recommendations.push('Rotate this key with a new one from your provider');
  }
  
  if (hasUsageIssue) {
    recommendations.push('Consider archiving or removing this unused key');
  }
  
  if (hasSecurityIssue) {
    recommendations.push('Review and update key permissions and scope');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Key appears healthy - continue monitoring');
  }
  
  return recommendations;
}