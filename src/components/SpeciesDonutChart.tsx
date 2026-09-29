import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Layers, Download } from 'lucide-react';
import { GiCow, GiGoat, GiSheep, GiChicken, GiHorseHead, GiCamel, GiPig } from 'react-icons/gi';
import { ARVL_SPECIES_DISTRIBUTION, HRVL_SPECIES_DISTRIBUTION } from '../data/sampleData';
import { Locale, SurveillanceRecord } from '../types';
import { translations } from '../utils/translations';
import { useI18n } from '../contexts/I18nContext';
import { useLaboratory } from '../contexts/LaboratoryContext';
import { exportToCSV } from '../utils/export';
import { soundEngine } from '../utils/sound';

interface SpeciesDonutChartProps {
  darkMode: boolean;
  locale?: Locale;
  records?: SurveillanceRecord[];
  laboratoryId?: 'hrvl' | 'arvl' | 'all' | string;
}

// Custom Infographic Animal Vector Icons for 7 Livestock Species
const SpeciesIcons: Record<string, React.FC<{ className?: string }>> = {
  Cattle: ({ className }) => React.createElement(GiCow, { className }),
  Goats: ({ className }) => React.createElement(GiGoat, { className }),
  Sheep: ({ className }) => React.createElement(GiSheep, { className }),
  Poultry: ({ className }) => React.createElement(GiChicken, { className }),
  Equines: ({ className }) => React.createElement(GiHorseHead, { className }),
  Camels: ({ className }) => React.createElement(GiCamel, { className }),
  'Swine / Others': ({ className }) => React.createElement(GiPig, { className })
};

