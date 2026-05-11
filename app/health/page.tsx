'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Activity, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThreeBackground } from '@/components/ThreeBackground';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { toast } from 'sonner';

interface HealthResult {
  keyId: string;
  label: string;
  provider: string;
  status: 'healthy' | 'warning' | 'error';
  score: number;
  issues: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  recommendations: string[];
}

export default function Health() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [healthResults, setHealthResults] = useState<HealthResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchKeys();
  }, [session, status, router]);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (response.ok) {
        const keys = await response.json();
        setSelectedKeys(keys.map((key: any) => key._id));
      }
    } catch (error) {
      console.error('Failed to fetch keys:', error);
    }
  };

  const runHealthCheck = async () => {
    if (selectedKeys.length === 0) {
      toast.error('No keys selected for health check');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/keys/health-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyIds: selectedKeys }),
      });

      if (response.ok) {
        const data = await response.json();
        setHealthResults(data.results);
        toast.success(`Health check completed for ${data.results.length} keys`);
      } else {
        toast.error('Failed to run health check');
      }
    } catch (error) {
      toast.error('Failed to run health check');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const summary = healthResults.length > 0 ? {
    total: healthResults.length,
    healthy: healthResults.filter(r => r.status === 'healthy').length,
    warning: healthResults.filter(r => r.status === 'warning').length,
    error: healthResults.filter(r => r.status === 'error').length,
    averageScore: Math.round(healthResults.reduce((sum, r) => sum + r.score, 0) / healthResults.length)
  } : null;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="h-16 w-16 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <ThreeBackground variant="geometric" intensity={0.8} />
      
      {/* Header */}
      <motion.header 
        className="backdrop-blur-xl border-b border-white/10 relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <AnimatedButton variant="cyber" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </AnimatedButton>
              </Link>
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Health Monitor
                </h1>
              </div>
            </div>
            
            <AnimatedButton
              variant="glow"
              onClick={runHealthCheck}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Health Check
                </>
              )}
            </AnimatedButton>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Summary Cards */}
        {summary && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {[
              {
                icon: Activity,
                value: summary.total,
                label: 'Total Checked',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'from-blue-500/20 to-cyan-500/20'
              },
              {
                icon: CheckCircle,
                value: summary.healthy,
                label: 'Healthy',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'from-green-500/20 to-emerald-500/20'
              },
              {
                icon: AlertTriangle,
                value: summary.warning,
                label: 'Warnings',
                color: 'from-yellow-500 to-orange-500',
                bgColor: 'from-yellow-500/20 to-orange-500/20'
              },
              {
                icon: XCircle,
                value: summary.error,
                label: 'Errors',
                color: 'from-red-500 to-pink-500',
                bgColor: 'from-red-500/20 to-pink-500/20'
              },
              {
                icon: TrendingUp,
                value: `${summary.averageScore}%`,
                label: 'Avg Score',
                color: 'from-purple-500 to-violet-500',
                bgColor: 'from-purple-500/20 to-violet-500/20'
              }
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard variant="premium" hover className="p-6">
                  <div className="text-center">
                    <motion.div 
                      className={`inline-flex p-3 rounded-full bg-gradient-to-r ${metric.bgColor} mb-4`}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <metric.icon className={`h-6 w-6 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-sm text-gray-300">{metric.label}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Health Results */}
        {healthResults.length > 0 ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Health Check Results</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {healthResults.map((result, index) => (
                <motion.div
                  key={result.keyId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard variant="premium" hover className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h3 className="text-lg font-bold text-white">{result.label}</h3>
                          <p className="text-sm text-gray-400 capitalize">{result.provider}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <p className="text-sm text-gray-300 mt-1">Score: {result.score}%</p>
                      </div>
                    </div>
                    
                    {/* Health Score Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">Health Score</span>
                        <span className="text-white font-medium">{result.score}%</span>
                      </div>
                      <Progress 
                        value={result.score} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Issues */}
                    {result.issues.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Issues Found:</h4>
                        <div className="space-y-2">
                          {result.issues.map((issue, issueIndex) => (
                            <div key={issueIndex} className="flex items-start gap-2 p-2 bg-white/5 rounded border border-white/10">
                              <AlertTriangle className={`h-4 w-4 mt-0.5 ${getSeverityColor(issue.severity)}`} />
                              <div className="flex-1">
                                <p className="text-sm text-white">{issue.message}</p>
                                <Badge className={`text-xs mt-1 ${issue.severity === 'high' ? 'bg-red-100 text-red-800' : issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {issue.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations:</h4>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-blue-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard variant="cyber" className="text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="h-16 w-16 text-green-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready for Health Check</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Run a comprehensive health check to analyze your API keys for security issues, 
                usage patterns, and optimization opportunities.
              </p>
              <AnimatedButton variant="glow" onClick={runHealthCheck} disabled={isLoading}>
                <Zap className="mr-2 h-4 w-4" />
                Start Health Scan
              </AnimatedButton>
            </GlassCard>
          </motion.div>
        )}
      </main>
    </div>
  );
}