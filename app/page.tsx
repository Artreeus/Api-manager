'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Eye, Search, Smartphone, Sparkles, Zap, Globe, Rocket, Satellite, Star, Users, Award, TrendingUp, BarChart3, Clock, CheckCircle, Brain, Activity } from 'lucide-react';
import { ThreeBackground } from '@/components/ThreeBackground';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedButton } from '@/components/AnimatedButton';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="h-16 w-16 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <ThreeBackground variant="solar-system" intensity={1.2} />
      
      {/* Header */}
      <motion.header 
        className="relative z-10 backdrop-blur-sm border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Shield className="h-10 w-10 text-blue-400" />
                <motion.div
                  className="absolute inset-0 bg-blue-400 rounded-full opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SecureKeys
              </h1>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <AnimatedButton variant="cyber" size="sm">
                  Sign In
                </AnimatedButton>
              </Link>
              <Link href="/auth/signup">
                <AnimatedButton variant="solar" size="sm">
                  Get Started
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative">
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-xl border border-white/20">
                <Rocket className="h-20 w-20 text-blue-400" />
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl sm:text-7xl font-bold mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Galactic API Key
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Security System
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Journey through the cosmos of API security with our interstellar key management platform. 
            Featuring quantum-grade encryption, orbital synchronization, and a stunning solar system interface 
            that makes security management feel like space exploration.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Link href="/auth/signup">
              <AnimatedButton variant="solar" size="lg">
                <Rocket className="mr-3 h-6 w-6" />
                Launch Mission
              </AnimatedButton>
            </Link>
            <Link href="/auth/signin">
              <AnimatedButton variant="cosmic" size="lg">
                <Satellite className="mr-3 h-6 w-6" />
                Access Station
              </AnimatedButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          {[
            {
              icon: Lock,
              title: "Quantum Encryption",
              description: "Military-grade AES encryption with quantum-resistant algorithms protects your keys from cosmic threats.",
              variant: "solar" as const,
              delay: 0
            },
            {
              icon: Satellite,
              title: "Orbital Sync",
              description: "Real-time synchronization across all your devices with zero-latency updates from our space stations.",
              variant: "cyber" as const,
              delay: 0.2
            },
            {
              icon: Brain,
              title: "AI Intelligence",
              description: "Advanced AI analyzes your key patterns and provides intelligent security recommendations.",
              variant: "cosmic" as const,
              delay: 0.4
            },
            {
              icon: Activity,
              title: "Health Monitoring",
              description: "Continuous health checks and real-time monitoring of all your API keys across the galaxy.",
              variant: "premium" as const,
              delay: 0.6
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              description: "Comprehensive analytics with security scoring, compliance tracking, and usage insights.",
              variant: "glow" as const,
              delay: 0.8
            },
            {
              icon: Globe,
              title: "Universal Portal",
              description: "Access your secure vault from any planet, moon, or space station in the known universe.",
              variant: "default" as const,
              delay: 1.0
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 + feature.delay }}
            >
              <GlassCard variant={feature.variant} hover glow className="h-full p-8">
                <div className="text-center">
                  <motion.div 
                    className="inline-flex p-4 rounded-full bg-gradient-to-r from-white/10 to-white/5 mb-6 backdrop-blur-xl border border-white/20"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trusted Across the Galaxy
            </h2>
            <p className="text-xl text-gray-300">Join millions of space explorers securing their digital assets</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "2.5M+", label: "Space Travelers", variant: "solar" as const },
              { icon: Key, value: "50M+", label: "Keys Secured", variant: "cyber" as const },
              { icon: Star, value: "99.9%", label: "Uptime", variant: "cosmic" as const },
              { icon: Award, value: "150+", label: "Planets Served", variant: "premium" as const }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 2.7 + index * 0.1 }}
              >
                <GlassCard variant={stat.variant} className="text-center p-6">
                  <stat.icon className="h-8 w-8 text-white mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mission Control Protocol
            </h2>
            <p className="text-xl text-gray-300">Simple steps to secure your digital universe</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Rocket,
                title: "Launch Sequence",
                description: "Create your secure account and initialize your personal space station with quantum encryption.",
                variant: "solar" as const
              },
              {
                step: "02",
                icon: Key,
                title: "Deploy Keys",
                description: "Add your API keys to the secure vault with automatic categorization and cosmic-level protection.",
                variant: "cosmic" as const
              },
              {
                step: "03",
                icon: Zap,
                title: "Navigate Galaxy",
                description: "Access, manage, and sync your keys across all devices with our stellar interface.",
                variant: "cyber" as const
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 3.2 + index * 0.2 }}
              >
                <GlassCard variant={step.variant} className="p-8 relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <div className="text-center pt-4">
                    <motion.div
                      className="inline-flex p-4 rounded-full bg-gradient-to-r from-white/10 to-white/5 mb-6 backdrop-blur-xl border border-white/20"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Choose Your Mission
            </h2>
            <p className="text-xl text-gray-300">Select the perfect plan for your space exploration needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Explorer",
                price: "Free",
                period: "Forever",
                description: "Perfect for solo space travelers",
                features: ["Up to 10 API keys", "Basic encryption", "Mobile access", "Community support"],
                variant: "cyber" as const,
                popular: false
              },
              {
                name: "Commander",
                price: "$9",
                period: "per month",
                description: "Ideal for small space crews",
                features: ["Unlimited API keys", "Quantum encryption", "Team sharing", "Priority support", "Advanced analytics"],
                variant: "cosmic" as const,
                popular: true
              },
              {
                name: "Admiral",
                price: "$29",
                period: "per month",
                description: "For large space fleets",
                features: ["Everything in Commander", "SSO integration", "Audit logs", "Custom integrations", "24/7 support"],
                variant: "solar" as const,
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 4.5 + index * 0.1 }}
              >
                <GlassCard 
                  variant={plan.variant}
                  className={`p-8 relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    </div>
                    <p className="text-gray-300 mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/auth/signup">
                      <AnimatedButton 
                        variant={plan.popular ? "cosmic" : plan.variant} 
                        className="w-full"
                      >
                        {plan.price === "Free" ? "Start Free" : "Launch Mission"}
                      </AnimatedButton>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 5 }}
        >
          <GlassCard variant="cosmic" glow className="p-16 max-w-4xl mx-auto">
            <motion.h2 
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Ready to Explore the Cosmos?
            </motion.h2>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Join the next generation of space explorers who trust SecureKeys to protect 
              their most valuable digital assets across the galaxy with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <AnimatedButton variant="solar" size="lg">
                  <Rocket className="mr-3 h-6 w-6" />
                  Begin Space Mission
                </AnimatedButton>
              </Link>
              <Link href="/auth/signin">
                <AnimatedButton variant="cosmic" size="lg">
                  <Satellite className="mr-3 h-6 w-6" />
                  Access Command Center
                </AnimatedButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 border-t border-white/10 mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 5.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">SecureKeys</span>
              </div>
              <p className="text-gray-400">
                Securing the galaxy's API keys with quantum-grade encryption and stellar user experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SecureKeys. All rights reserved across the galaxy.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}