export const SpeciesDonutChart: React.FC<SpeciesDonutChartProps> = ({ 
  darkMode, 
  locale,
  records,
  laboratoryId 
}) => {
  const { locale: i18nLocale, t: i18nT } = useI18n();
  const { selectedLab, currentLabInfo, getLabHeader } = useLaboratory();
  const t = locale ? translations[locale] : i18nT;

  const activeLab = laboratoryId || selectedLab || 'hrvl';
  const isArvl = activeLab === 'arvl';

  // Strict Laboratory Data Isolation for Species Distribution
  const speciesData = useMemo(() => {
    // If filtered records for this lab are provided, aggregate from case data
    if (records && records.length > 0) {
      const counts: Record<string, number> = {
        Cattle: 0,
        Sheep: 0,
        Goats: 0,
        Poultry: 0,
        Equines: 0,
        Camels: 0,
        'Swine / Others': 0
      };
      let hasValidRecordCases = false;

      records.forEach(r => {
        if (r.species && (r.cases || 0) > 0) {
          const sp = r.species.trim();
          if (counts[sp] !== undefined) {
            counts[sp] += r.cases;
            hasValidRecordCases = true;
          } else if (sp.toLowerCase().includes('cattle') || sp.toLowerCase().includes('cow') || sp.toLowerCase().includes('bovine')) {
            counts['Cattle'] += r.cases;
            hasValidRecordCases = true;
          } else if (sp.toLowerCase().includes('sheep') || sp.toLowerCase().includes('ovine')) {
            counts['Sheep'] += r.cases;
            hasValidRecordCases = true;
          } else if (sp.toLowerCase().includes('goat') || sp.toLowerCase().includes('caprine')) {
            counts['Goats'] += r.cases;
            hasValidRecordCases = true;
          } else if (sp.toLowerCase().includes('poultry') || sp.toLowerCase().includes('chicken') || sp.toLowerCase().includes('avian')) {
            counts['Poultry'] += r.cases;
            hasValidRecordCases = true;
          } else if (sp.toLowerCase().includes('equine') || sp.toLowerCase().includes('horse') || sp.toLowerCase().includes('donkey') || sp.toLowerCase().includes('mule')) {
            counts['Equines'] += r.cases;
            hasValidRecordCases = true;
          } else if (sp.toLowerCase().includes('camel')) {
            counts['Camels'] += r.cases;
            hasValidRecordCases = true;
          } else {
            counts['Swine / Others'] += r.cases;
            hasValidRecordCases = true;
          }
        }
      });

      if (hasValidRecordCases) {
        const baseColors: Record<string, string> = {
          Cattle: '#2563eb',
          Sheep: '#eab308',
          Goats: '#16a34a',
          Equines: '#8b5cf6',
          Poultry: '#f97316',
          Camels: '#06b6d4',
          'Swine / Others': '#ec4899'
        };
        const order = isArvl
          ? ['Cattle', 'Sheep', 'Goats', 'Equines', 'Poultry', 'Camels', 'Swine / Others']
          : ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Equines', 'Camels', 'Swine / Others'];
        
        return order
          .map(name => ({
            name,
            cases: counts[name] || 0,
            color: baseColors[name]
          }))
          .filter(s => s.cases > 0);
      }
    }

    // Authoritative Operational Area Baseline Datasets
    return isArvl ? ARVL_SPECIES_DISTRIBUTION : HRVL_SPECIES_DISTRIBUTION;
  }, [records, isArvl]);

  const totalCases = useMemo(() => {
    return speciesData.reduce((acc, curr) => acc + curr.cases, 0);
  }, [speciesData]);

  const handleExportCSV = () => {
    soundEngine.playSuccess();
    const rows = speciesData.map(s => ({
      Species: s.name,
      Reported_Cases: s.cases,
      Percentage: Number(((s.cases / (totalCases || 1)) * 100).toFixed(2)),
      Hex_Color: s.color,
      Total_Dataset_Cases: totalCases,
      Export_Date: new Date().toISOString().slice(0, 10),
      Laboratory: `${currentLabInfo.fullName} (${currentLabInfo.shortCode})`,
      Operational_Area: isArvl ? 'Arsi, West Arsi, Bale, East Bale, East Shewa (122 Woredas)' : 'East & West Hararghe (36 Woredas)'
    }));
    exportToCSV(`${currentLabInfo.shortCode}_Species_Distribution_Operational_Data_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 transition-colors flex flex-col justify-between">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{getLabHeader(t.speciesDistributionTitle)}</h3>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {isArvl 
              ? 'ARVL Operational Corridors: Arsi, West Arsi, Bale, East Bale & Shewa'
              : 'HRVL Operational Corridors: East & West Hararghe (36 Woredas)'}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            {t.speciesTotal} {totalCases.toLocaleString()}
          </span>
          <button
            id="download-species-chart-data-btn"
            onClick={handleExportCSV}
            title={`Download ${currentLabInfo.shortCode} Species Chart Data as CSV`}
            aria-label="Download Species Chart Data as CSV"
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">Download Data</span>
          </button>
        </div>
      </div>

      <div className="h-60 w-full mt-2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={speciesData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="cases"
            >
              {speciesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={darkMode ? '#0f172a' : '#ffffff'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                borderColor: darkMode ? '#334155' : '#cbd5e1',
                borderRadius: '0.5rem',
                color: darkMode ? '#ffffff' : '#0f172a',
                fontSize: '12px',
                fontWeight: '600'
              }}
              formatter={(value: any, name: any) => [`${value} cases (${((value / (totalCases || 1)) * 100).toFixed(1)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-black text-slate-900 dark:text-white">{totalCases.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t.speciesTotalCases}</span>
        </div>
      </div>

      {/* Compact Infographic Legend List with direct key-value alignment */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {speciesData.map(s => {
          const IconComp = SpeciesIcons[s.name] || SpeciesIcons['Cattle'];
          const pct = ((s.cases / (totalCases || 1)) * 100).toFixed(1);
          return (
            <div 
              key={s.name} 
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <div 
                className="p-1 rounded-md flex items-center justify-center shrink-0" 
                style={{ backgroundColor: `${s.color}18`, color: s.color }}
                title={s.name}
              >
                <IconComp className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center space-x-1 min-w-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {s.name}:
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                  {s.cases.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                  ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

