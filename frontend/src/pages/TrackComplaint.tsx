import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { TrackingInfo } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  Search,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  Calendar,
} from 'lucide-react';

const schema = z.object({
  complaintId: z.string().min(1, { message: 'Complaint ID is required (e.g. CFX-2026-X8N4K)' }),
  token: z.string().min(1, { message: 'Secret tracking token is required' }),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Submitted', 'Acknowledged', 'In Progress', 'Resolved'];

export const TrackComplaint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      complaintId: searchParams.get('id') || '',
      token: searchParams.get('token') || '',
    },
  });

  const fetchTracking = async (complaintId: string, token: string) => {
    setErrorMsg('');
    setLoading(true);
    setTracking(null);

    try {
      const url = `/api/v1/track/${encodeURIComponent(complaintId.trim())}?token=${encodeURIComponent(
        token.trim()
      )}`;
      const res: ApiResponse<TrackingInfo> = await apiGet<TrackingInfo>(url);

      if (res.error) {
        throw new Error(res.error);
      }
      setTracking(res.data);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Could not verify complaint status. Please verify the Complaint ID and secret token."
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: FormData) => {
    fetchTracking(data.complaintId, data.token);
  };

  // Auto-search if query params are present in URL
  useEffect(() => {
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    if (id && token) {
      setValue('complaintId', id);
      setValue('token', token);
      fetchTracking(id, token);
    }
  }, [searchParams, setValue]);

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('resolved')) return 3;
    if (s.includes('progress') || s.includes('hold')) return 2;
    if (s.includes('acknowledged')) return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Search className="w-3.5 h-3.5" />
            Transparent Verification
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Track Your Complaint</h1>
          <p className="text-sm text-slate-600 mt-2">
            Enter your unique Complaint ID and the secret token provided during report creation.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Complaint ID"
                placeholder="e.g. CFX-2026-X8N4K"
                icon={<Search className="w-4 h-4" />}
                error={errors.complaintId?.message}
                {...register('complaintId')}
              />
              <Input
                label="Secret Tracking Token"
                type="password"
                placeholder="cfx_sec_..."
                icon={<Key className="w-4 h-4" />}
                error={errors.token?.message}
                {...register('token')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Credentials...
                </span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Look Up Status
                </>
              )}
            </Button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Failed</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Details Result */}
        {tracking && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                  {tracking.complaint.complaint_id}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      tracking.complaint.severity === 'Critical'
                        ? 'critical'
                        : tracking.complaint.severity === 'High'
                        ? 'high'
                        : tracking.complaint.severity === 'Medium'
                        ? 'medium'
                        : 'low'
                    }
                  >
                    {tracking.complaint.severity}
                  </Badge>
                  <Badge
                    variant={
                      tracking.complaint.status === 'Resolved'
                        ? 'resolved'
                        : tracking.complaint.status === 'In Progress'
                        ? 'in_progress'
                        : 'submitted'
                    }
                    size="md"
                  >
                    {tracking.complaint.status}
                  </Badge>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {tracking.complaint.title || tracking.complaint.description}
              </h2>
            </div>

            {/* Lifecycle Visual Step Tracker */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
                Lifecycle Progress
              </h3>
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-indigo-600 -z-0 transition-all duration-500"
                  style={{
                    width: `${(getStepIndex(tracking.complaint.status) / (STEPS.length - 1)) * 100}%`,
                  }}
                />

                <div className="relative z-10 flex justify-between">
                  {STEPS.map((step, idx) => {
                    const currentIndex = getStepIndex(tracking.complaint.status);
                    const isDone = idx < currentIndex;
                    const isCurrent = idx === currentIndex;

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : isCurrent
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium text-center ${
                            isCurrent
                              ? 'text-indigo-700 font-bold'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                  <Building className="w-3.5 h-3.5" />
                  Facility Location
                </div>
                <p className="text-sm font-semibold text-slate-900">{tracking.complaint.location}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted On
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {tracking.complaint.submitted_at
                    ? new Date(tracking.complaint.submitted_at).toLocaleDateString()
                    : 'Recent'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Estimated Resolution
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {tracking.complaint.resolution_estimate
                    ? `~${tracking.complaint.resolution_estimate} days`
                    : '1 - 2 business days'}
                </p>
              </div>
            </div>

            {/* Audit History & Public Remarks */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Audit Trail & Maintenance Remarks
              </h3>

              <div className="space-y-3">
                {tracking.status_history && tracking.status_history.length > 0 ? (
                  tracking.status_history.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3.5"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">{entry.status}</span>
                          <span className="text-xs text-slate-400">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        {entry.note ? (
                          <p className="text-slate-600 text-xs bg-white p-2.5 rounded-lg border border-slate-200 mt-1.5">
                            {entry.note}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">Status recorded in system.</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No historical status notes yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;
