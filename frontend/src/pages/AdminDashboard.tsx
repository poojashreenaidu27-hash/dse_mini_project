import React, { useEffect, useState, useMemo } from 'react';
import { apiGet, apiPatch } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { Complaint } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNotification } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Building,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'Submitted',
  'Acknowledged',
  'In Progress',
  'On Hold',
  'Resolved',
  'Reopened',
];

export const AdminDashboard: React.FC = () => {
  const { addNotification } = useNotification();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const fetchComplaints = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res: ApiResponse<any> = await apiGet<any>('/api/v1/admin/complaints?limit=100');
      if (res.error) throw new Error(res.error);

      const items: Complaint[] = Array.isArray(res.data)
        ? res.data
        : res.data?.items || [];
      setComplaints(items);
      if (isManualRefresh) addNotification('info', 'Complaints list refreshed.');
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to fetch complaints list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId: string | number, newStatus: string) => {
    setUpdatingId(complaintId);
    try {
      const payload = { new_status: newStatus };
      const res: ApiResponse<any> = await apiPatch<any, typeof payload>(
        `/api/v1/admin/complaints/${complaintId}/status`,
        payload
      );

      if (res.error) throw new Error(res.error);

      // Update state locally
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaint_id === complaintId || c.id === complaintId
            ? { ...c, status: res.data?.status || newStatus }
            : c
        )
      );
      addNotification('success', `Complaint status updated to ${newStatus}`);
    } catch (err: any) {
      addNotification('error', err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute KPI metrics
  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const pending = complaints.filter(
      (c) => c.status === 'Submitted' || c.status === 'Acknowledged'
    ).length;
    const critical = complaints.filter(
      (c) => c.severity === 'Critical' && c.status !== 'Resolved'
    ).length;

    return { total, resolved, inProgress, pending, critical };
  }, [complaints]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        (c.complaint_id && c.complaint_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSeverity =
        severityFilter === 'all' || c.severity.toLowerCase() === severityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [complaints, searchQuery, statusFilter, severityFilter]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Campus Facilities & Maintenance Work Order Dispatch
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchComplaints(true)}
            disabled={refreshing}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Total Work Orders</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
              <FolderOpen className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Pending Review</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">In Progress</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-sky-600">{stats.inProgress}</span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Resolved</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-emerald-600">{stats.resolved}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-xs font-medium text-slate-500">Urgent Hazards</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-rose-600">{stats.critical}</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by ID, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading work orders...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No complaints found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Complaint ID</th>
                    <th className="py-3 px-4">Facility & Issue</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status & Action</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((c) => {
                    const compId = c.complaint_id || `CFX-${c.id}`;
                    const isUpdating = updatingId === c.complaint_id || updatingId === c.id;

                    return (
                      <tr key={c.id || c.complaint_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                          {compId}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-700">{c.location}</span>
                            {c.is_anonymous && (
                              <span className="text-[10px] text-slate-400 italic">· Anonymous</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">
                            {c.title || c.description}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap text-slate-600">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              c.severity === 'Critical'
                                ? 'critical'
                                : c.severity === 'High'
                                ? 'high'
                                : c.severity === 'Medium'
                                ? 'medium'
                                : 'low'
                            }
                          >
                            {c.severity}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={c.status}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleStatusChange(c.complaint_id || c.id, e.target.value)
                              }
                              className={`text-xs font-semibold rounded-lg border py-1.5 px-2 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors ${
                                c.status === 'Resolved'
                                  ? 'border-emerald-300 text-emerald-800 bg-emerald-50/50'
                                  : c.status === 'In Progress'
                                  ? 'border-sky-300 text-sky-800 bg-sky-50/50'
                                  : c.status === 'On Hold'
                                  ? 'border-slate-300 text-slate-700'
                                  : 'border-amber-300 text-amber-800 bg-amber-50/50'
                              }`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            {isUpdating && (
                              <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-right text-slate-500 whitespace-nowrap">
                          {c.submitted_at
                            ? new Date(c.submitted_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing {filteredComplaints.length} of {complaints.length} work orders
            </span>
            <span>Total records: {complaints.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
