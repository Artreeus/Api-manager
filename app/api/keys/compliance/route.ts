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

    const { searchParams } = new URL(request.url);
    const framework = searchParams.get('framework') || 'all';

    await dbConnect();

    const keys = await ApiKey.find({ userId: session.user.id }).lean();
    
    const complianceResults = {
      soc2: checkSOC2Compliance(keys),
      iso27001: checkISO27001Compliance(keys),
      gdpr: checkGDPRCompliance(keys),
      hipaa: checkHIPAACompliance(keys),
      pci: checkPCICompliance(keys)
    };

    const overallScore = calculateOverallComplianceScore(complianceResults);
    
    const recommendations = generateComplianceRecommendations(complianceResults, keys);

    return NextResponse.json({
      framework: framework === 'all' ? complianceResults : complianceResults[framework as keyof typeof complianceResults],
      overallScore,
      recommendations,
      summary: {
        totalKeys: keys.length,
        compliantKeys: keys.filter(key => isKeyCompliant(key)).length,
        riskLevel: overallScore > 80 ? 'low' : overallScore > 60 ? 'medium' : 'high'
      }
    });
  } catch (error) {
    console.error('Error checking compliance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function checkSOC2Compliance(keys: any[]) {
  const now = new Date();
  const issues = [];
  
  // Check for key rotation (SOC2 requires regular key rotation)
  const oldKeys = keys.filter(key => {
    const daysSinceCreated = (now.getTime() - new Date(key.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 365;
  });
  
  if (oldKeys.length > 0) {
    issues.push({
      type: 'key_rotation',
      severity: 'high',
      message: `${oldKeys.length} keys haven't been rotated in over a year`,
      requirement: 'CC6.1 - Logical and Physical Access Controls'
    });
  }
  
  // Check for access monitoring
  const unmonitoredKeys = keys.filter(key => {
    const daysSinceAccessed = (now.getTime() - new Date(key.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAccessed > 90;
  });
  
  if (unmonitoredKeys.length > 0) {
    issues.push({
      type: 'access_monitoring',
      severity: 'medium',
      message: `${unmonitoredKeys.length} keys show no recent access activity`,
      requirement: 'CC6.3 - Logical and Physical Access Controls'
    });
  }
  
  const score = Math.max(0, 100 - (issues.length * 20));
  
  return {
    score,
    status: score > 80 ? 'compliant' : score > 60 ? 'partially_compliant' : 'non_compliant',
    issues,
    requirements: [
      'CC6.1 - Logical and Physical Access Controls',
      'CC6.3 - Logical and Physical Access Controls',
      'CC6.7 - System Operations'
    ]
  };
}

function checkISO27001Compliance(keys: any[]) {
  const issues = [];
  
  // Check for documentation (ISO 27001 requires proper documentation)
  const undocumentedKeys = keys.filter(key => !key.notes || key.notes.trim().length === 0);
  
  if (undocumentedKeys.length > keys.length * 0.3) {
    issues.push({
      type: 'documentation',
      severity: 'medium',
      message: `${undocumentedKeys.length} keys lack proper documentation`,
      requirement: 'A.12.1.1 - Documented Operating Procedures'
    });
  }
  
  // Check for classification (tags as classification)
  const unclassifiedKeys = keys.filter(key => !key.tags || key.tags.length === 0);
  
  if (unclassifiedKeys.length > keys.length * 0.2) {
    issues.push({
      type: 'classification',
      severity: 'medium',
      message: `${unclassifiedKeys.length} keys lack proper classification`,
      requirement: 'A.8.2.1 - Classification of Information'
    });
  }
  
  const score = Math.max(0, 100 - (issues.length * 25));
  
  return {
    score,
    status: score > 80 ? 'compliant' : score > 60 ? 'partially_compliant' : 'non_compliant',
    issues,
    requirements: [
      'A.8.2.1 - Classification of Information',
      'A.12.1.1 - Documented Operating Procedures',
      'A.9.4.3 - Password Management System'
    ]
  };
}

function checkGDPRCompliance(keys: any[]) {
  const issues = [];
  
  // Check for data minimization
  const excessiveKeys = keys.filter(key => {
    const daysSinceAccessed = (new Date().getTime() - new Date(key.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAccessed > 180;
  });
  
  if (excessiveKeys.length > 0) {
    issues.push({
      type: 'data_minimization',
      severity: 'medium',
      message: `${excessiveKeys.length} keys may violate data minimization principle`,
      requirement: 'Article 5(1)(c) - Data Minimization'
    });
  }
  
  const score = Math.max(0, 100 - (issues.length * 30));
  
  return {
    score,
    status: score > 80 ? 'compliant' : score > 60 ? 'partially_compliant' : 'non_compliant',
    issues,
    requirements: [
      'Article 5(1)(c) - Data Minimization',
      'Article 32 - Security of Processing'
    ]
  };
}

function checkHIPAACompliance(keys: any[]) {
  const issues = [];
  
  // Check for healthcare-related providers
  const healthcareProviders = ['aws', 'google', 'microsoft'];
  const healthcareKeys = keys.filter(key => healthcareProviders.includes(key.provider));
  
  if (healthcareKeys.length > 0) {
    // Check for proper environment segregation
    const productionHealthcareKeys = healthcareKeys.filter(key => key.environment === 'production');
    const nonProductionHealthcareKeys = healthcareKeys.filter(key => key.environment !== 'production');
    
    if (productionHealthcareKeys.length > 0 && nonProductionHealthcareKeys.length > 0) {
      issues.push({
        type: 'environment_segregation',
        severity: 'high',
        message: 'Healthcare keys should be properly segregated by environment',
        requirement: '164.308(a)(4) - Information System Activity Review'
      });
    }
  }
  
  const score = Math.max(0, 100 - (issues.length * 40));
  
  return {
    score,
    status: score > 80 ? 'compliant' : score > 60 ? 'partially_compliant' : 'non_compliant',
    issues,
    requirements: [
      '164.308(a)(4) - Information System Activity Review',
      '164.312(a)(1) - Access Control'
    ]
  };
}

function checkPCICompliance(keys: any[]) {
  const issues = [];
  
  // Check for payment-related providers
  const paymentProviders = ['stripe', 'paypal', 'square'];
  const paymentKeys = keys.filter(key => paymentProviders.includes(key.provider));
  
  if (paymentKeys.length > 0) {
    // Check for key rotation
    const now = new Date();
    const oldPaymentKeys = paymentKeys.filter(key => {
      const daysSinceCreated = (now.getTime() - new Date(key.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated > 180; // PCI requires more frequent rotation
    });
    
    if (oldPaymentKeys.length > 0) {
      issues.push({
        type: 'payment_key_rotation',
        severity: 'high',
        message: `${oldPaymentKeys.length} payment keys need rotation`,
        requirement: 'Requirement 8.2.4 - Change user passwords/passphrases at least once every 90 days'
      });
    }
  }
  
  const score = Math.max(0, 100 - (issues.length * 50));
  
  return {
    score,
    status: score > 80 ? 'compliant' : score > 60 ? 'partially_compliant' : 'non_compliant',
    issues,
    requirements: [
      'Requirement 8.2.4 - Password/Passphrase Changes',
      'Requirement 7.1 - Limit Access to System Components'
    ]
  };
}

function calculateOverallComplianceScore(results: any) {
  const scores = Object.values(results).map((r: any) => r.score);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function generateComplianceRecommendations(results: any, keys: any[]) {
  const recommendations = [];
  
  // Aggregate all issues
  const allIssues = Object.values(results).flatMap((r: any) => r.issues);
  
  // Group by type and generate recommendations
  const issueTypes = [...new Set(allIssues.map((i: any) => i.type))];
  
  issueTypes.forEach(type => {
    const typeIssues = allIssues.filter((i: any) => i.type === type);
    const severity = typeIssues.reduce((max: string, issue: any) => 
      issue.severity === 'high' ? 'high' : max === 'high' ? 'high' : issue.severity, 'low'
    );
    
    switch (type) {
      case 'key_rotation':
        recommendations.push({
          type,
          severity,
          title: 'Implement Key Rotation Policy',
          description: 'Establish regular key rotation schedules',
          actions: [
            'Set up automated key rotation reminders',
            'Create key rotation procedures',
            'Implement key versioning system'
          ]
        });
        break;
        
      case 'documentation':
        recommendations.push({
          type,
          severity,
          title: 'Improve Documentation',
          description: 'Add comprehensive documentation for all keys',
          actions: [
            'Document key purposes and usage',
            'Add responsible team/person information',
            'Include emergency contact details'
          ]
        });
        break;
        
      case 'access_monitoring':
        recommendations.push({
          type,
          severity,
          title: 'Enhance Access Monitoring',
          description: 'Implement better access tracking and monitoring',
          actions: [
            'Set up access alerts',
            'Regular access reviews',
            'Automated unused key detection'
          ]
        });
        break;
    }
  });
  
  return recommendations;
}

function isKeyCompliant(key: any) {
  const now = new Date();
  const daysSinceCreated = (now.getTime() - new Date(key.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceAccessed = (now.getTime() - new Date(key.lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
  
  // Basic compliance checks
  return daysSinceCreated < 365 && // Not too old
         daysSinceAccessed < 90 && // Recently accessed
         key.notes && key.notes.trim().length > 0 && // Has documentation
         key.tags && key.tags.length > 0; // Has classification
}