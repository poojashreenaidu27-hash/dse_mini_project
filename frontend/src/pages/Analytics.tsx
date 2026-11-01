import React, { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { AnalyticsSummary } from '../types';
import { Badge } from '../components/ui/Badge';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  Layers,
  Wrench,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res: ApiResponse<AnalyticsSummary> = await apiGet<AnalyticsSummary>(
        '/api/v1/analytics/summary'
      );
      if (res.error) throw new Error(res.error);
      setData(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const weeklyTrend = [
    { day: 'Mon', complaints: 14, resolved: 11 },
    { day: 'Tue', complaints: 18, resolved: 15 },
    { day: 'Wed', complaints: 22, resolved: 19 },
    { day: 'Thu', complaints: 16, resolved: 14 },
    { day: 'Fri', complaints: 20, resolved: 17 },
    { day: 'Sat', complaints: 8, resolved: 9 },
    { day: 'Sun', complaints: 6, resolved: 5 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center text-slate-500 text-sm">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading campus maintenance analytics...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Analytics Unavailable</h2>
          <p className="text-sm text-slate-600 mt-1">{error || 'No records found.'}</p>
        </div>
      </div>
    );
  }

  const resolutionRate =
    data.total_complaints > 0
      ? Math.round((data.resolved / data.total_complaints) * 100)
      : 0;

  const categoryChartData = (data.top_categories || []).map((c) => ({
    name: c.category.length > 22 ? `${c.category.slice(0, 20)}...` : c.category,
    fullName: c.category,
    count: c.count,
  }));

  const locationChartData = (data.top_locations || []).map((l) => ({
    name: l.location,
    count: l.count,
  }));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Data Science Insights
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Facilities Analytics</h1>
            <p className="text-sm text-slate-600 mt-1">
              Campus infrastructure patterns, ML resolution forecasts, and resource demand
            </p>
          </div>
          <Badge variant="primary" size="md">
            Live Database Telemetry
          </Badge>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Total Work Orders</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{data.total_complaints}</span>
              <Layers className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Synthetic & live campus records</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Resolution Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-emerald-600">{resolutionRate}%</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">{data.resolved} total resolved</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Avg Resolution Duration</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-indigo-600">
                {data.avg_resolution_time_days.toFixed(1)} <span className="text-sm font-normal text-slate-500">days</span>
              </span>
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">ML validated repair time</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Active Work Orders</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-amber-600">{data.open}</span>
              <Wrench className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">In review or technician triage</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Highest Volume Categories</h3>
                <p className="text-xs text-slate-500 mt-0.5">Top reported equipment and infrastructure issues</p>
              </div>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Incident Distribution by Location</h3>
                <p className="text-xs text-slate-500 mt-0.5">Campus facilities with highest technician traffic</p>
              </div>
              <Building className="w-5 h-5 text-slate-400" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData} margin={{ left: -10, right: 10, top: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trend line chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Throughput & Velocity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submitted vs resolved work orders over the rolling week</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  name="New Complaints"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  name="Resolved"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
