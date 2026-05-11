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

    const keys = await ApiKey.find({ userId: session.user.id }).lean();
    
    // AI-powered insights
    const insights = [];
    
    // Analyze naming patterns
    const namingPatterns = analyzeNamingPatterns(keys);
    if (namingPatterns.inconsistent > 0) {
      insights.push({
        type: 'naming_consistency',
        severity: 'low',
        title: 'Inconsistent Naming Patterns',
        description: `${namingPatterns.inconsistent} keys don't follow your usual naming convention`,
        suggestion: 'Consider standardizing your key naming for better organization',
        icon: 'tag'
      });
    }
    
    // Analyze environment distribution
    const envDistribution = analyzeEnvironmentDistribution(keys);
    if (envDistribution.productionHeavy) {
      insights.push({
        type: 'environment_balance',
        severity: 'medium',
        title: 'Production-Heavy Setup',
        description: 'Most of your keys are for production environments',
        suggestion: 'Consider adding staging/development keys for safer testing',
        icon: 'alert-triangle'
      });
    }
    
    // Analyze provider diversity
    const providerAnalysis = analyzeProviderDiversity(keys);
    if (providerAnalysis.concentrated) {
      insights.push({
        type: 'provider_diversity',
        severity: 'low',
        title: 'Limited Provider Diversity',
        description: `${providerAnalysis.dominantProvider} accounts for most of your keys`,
        suggestion: 'Diversifying providers can reduce vendor lock-in risks',
        icon: 'globe'
      });
    }
    
    // Security recommendations
    const securityRecs = generateSecurityRecommendations(keys);
    insights.push(...securityRecs);
    
    // Usage optimization
    const usageOptimization = analyzeUsagePatterns(keys);
    insights.push(...usageOptimization);

    return NextResponse.json({
      insights,
      summary: {
        totalInsights: insights.length,
        highPriority: insights.filter(i => i.severity === 'high').length,
        mediumPriority: insights.filter(i => i.severity === 'medium').length,
        lowPriority: insights.filter(i => i.severity === 'low').length
      }
    });
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function analyzeNamingPatterns(keys: any[]) {
  const patterns = {
    camelCase: /^[a-z][a-zA-Z0-9]*$/,
    kebabCase: /^[a-z][a-z0-9-]*$/,
    snakeCase: /^[a-z][a-z0-9_]*$/,
    descriptive: /^[a-zA-Z0-9\s-_]{10,}$/
  };
  
  const patternCounts = Object.keys(patterns).reduce((acc, pattern) => {
    acc[pattern] = keys.filter(key => patterns[pattern as keyof typeof patterns].test(key.label)).length;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantPattern = Object.keys(patternCounts).reduce((a, b) => 
    patternCounts[a] > patternCounts[b] ? a : b
  );
  
  const inconsistent = keys.length - patternCounts[dominantPattern];
  
  return { inconsistent, dominantPattern };
}

function analyzeEnvironmentDistribution(keys: any[]) {
  const envCounts = keys.reduce((acc, key) => {
    acc[key.environment] = (acc[key.environment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const productionRatio = (envCounts.production || 0) / keys.length;
  
  return {
    productionHeavy: productionRatio > 0.7,
    distribution: envCounts
  };
}

function analyzeProviderDiversity(keys: any[]) {
  const providerCounts = keys.reduce((acc, key) => {
    acc[key.provider] = (acc[key.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantProvider = Object.keys(providerCounts).reduce((a, b) => 
    providerCounts[a] > providerCounts[b] ? a : b
  );
  
  const dominantRatio = providerCounts[dominantProvider] / keys.length;
  
  return {
    concentrated: dominantRatio > 0.6,
    dominantProvider,
    diversity: Object.keys(providerCounts).length
  };
}

function generateSecurityRecommendations(keys: any[]) {
  const recommendations = [];
  const now = new Date();
  
  // Check for old keys
  const oldKeys = keys.filter(key => {
    const daysSinceCreated = (now.getTime() - new Date(key.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 365;
  });
  
  if (oldKeys.length > 0) {
    recommendations.push({
      type: 'key_rotation',
      severity: 'high',
      title: 'Key Rotation Needed',
      description: `${oldKeys.length} keys are over 1 year old`,
      suggestion: 'Rotate old keys to maintain security best practices',
      icon: 'refresh-cw'
    });
  }
  
  // Check for unused keys
  const unusedKeys = keys.filter(key => {
    const daysSinceAccessed = (now.getTime() - new Date(key.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAccessed > 90;
  });
  
  if (unusedKeys.length > 0) {
    recommendations.push({
      type: 'unused_keys',
      severity: 'medium',
      title: 'Unused Keys Detected',
      description: `${unusedKeys.length} keys haven't been accessed in 90+ days`,
      suggestion: 'Consider removing or archiving unused keys',
      icon: 'archive'
    });
  }
  
  return recommendations;
}

function analyzeUsagePatterns(keys: any[]) {
  const insights = [];
  
  // Check for missing tags
  const untaggedKeys = keys.filter(key => !key.tags || key.tags.length === 0);
  if (untaggedKeys.length > keys.length * 0.3) {
    insights.push({
      type: 'tagging_optimization',
      severity: 'low',
      title: 'Improve Organization',
      description: `${untaggedKeys.length} keys are missing tags`,
      suggestion: 'Add tags to improve searchability and organization',
      icon: 'tag'
    });
  }
  
  // Check for missing notes
  const notelessKeys = keys.filter(key => !key.notes || key.notes.trim().length === 0);
  if (notelessKeys.length > keys.length * 0.5) {
    insights.push({
      type: 'documentation',
      severity: 'low',
      title: 'Add Documentation',
      description: `${notelessKeys.length} keys are missing notes`,
      suggestion: 'Add notes to document key purposes and usage',
      icon: 'file-text'
    });
  }
  
  return insights;
}