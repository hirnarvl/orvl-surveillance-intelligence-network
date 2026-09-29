import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { ARVLVaccinationRecord, VaccineDictionaryEntry, EthiopianFiscalMonthKey } from '../../types/arvlVaccination';
import { MONTH_ORDER, MONTH_LABELS, FISCAL_QUARTERS } from '../../data/arvlVaccinationData';
import { Syringe, Calendar, BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';

interface ARVLVaccinationAnalyticsProps {
  records: ARVLVaccinationRecord[];
  dictionary: VaccineDictionaryEntry[];
  onSelectTarget: (target: string) => void;
}

export const ARVLVaccinationAnalytics: React.FC<ARVLVaccinationAnalyticsProps> = ({
  records,
  dictionary,
  onSelectTarget
}) => {
  // 1. Target Frequency Across Districts
  const targetCounts = new Map<string, number>();
  // 2. Monthly Total Activities
  const monthlyActivityCounts: Record<EthiopianFiscalMonthKey, number> = {
    july: 0,
    august: 0,
    september: 0,
    october: 0,
    november: 0,
    december: 0,
    january: 0,
    february: 0,
    march: 0,
    april: 0,
    may: 0,
    june: 0
  };

  // 3. Zone counts
  const zoneCounts = new Map<string, { total: number; active: number }>();

  records.forEach(r => {
    // Zone aggregation
    const curZone = zoneCounts.get(r.zone) || { total: 0, active: 0 };
    curZone.total++;

    let districtHasTarget = false;
    const districtTargets = new Set<string>();

    MONTH_ORDER.forEach(m => {
      const targets = r.months[m] || [];
      if (targets.length > 0) {
        monthlyActivityCounts[m] += targets.length;
        districtHasTarget = true;
        targets.forEach(t => {
          districtTargets.add(t);
        });
      }
    });

    if (districtHasTarget) {
      curZone.active++;
    }
    zoneCounts.set(r.zone, curZone);

    districtTargets.forEach(t => {
      targetCounts.set(t, (targetCounts.get(t) || 0) + 1);
    });
  });

  // Convert target counts to sorted array
  const targetData = Array.from(targetCounts.entries())
    .map(([target, count]) => {
      const dictMatch = dictionary.find(d => d.code.toUpperCase() === target.toUpperCase());
      return {
        target,
        count,
        name: dictMatch ? dictMatch.officialName : target,
        category: dictMatch?.category || 'Uncategorized'
      };
    })
    .sort((a, b) => b.count - a.count);

  // Convert monthly activity to array
  const monthlyData = MONTH_ORDER.map(mKey => ({
    monthKey: mKey,
    month: MONTH_LABELS[mKey].short,
    fullName: MONTH_LABELS[mKey].full,
    quarter: MONTH_LABELS[mKey].quarter,
    activities: monthlyActivityCounts[mKey]
  }));

  // Quarterly Activity Breakdown
  const quarterData = (['Q1', 'Q2', 'Q3', 'Q4'] as const).map(qKey => {
    const qInfo = FISCAL_QUARTERS[qKey];
    const totalActivities = qInfo.months.reduce((acc, m) => acc + monthlyActivityCounts[m], 0);
    return {
      quarter: qKey,
      name: qInfo.name,
      months: qInfo.months.map(m => MONTH_LABELS[m].short).join(', '),
      totalActivities
    };
  });

  // Zone Data
  const zoneData = Array.from(zoneCounts.entries())
    .map(([zone, stats]) => ({
      zone,
      totalDistricts: stats.total,
      activeDistricts: stats.active,
      coveragePercent: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
    }))
    .sort((a, b) => b.totalDistricts - a.totalDistricts);

  const topTarget = targetData[0];
  const peakMonth = [...monthlyData].sort((a, b) => b.activities - a.activities)[0];

  const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* 3 Executive Insight Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Most Planned Vaccine</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {topTarget ? `${topTarget.target} (${topTarget.count} districts)` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {topTarget?.name}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Peak Campaign Load</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {peakMonth ? `${peakMonth.fullName} (${peakMonth.quarter})` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400">
              {peakMonth?.activities} total district campaign instances
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ethiopian Fiscal Cycle</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              12 Months (Jul–Jun)
            </div>
            <div className="text-[11px] text-slate-400">
              Preserving original Q1–Q4 reporting alignment
            </div>
          </div>
        </div>
      </div>

      {/* Chart 1: Target Frequency Across Districts */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Syringe className="w-4 h-4 text-emerald-600" />
              Target Disease Coverage (Number of Operational Districts with Scheduled Campaigns)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any bar to quickly filter the calendar view for that specific vaccine target.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
            {targetData.length} Target Vaccines
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={targetData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis 
                dataKey="target" 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-emerald-400 text-sm">{data.target}</div>
                        <div>{data.name}</div>
                        <div className="text-slate-300">Category: {data.category}</div>
                        <div className="font-semibold text-white pt-1 border-t border-slate-800">
                          {data.count} Districts Scheduled
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]}
                onClick={(entry: any) => {
                  if (entry && entry.target) {
                    onSelectTarget(entry.target);
                  }
                }}
                cursor="pointer"
              >
                {targetData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#059669' : index < 4 ? '#10b981' : '#34d399'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: 2 Charts: Monthly Distribution & Quarter Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Area Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Monthly Campaign Activity Distribution (July–June)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated district vaccination activities across the 12 Ethiopian fiscal months.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg text-xs">
                          <div className="font-bold text-sky-400">{data.fullName} ({data.quarter})</div>
                          <div className="text-white font-semibold mt-1">
                            {data.activities} Planned Activities
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="activities" 
                  stroke="#0ea5e9" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#monthGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quarter Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              Quarterly Operational Campaign Volume
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparison between Q1 (Jul–Sep), Q2 (Oct–Dec), Q3 (Jan–Mar), and Q4 (Apr–Jun).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {quarterData.map((q, idx) => (
              <div 
                key={q.quarter}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{q.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {q.quarter}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {q.totalActivities}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Months: {q.months}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone-Level Implementation Coverage Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Zone Administrative Coverage & Planning Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total operational units vs units with active scheduled campaigns by zone.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Administrative Zone</th>
                <th className="px-4 py-3 text-center">Total Districts</th>
                <th className="px-4 py-3 text-center">Districts with Plan</th>
                <th className="px-4 py-3 text-center">Coverage</th>
                <th className="px-4 py-3">Planning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {zoneData.map((z, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{z.zone}</td>
                  <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-mono">{z.totalDistricts}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400 font-mono font-bold">{z.activeDistricts}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${z.coveragePercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-semibold">{z.coveragePercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {z.coveragePercent === 100 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        100% Scheduled
                      </span>
                    ) : z.coveragePercent > 50 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                        Partial Schedules
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Low Coverage
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
