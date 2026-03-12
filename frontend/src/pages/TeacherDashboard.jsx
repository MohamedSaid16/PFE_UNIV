/*
  Intent: A teacher opening this at 7am with coffee. They need a calm, scannable overview —
          not a celebration, not a wall of numbers. Three concerns surface immediately:
          1. How many students do I have? (stat cards — glanceable)
          2. Which projects need my approval? (pending validations — actionable table)
          3. Are students complaining about anything? (recent claims — notification feed)
  Palette: canvas base, surface cards. Brand for primary stats, semantic colors for status.
  Depth: shadow-card + border-edge on all cards. No stacked shadows.
  Surfaces: canvas (page bg via layout), surface (card), surface-200 (badge wells).
  Typography: Inter. Section headings = text-base font-semibold. Body = text-sm.
  Spacing: 4px base. Cards p-6. Grid gap-4 on stats, gap-6 between sections.
*/

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import request from '../services/api';

/* ── Stat card icon definitions ─────────────────────────────── */
const STAT_ICONS = {
  students: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  validations: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  claims: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

/* ── Helpers ────────────────────────────────────────────────── */
const STAT_COLORS = {
  brand:   { bg: 'bg-blue-50 dark:bg-blue-950/40',   text: 'text-brand',  icon: 'text-brand' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950/40',  text: 'text-warning', icon: 'text-warning' },
  danger:  { bg: 'bg-red-50 dark:bg-red-950/40',    text: 'text-danger',  icon: 'text-danger' },
};

const STATUS_STYLES = {
  'new':         'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50',
  'in-progress': 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50',
  'resolved':    'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50',
};

const PRIORITY_STYLES = {
  urgent: 'bg-red-50 dark:bg-red-950/40 text-danger border border-red-200 dark:border-red-800/50',
  normal: 'bg-surface-200 text-ink-tertiary border border-edge',
};

function formatDate(dateStr, locale = 'en-GB') {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

/* ── Component ──────────────────────────────────────────────── */
export default function TeacherDashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState([]);
  const [projects, setProjects] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, pRes, cRes] = await Promise.allSettled([
          request.get('/api/v1/teacher/stats'),
          request.get('/api/v1/teacher/projects'),
          request.get('/api/v1/teacher/claims'),
        ]);
        if (sRes.status === 'fulfilled') setStats(sRes.value.data ?? []);
        if (pRes.status === 'fulfilled') setProjects(pRes.value.data ?? []);
        if (cRes.status === 'fulfilled') setClaims(cRes.value.data ?? []);
      } catch {
        /* endpoints may not exist yet – that's fine */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Build stat cards from API or fall back to empty */
  const statCards = stats.length > 0
    ? stats.map((s) => ({ ...s, icon: STAT_ICONS[s.iconKey] || STAT_ICONS.students }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">

      {/* ── Page Header ────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-ink tracking-tight">
          {t('teacherDashboard.goodMorning', { name: user?.prenom ? `, ${user.prenom}` : '' })}
        </h1>
        <p className="mt-1 text-sm text-ink-tertiary">
          {t('teacherDashboard.attentionToday', { date: new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) })}
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const c = STAT_COLORS[stat.color] || STAT_COLORS.brand;
            return (
              <div
                key={stat.label}
                className="bg-surface rounded-lg border border-edge shadow-card p-5 flex items-start gap-4"
              >
                <div className={`shrink-0 w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center ${c.icon}`}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-secondary">{stat.label}</p>
                  <p className={`text-2xl font-bold tracking-tight ${c.text} mt-0.5`}>{stat.value}</p>
                  <p className="text-xs text-ink-muted mt-1">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Two-Column: Projects + Claims ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ── Pending Project Validations ───────────────────── */}
        <div className="xl:col-span-3 bg-surface rounded-lg border border-edge shadow-card">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-edge-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <h2 className="text-base font-semibold text-ink">{t('teacherDashboard.pendingValidations')}</h2>
              {projects.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50">
                  {projects.length}
                </span>
              )}
            </div>
            <button className="text-sm font-medium text-brand hover:text-brand-hover transition-colors duration-150">
              {t('teacherDashboard.viewAll')}
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">{t('teacherDashboard.noPending')}</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge-subtle">
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('teacherDashboard.thProject')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider hidden sm:table-cell">{t('teacherDashboard.thStudent')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider hidden md:table-cell">{t('teacherDashboard.thGroup')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider hidden lg:table-cell">{t('teacherDashboard.thSubmitted')}</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">{t('teacherDashboard.thPriority')}</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-ink-muted uppercase tracking-wider">{t('teacherDashboard.thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge-subtle">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-200/50 transition-colors duration-100">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink truncate max-w-[200px]">{p.title}</p>
                      <p className="text-xs text-ink-muted sm:hidden mt-0.5">{p.student}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-secondary hidden sm:table-cell">{p.student}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-surface-200 text-ink-tertiary">
                        {p.group}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-tertiary hidden lg:table-cell">{formatDate(p.submitted, i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB')}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_STYLES[p.priority]}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="px-3 py-1.5 text-xs font-medium text-brand bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150">
                        {t('teacherDashboard.review')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* ── Recent Claims Feed ───────────────────────────── */}
        <div className="xl:col-span-2 bg-surface rounded-lg border border-edge shadow-card">
          {/* Card header */}
          <div className="px-5 py-4 border-b border-edge-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <h2 className="text-base font-semibold text-ink">{t('teacherDashboard.recentClaims')}</h2>
              {claims.filter((c) => c.status === 'new').length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 dark:bg-red-950/40 text-danger border border-red-200 dark:border-red-800/50">
                  {claims.filter((c) => c.status === 'new').length} {t('teacherDashboard.new')}
                </span>
              )}
            </div>
            <button className="text-sm font-medium text-brand hover:text-brand-hover transition-colors duration-150">
              {t('teacherDashboard.viewAll')}
            </button>
          </div>

          {/* Feed list */}
          {claims.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">{t('teacherDashboard.noClaims')}</div>
          ) : (
          <ul className="divide-y divide-edge-subtle">
            {claims.map((claim) => (
              <li key={claim.id} className="px-5 py-4 hover:bg-surface-200/50 transition-colors duration-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Avatar initial */}
                      <div className="shrink-0 w-7 h-7 rounded-full bg-surface-300 flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-ink-secondary">
                          {claim.student.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-ink truncate">{claim.student}</p>
                    </div>
                    <p className="text-sm text-ink-secondary leading-snug mb-1.5">{claim.subject}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-ink-muted">{claim.time}</span>
                      <span className="text-ink-muted">·</span>
                      <span className="text-xs text-ink-tertiary">{claim.module}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 mt-1 px-2 py-0.5 text-[11px] font-medium rounded ${STATUS_STYLES[claim.status]}`}>
                    {claim.status === 'in-progress' ? t('teacherDashboard.inProgress') : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          )}

          {/* Footer */}
          {claims.length > 0 && (
          <div className="px-5 py-3 border-t border-edge-subtle">
            <button className="w-full text-center text-sm font-medium text-brand hover:text-brand-hover transition-colors duration-150">
              {t('teacherDashboard.viewAllClaims')}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
