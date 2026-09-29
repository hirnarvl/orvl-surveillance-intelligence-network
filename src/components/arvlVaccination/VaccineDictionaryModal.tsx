import React, { useState } from 'react';
import { X, Search, Plus, Edit2, ShieldAlert, Check, BookOpen, Tag, Syringe } from 'lucide-react';
import { VaccineDictionaryEntry, VaccineCategory } from '../../types/arvlVaccination';

interface VaccineDictionaryModalProps {
  dictionary: VaccineDictionaryEntry[];
  canEdit?: boolean;
  onClose: () => void;
  onSaveEntry: (entry: VaccineDictionaryEntry) => Promise<void>;
}

export const VaccineDictionaryModal: React.FC<VaccineDictionaryModalProps> = ({
  dictionary,
  canEdit,
  onClose,
  onSaveEntry
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingEntry, setEditingEntry] = useState<VaccineDictionaryEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories: VaccineCategory[] = ['Viral', 'Bacterial', 'Zoonotic', 'Parasitic', 'Multivalent', 'Diagnostic / Biological'];

  const filtered = dictionary.filter(d => {
    const matchesSearch = 
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.officialName.toLowerCase().includes(search.toLowerCase()) ||
      d.targetSpecies.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleStartNew = () => {
    setEditingEntry({
      code: '',
      officialName: '',
      category: 'Viral',
      targetSpecies: '',
      description: '',
      active: true,
      notes: ''
    });
    setIsNew(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.code || !editingEntry.officialName) return;

    setIsSaving(true);
    try {
      await onSaveEntry(editingEntry);
      setEditingEntry(null);
      setIsNew(false);
    } catch (err) {
      console.error('Failed to save dictionary entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              Vaccine & Disease Code Dictionary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Authoritative nomenclature, etiology category, target species, and veterinary campaign notes for ARVL vaccination schedules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && !editingEntry && (
              <button
                type="button"
                onClick={handleStartNew}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Add Code
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {editingEntry ? (
          /* Edit Form */
          <form onSubmit={handleSave} className="py-6 space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {isNew ? 'Register New Vaccine Target' : `Editing Target: ${editingEntry.code}`}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Ensure accuracy with national veterinary guidelines and WOAH disease standards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Acronym / Code *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isNew}
                  value={editingEntry.code}
                  onChange={(e) => setEditingEntry({ ...editingEntry, code: e.target.value.trim().toUpperCase() })}
                  placeholder="e.g. LSD, FMD, Rab"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Veterinary Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.officialName}
                  onChange={(e) => setEditingEntry({ ...editingEntry, officialName: e.target.value })}
                  placeholder="e.g. Lumpy Skin Disease Vaccine (Homologous)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={editingEntry.category}
                  onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as VaccineCategory })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Species *
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.targetSpecies}
                  onChange={(e) => setEditingEntry({ ...editingEntry, targetSpecies: e.target.value })}
                  placeholder="e.g. Cattle, Sheep & Goats, Equines"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description & Strain Details
              </label>
              <textarea
                rows={3}
                value={editingEntry.description}
                onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                placeholder="Technical details, vaccine strain, dosage interval, etc."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campaign & Seasonal Notes
              </label>
              <input
                type="text"
                value={editingEntry.notes}
                onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                placeholder="e.g. Administered in Q1 before rainy season onset"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5"
              >
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>
        ) : (
          /* List & Search View */
          <div className="py-4 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code, name, species, description..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="All">All Categories ({dictionary.length})</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Dictionary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {filtered.map((item) => (
                <div
                  key={item.code}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black border font-mono ${item.colorClass || 'bg-slate-100 dark:bg-slate-800'}`}>
                          {item.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(item);
                            setIsNew(false);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                          title="Edit Dictionary Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.officialName}
                    </h4>

                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      Species: {item.targetSpecies}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.notes && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.notes}</span>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
                  No vaccine target found matching "{search}".
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
