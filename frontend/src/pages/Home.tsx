import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Campus Infrastructure Maintenance
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Fix campus issues faster with{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              transparent tracking
            </span>{' '}
            & predictive analytics.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Report maintenance problems anonymously or with your student profile. Get estimated
            resolution times powered by machine learning and track every repair step in real time.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button as={Link} to="/complaint" variant="primary" size="lg" className="shadow-md shadow-indigo-100">
              Report an Issue
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button as={Link} to="/track" variant="outline" size="lg">
              <Search className="w-4 h-4 text-slate-500" />
              Track Complaint
            </Button>
            <Button as={Link} to="/analytics" variant="ghost" size="lg">
              View Analytics
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-100 pt-10 text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xl font-bold text-slate-900">100%</span>
              <p className="text-xs text-slate-500 mt-1">Anonymous Reporting Supported</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xl font-bold text-indigo-600">&lt; 24h</span>
              <p className="text-xs text-slate-500 mt-1">Average Response Window</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xl font-bold text-emerald-600">ML-Driven</span>
              <p className="text-xs text-slate-500 mt-1">Resolution Time Estimator</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-2xl font-bold text-slate-900">500+</span>
              <p className="text-xs text-slate-500 mt-1">Maintenance Records Tracked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Designed for students, technicians, and campus leads
          </h2>
          <p className="mt-3 text-slate-600">
            A complete platform ensuring accountability, privacy, and proactive facilities management.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Anonymous Privacy</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Submit issues without providing your personal identity. You receive a secret cryptographic token to securely track updates without exposing your details.
            </p>
            <Button as={Link} to="/complaint" variant="outline" size="sm" className="w-full justify-between">
              Submit Anonymous Report
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Lifecycle Tracking</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Watch your report transition through clear milestones: Submitted &rarr; Acknowledged &rarr; In Progress &rarr; Resolved, complete with maintenance technician notes.
            </p>
            <Button as={Link} to="/track" variant="outline" size="sm" className="w-full justify-between">
              Check Status Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Predictive Maintenance</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              An scikit-learn machine learning pipeline predicts resolution duration based on historical category benchmarks, room location, and urgency flags.
            </p>
            <Button as={Link} to="/analytics" variant="outline" size="sm" className="w-full justify-between">
              Inspect Data Insights
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="primary" size="sm" className="mb-3">Simple 3-Step Process</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How CampusFix works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow">
                1
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Submit Your Issue</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose the location, category, severity, and description. Submit anonymously or signed in.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow">
                2
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Receive Tracking Key</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save your unique Complaint ID and secret token. Our model estimates when repairs will be finished.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-sm shadow">
                3
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Resolved & Verified</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Maintenance teams inspect, update progress remarks, and resolve the infrastructure defect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Guide */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <Badge variant="warning" size="sm">Evaluation & Review Accounts</Badge>
            <h3 className="text-2xl font-bold">Ready to evaluate all roles?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use pre-configured demo credentials to test administrator triage, data analyst dashboards, or student submissions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button as={Link} to="/login" variant="primary" size="md" className="bg-indigo-500 hover:bg-indigo-400">
              Sign In to Demo
            </Button>
            <Button as={Link} to="/track" variant="outline" size="md" className="bg-transparent text-white border-slate-600 hover:bg-white/10">
              Track a Sample
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              CF
            </div>
            <span className="font-semibold text-slate-700">CampusFix Maintenance & Analytics</span>
          </div>
          <p>© 2026 CampusFix. Data Science & Engineering Capstone Project.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
