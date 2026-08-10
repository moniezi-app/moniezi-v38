import React, { useEffect, useMemo, useState } from 'react';
import type { GlobalSearchGroup, GlobalSearchResult, GlobalSearchTone } from '../features/search/globalSearch';
import {
  ArrowRight,
  Car,
  ClipboardList,
  FileText,
  Briefcase,
  Receipt,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

interface GlobalSearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  groups: GlobalSearchGroup[];
  onClose: () => void;
  onSelect: (result: GlobalSearchResult) => void;
}

const toneClasses: Record<GlobalSearchTone, { icon: string; badge: string; label: string }> = {
  income: {
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
    label: 'Income',
  },
  expense: {
    icon: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
    label: 'Expense',
  },
  invoice: {
    icon: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
    label: 'Invoice',
  },
  estimate: {
    icon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200',
    label: 'Estimate',
  },
  client: {
    icon: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
    label: 'Client',
  },
  job: {
    icon: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200',
    badge: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-200',
    label: 'Job',
  },
  mileage: {
    icon: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200',
    label: 'Mileage',
  },
  receipt: {
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
    label: 'Receipt',
  },
};

const iconForTone = (tone: GlobalSearchTone) => {
  switch (tone) {
    case 'income': return <TrendingUp size={19} strokeWidth={1.8} />;
    case 'expense': return <TrendingDown size={19} strokeWidth={1.8} />;
    case 'invoice': return <FileText size={19} strokeWidth={1.8} />;
    case 'estimate': return <ClipboardList size={19} strokeWidth={1.8} />;
    case 'client': return <Users size={19} strokeWidth={1.8} />;
    case 'job': return <Briefcase size={19} strokeWidth={1.8} />;
    case 'mileage': return <Car size={19} strokeWidth={1.8} />;
    case 'receipt': return <Receipt size={19} strokeWidth={1.8} />;
  }
};

const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const source = String(text || '');
  const lowerSource = source.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let matchIndex = lowerSource.indexOf(lowerQuery, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) parts.push(source.slice(cursor, matchIndex));
    parts.push(
      <mark
        key={`${matchIndex}-${cursor}`}
        className="rounded bg-yellow-200/90 px-0.5 text-inherit dark:bg-yellow-400/30 dark:text-white"
      >
        {source.slice(matchIndex, matchIndex + trimmed.length)}
      </mark>
    );
    cursor = matchIndex + trimmed.length;
    matchIndex = lowerSource.indexOf(lowerQuery, cursor);
  }

  if (cursor < source.length) parts.push(source.slice(cursor));
  return <>{parts.length ? parts : source}</>;
};

export const GlobalSearchPanel: React.FC<GlobalSearchPanelProps> = ({
  query,
  onQueryChange,
  groups,
  onClose,
  onSelect,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const trimmedQuery = query.trim();
  const totalMatches = useMemo(() => groups.reduce((sum, group) => sum + group.results.length, 0), [groups]);

  useEffect(() => {
    setExpandedGroups({});
  }, [trimmedQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99990] flex flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white modal-overlay"
      style={{
        paddingTop: 'max(10px, env(safe-area-inset-top, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Search MONIEZI"
    >
      <div className="shrink-0 border-b border-slate-200 bg-white/95 px-4 pb-4 pt-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              size={20}
              strokeWidth={1.8}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            />
            <input
              autoFocus
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search MONIEZI"
              aria-label="Search MONIEZI"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-11 text-base font-semibold text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={17} strokeWidth={2} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Close search"
            title="Close search"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 custom-scrollbar sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {trimmedQuery.length < 2 ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <Search size={30} strokeWidth={1.6} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">Find anything in MONIEZI</h2>
              <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                Search transactions, invoices, estimates, clients, jobs, mileage and receipts. Enter at least two characters.
              </p>
            </div>
          ) : totalMatches === 0 ? (
            <div className="flex min-h-[45vh] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Search size={30} strokeWidth={1.6} />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">No results</h2>
              <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                No MONIEZI records match “{trimmedQuery}”.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {totalMatches} {totalMatches === 1 ? 'result' : 'results'} for <span className="font-extrabold text-slate-950 dark:text-white">“{trimmedQuery}”</span>
              </div>

              {groups.filter((group) => group.results.length > 0).map((group) => {
                const expanded = Boolean(expandedGroups[group.id]);
                const visibleResults = expanded ? group.results : group.results.slice(0, 5);
                return (
                  <section key={group.id} aria-labelledby={`global-search-${group.id}`}>
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <h3 id={`global-search-${group.id}`} className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                        {group.label}
                      </h3>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-extrabold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {group.results.length}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      {visibleResults.map((result, index) => {
                        const tone = toneClasses[result.tone];
                        return (
                          <button
                            key={result.key}
                            type="button"
                            onClick={() => onSelect(result)}
                            className={`group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/70 dark:active:bg-slate-800 ${index > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
                          >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                              {iconForTone(result.tone)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="min-w-0 truncate text-sm font-extrabold text-slate-950 dark:text-white">
                                  <Highlight text={result.title} query={trimmedQuery} />
                                </div>
                                <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider sm:inline ${tone.badge}`}>
                                  {tone.label}
                                </span>
                              </div>
                              {result.detail && (
                                <div className="mt-1 line-clamp-1 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-200">
                                  <Highlight text={result.detail} query={trimmedQuery} />
                                </div>
                              )}
                              <div className={`${result.detail ? 'mt-0.5' : 'mt-1'} line-clamp-2 text-xs font-medium leading-5 text-slate-600 dark:text-slate-300`}>
                                <Highlight text={result.subtitle} query={trimmedQuery} />
                              </div>
                            </div>
                            <ArrowRight size={18} strokeWidth={1.8} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400" />
                          </button>
                        );
                      })}
                    </div>

                    {group.results.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.id]: !expanded }))}
                        className="mt-2 rounded-lg px-2 py-1.5 text-xs font-extrabold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
                      >
                        {expanded ? 'Show fewer' : `See all ${group.results.length} ${group.label.toLowerCase()}`}
                      </button>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
