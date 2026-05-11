'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Brain,
  Activity,
  Target,
  Zap,
  Eye,
  Users,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThreeBackground } from '@/components/ThreeBackground';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';

interface AnalyticsData {
  totalKeys: number;
  keysByProvider: Array<{ _id: string; count: number }>;
  keysByEnvironment: Array<{ _id: string; count: number }>;
  usageOverTime: Array<{ _id: any; count: number }>;
  securityScore: number;
  risks: Array<{
    type: string;
    severity: string;
    count: number;
    message: string;
  }>;
  insights: {
    mostUsedProvider: string;
    environmentDistribution: Array<{ _id: string; count: number }>;
    averageKeyAge: number;
  };
}

interface AIInsight {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  icon: string;
}

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchAnalytics();
    fetchAIInsights();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/keys/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/keys/ai-insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BarChart3 className="h-16 w-16 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <ThreeBackground variant="neural" intensity={0.8} />
      
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
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Analytics & Insights
                </h1>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {analytics && (
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500">Overview</TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-purple-500">Security</TabsTrigger>
              <TabsTrigger value="ai-insights" className="data-[state=active]:bg-cyan-500">AI Insights</TabsTrigger>
              <TabsTrigger value="compliance" className="data-[state=active]:bg-green-500">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Key Metrics */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {[
                  {
                    icon: Shield,
                    value: analytics.totalKeys,
                    label: 'Total Keys',
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'from-blue-500/20 to-cyan-500/20'
                  },
                  {
                    icon: TrendingUp,
                    value: analytics.securityScore,
                    label: 'Security Score',
                    color: getSecurityScoreColor(analytics.securityScore).replace('text-', 'from-').replace('-600', '-500 to-') + analytics.securityScore >= 80 ? 'emerald-500' : analytics.securityScore >= 60 ? 'yellow-500' : 'red-500',
                    bgColor: analytics.securityScore >= 80 ? 'from-green-500/20 to-emerald-500/20' : analytics.securityScore >= 60 ? 'from-yellow-500/20 to-orange-500/20' : 'from-red-500/20 to-pink-500/20'
                  },
                  {
                    icon: AlertTriangle,
                    value: analytics.risks.length,
                    label: 'Risk Alerts',
                    color: 'from-orange-500 to-red-500',
                    bgColor: 'from-orange-500/20 to-red-500/20'
                  },
                  {
                    icon: Activity,
                    value: analytics.keysByProvider.length,
                    label: 'Providers',
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'from-purple-500/20 to-pink-500/20'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <GlassCard variant="premium" hover className="p-6">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={`p-3 rounded-full bg-gradient-to-r ${metric.bgColor}`}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <metric.icon className={`h-6 w-6 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
                        </motion.div>
                        <div>
                          <p className="text-2xl font-bold text-white">{metric.value}</p>
                          <p className="text-sm text-gray-300">{metric.label}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Provider Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <GlassCard variant="premium" className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      Provider Distribution
                    </h3>
                    <div className="space-y-4">
                      {analytics.keysByProvider.map((provider, index) => (
                        <div key={provider._id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                            <span className="text-white capitalize">{provider._id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-white/10 rounded-full h-2">
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${(provider.count / analytics.totalKeys) * 100}%` }}
                              />
                            </div>
                            <span className="text-gray-300 text-sm w-8">{provider.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Environment Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <GlassCard variant="premium" className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-400" />
                      Environment Distribution
                    </h3>
                    <div className="space-y-4">
                      {analytics.keysByEnvironment.map((env, index) => {
                        const colors = {
                          production: 'from-red-500 to-orange-500',
                          staging: 'from-yellow-500 to-amber-500',
                          development: 'from-green-500 to-emerald-500'
                        };
                        return (
                          <div key={env._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[env._id as keyof typeof colors] || 'from-gray-500 to-slate-500'}`} />
                              <span className="text-white capitalize">{env._id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-white/10 rounded-full h-2">
                                <div 
                                  className={`h-2 bg-gradient-to-r ${colors[env._id as keyof typeof colors] || 'from-gray-500 to-slate-500'} rounded-full`}
                                  style={{ width: `${(env.count / analytics.totalKeys) * 100}%` }}
                                />
                              </div>
                              <span className="text-gray-300 text-sm w-8">{env.count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-8">
              {/* Security Score */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <GlassCard variant="premium" className="p-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Security Score</h2>
                    <div className="relative w-48 h-48 mx-auto mb-6">
                      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={analytics.securityScore >= 80 ? '#10b981' : analytics.securityScore >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${analytics.securityScore * 2.51} 251`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${getSecurityScoreColor(analytics.securityScore)}`}>
                          {analytics.securityScore}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      {analytics.securityScore >= 80 ? 'Excellent security posture' : 
                       analytics.securityScore >= 60 ? 'Good security with room for improvement' : 
                       'Security needs attention'}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Risk Alerts */}
              {analytics.risks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <GlassCard variant="premium" className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      Security Risks
                    </h3>
                    <div className="space-y-4">
                      {analytics.risks.map((risk, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-5 w-5 ${risk.severity === 'high' ? 'text-red-400' : risk.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
                            <div>
                              <p className="text-white font-medium">{risk.message}</p>
                              <p className="text-gray-400 text-sm">{risk.count} keys affected</p>
                            </div>
                          </div>
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <GlassCard variant="cyber" className="p-6 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-8 w-8 text-cyan-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">AI-Powered Insights</h2>
                      <p className="text-gray-300">Intelligent analysis of your API key management patterns</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {aiInsights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aiInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <GlassCard variant="premium" hover className="p-6 h-full">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${insight.severity === 'high' ? 'bg-red-500/20' : insight.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                            <Eye className={`h-6 w-6 ${insight.severity === 'high' ? 'text-red-400' : insight.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-white">{insight.title}</h3>
                              <Badge className={getSeverityColor(insight.severity)}>
                                {insight.severity}
                              </Badge>
                            </div>
                            <p className="text-gray-300 mb-3">{insight.description}</p>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                              <p className="text-sm text-gray-400 mb-1">💡 Suggestion:</p>
                              <p className="text-sm text-white">{insight.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <GlassCard variant="cyber" className="text-center py-16">
                    <Brain className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">No Insights Available</h3>
                    <p className="text-gray-300">
                      Add more API keys to unlock AI-powered insights and recommendations.
                    </p>
                  </GlassCard>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <GlassCard variant="premium" className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Compliance Dashboard</h2>
                      <p className="text-gray-300">Monitor compliance with industry standards</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: 'SOC 2', score: 85, status: 'compliant' },
                      { name: 'ISO 27001', score: 78, status: 'partially_compliant' },
                      { name: 'GDPR', score: 92, status: 'compliant' },
                      { name: 'HIPAA', score: 88, status: 'compliant' },
                      { name: 'PCI DSS', score: 75, status: 'partially_compliant' },
                      { name: 'FedRAMP', score: 82, status: 'compliant' }
                    ].map((framework, index) => (
                      <motion.div
                        key={framework.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-white">{framework.name}</h3>
                            <Badge className={framework.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {framework.status === 'compliant' ? 'Compliant' : 'Partial'}
                            </Badge>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300">Score</span>
                              <span className="text-white font-medium">{framework.score}%</span>
                            </div>
                            <Progress value={framework.score} className="h-2" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}