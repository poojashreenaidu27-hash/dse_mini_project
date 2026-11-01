import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { apiPost } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'Wi-Fi and network connectivity',
  'Computer laboratory equipment',
  'Electrical issues',
  'Plumbing and water supply',
  'Projectors and classroom equipment',
  'Furniture and infrastructure',
  'Cleanliness and sanitation',
  'Other maintenance issues',
];

const LOCATIONS = [
  'Computer Lab',
  'Electronics Lab',
  'Library',
  'Classroom Block A',
  'Classroom Block B',
  'Auditorium',
  'Administrative Block',
  'Cafeteria',
  'Campus Common Area',
];

const SEVERITIES = [
  { value: 'Low', label: 'Low', desc: 'Minor inconvenience (e.g. loose door handle)' },
  { value: 'Medium', label: 'Medium', desc: 'Normal wear & tear or routine repair' },
  { value: 'High', label: 'High', desc: 'Disrupts class or daily laboratory operation' },
  { value: 'Critical', label: 'Critical', desc: 'Urgent hazard, water leak, or total outage' },
];

const schema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.string().min(1, { message: 'Please select a maintenance category' }),
  location: z.string().min(1, { message: 'Please select a campus facility or location' }),
  severity: z.string().min(1, { message: 'Please select a severity level' }),
});

type FormData = z.infer<typeof schema>;

interface ConfirmationData {
  id?: number;
  complaint_id: string;
  tracking_token?: string;
  category: string;
  location: string;
  severity: string;
  status: string;
  predicted_resolution_hours?: number;
}

export const SubmitComplaint: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [submitAnonymously, setSubmitAnonymously] = useState<boolean>(!user);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: '',
      location: '',
      severity: 'Medium',
      title: '',
      description: '',
    },
  });

  const selectedSeverity = watch('severity');

  const onSubmit = async (data: FormData) => {
    const isAnonymous = !user || submitAnonymously;
    const endpoint = isAnonymous
      ? '/api/v1/complaints/anonymous'
      : '/api/v1/complaints/identified';

    const payload = {
      title: data.title.trim(),
      description: `${data.title.trim()}: ${data.description.trim()}`,
      category: data.category,
      location: data.location,
      severity: data.severity,
      is_anonymous: isAnonymous,
    };

    try {
      const res: ApiResponse<ConfirmationData> = await apiPost<ConfirmationData, typeof payload>(
        endpoint,
        payload
      );

      if (res.error) {
        throw new Error(res.error);
      }

      setConfirmation(res.data);
      addNotification('success', `Complaint ${res.data.complaint_id} recorded successfully!`);
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to submit complaint. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* If confirmation received, show high-priority Confirmation Card */}
        {confirmation ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Complaint Registered!</h2>
              <p className="text-slate-600 text-sm mt-1">
                Your report has been entered into the facilities tracking pipeline.
              </p>
            </div>

            {/* Key info boxes */}
            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Complaint Identifier
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-mono font-bold text-indigo-700">
                    {confirmation.complaint_id}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(confirmation.complaint_id)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy ID
                  </Button>
                </div>
              </div>

              {confirmation.tracking_token && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Secret Tracking Token
                    </span>
                    <Badge variant="warning" size="sm">Save Immediately</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-bold text-slate-900 break-all pr-2">
                      {confirmation.tracking_token}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => copyToClipboard(confirmation.tracking_token!)}
                      className="bg-amber-600 hover:bg-amber-700 shrink-0"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedToken ? 'Copied' : 'Copy Token'}
                    </Button>
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    Because this report was submitted anonymously, this token is your only verification credential.
                  </p>
                </div>
              )}

              {confirmation.predicted_resolution_hours && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="text-xs text-indigo-900">
                    <span className="font-semibold">AI Estimated Resolution:</span>{' '}
                    ~{(confirmation.predicted_resolution_hours / 24).toFixed(1)} days ({confirmation.predicted_resolution_hours.toFixed(0)} hours) based on historical repair times.
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                as={Link}
                to={`/track?id=${encodeURIComponent(confirmation.complaint_id)}&token=${encodeURIComponent(
                  confirmation.tracking_token || ''
                )}`}
                variant="primary"
                size="md"
                className="flex-1 justify-center"
              >
                Track this Complaint
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setConfirmation(null);
                  reset();
                }}
                className="flex-1 justify-center"
              >
                Submit Another Issue
              </Button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report a Maintenance Issue</h1>
              <p className="text-sm text-slate-600 mt-1">
                Help maintenance staff identify, prioritize, and repair campus infrastructure defects.
              </p>
            </div>

            {/* Identity Status Pill */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user && !submitAnonymously ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Submitting as {user.display_name}
                      </p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Anonymous Mode Enabled</p>
                      <p className="text-[11px] text-slate-500">Your student name & email will not be recorded</p>
                    </div>
                  </>
                )}
              </div>

              {user && (
                <button
                  type="button"
                  onClick={() => setSubmitAnonymously(!submitAnonymously)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline self-start sm:self-auto cursor-pointer"
                >
                  {submitAnonymously ? 'Switch to Identified' : 'Switch to Anonymous'}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <Input
                label="Issue Title"
                placeholder="e.g. Wi-Fi dropping intermittently in 3rd floor reading hall"
                error={errors.title?.message}
                {...register('title')}
              />

              {/* Category & Location Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    className={`block w-full rounded-lg border bg-white py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                      errors.category
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }`}
                    {...register('category')}
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Location / Facility
                  </label>
                  <select
                    className={`block w-full rounded-lg border bg-white py-2.5 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                      errors.location
                        ? 'border-rose-300 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }`}
                    {...register('location')}
                  >
                    <option value="">Select facility...</option>
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.location.message}</p>
                  )}
                </div>
              </div>

              {/* Severity Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SEVERITIES.map((s) => {
                    const isSelected = selectedSeverity === s.value;
                    return (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => setValue('severity', s.value)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {s.label}
                          </span>
                          <Badge
                            variant={
                              s.value === 'Critical'
                                ? 'critical'
                                : s.value === 'High'
                                ? 'high'
                                : s.value === 'Medium'
                                ? 'medium'
                                : 'low'
                            }
                            size="sm"
                          >
                            {s.value}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                          {s.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {errors.severity && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.severity.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Problem Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide specific details such as room number, device label, when the problem started, and any safety hazards..."
                  className={`block w-full rounded-lg border bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    errors.description
                      ? 'border-rose-300 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{errors.description.message}</p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full justify-center shadow-md shadow-indigo-100"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Report...
                    </span>
                  ) : (
                    'Submit Maintenance Complaint'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitComplaint;
