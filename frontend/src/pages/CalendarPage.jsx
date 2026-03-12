/*
  Intent: Academic calendar — month-view with event dots, event list, and
          a link back to the full news feed (Actualités).
  Palette: canvas base, surface cards. Brand accent for today, event dots color-coded.
  Depth: shadow-card + border-edge on cards.
  Surfaces: canvas (page bg via layout), surface (cards), surface-200 (day hover).
  Typography: Inter. Section headings = text-base font-semibold. Body = text-sm.
  Spacing: 4px base. Cards p-5/p-6. Gap-6 between sections.
*/

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import request from '../services/api';

/* ── Constants ──────────────────────────────────────────────── */
/* Weekday headers are derived from the locale in the component */

const EVENT_COLORS = {
  academic:       'bg-brand',
  administrative: 'bg-amber-500',
  events:         'bg-green-500',
  research:       'bg-violet-500',
  'student-life': 'bg-rose-500',
};

const EVENT_BADGE_STYLES = {
  academic:       'bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50',
  administrative: 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-800/50',
  events:         'bg-green-50 dark:bg-green-950/40 text-success border border-green-200 dark:border-green-800/50',
  research:       'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50',
  'student-life': 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50',
};

/* ── Helpers ─────────────────────────────────────────────────── */
function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Monday = 0 ... Sunday = 6  (ISO week)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const prevMonthLast = new Date(year, month, 0).getDate();
  const cells = [];

  // Leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLast - i, inMonth: false, date: new Date(year, month - 1, prevMonthLast - i) });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
  }
  // Trailing days
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
    }
  }

  return cells;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatMonthYear(year, month, locale = 'en-GB') {
  return new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/* ── Component ──────────────────────────────────────────────── */
export default function CalendarPage({ role }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB';

  /* Derive localized weekday headers (Mon–Sun) */
  const WEEKDAYS = useMemo(() => {
    const base = new Date(2024, 0, 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [locale]);

  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await request.get('/api/v1/actualites/events');
        if (res.data) setEvents(res.data);
      } catch {
        /* endpoint may not exist yet */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cells = useMemo(() => getMonthData(currentYear, currentMonth), [currentYear, currentMonth]);

  /* Events for a given date */
  const eventsForDate = (date) =>
    events.filter((e) => isSameDay(new Date(e.date), date));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedEvents = useMemo(() => eventsForDate(selectedDate), [selectedDate, events]);

  /* Navigation */
  const goPrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const goNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };
  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">{t('calendar.title')}</h1>
          <p className="mt-1 text-sm text-ink-tertiary">
            {t('calendar.subtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/actualites')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59" />
          </svg>
          {t('calendar.viewActualites')}
        </button>
      </div>

      {/* ── Calendar + Event Details ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ── Calendar Grid ────────────────────────────────── */}
        <div className="xl:col-span-3 bg-surface rounded-lg border border-edge shadow-card">
          {/* Month navigation header */}
          <div className="px-5 py-4 border-b border-edge-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="p-1.5 rounded-md text-ink-tertiary hover:text-ink-secondary hover:bg-surface-200 transition-colors duration-150"
                aria-label={t('calendar.previousMonth')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-ink min-w-[160px] text-center">
                {formatMonthYear(currentYear, currentMonth, locale)}
              </h2>
              <button
                onClick={goNext}
                className="p-1.5 rounded-md text-ink-tertiary hover:text-ink-secondary hover:bg-surface-200 transition-colors duration-150"
                aria-label={t('calendar.nextMonth')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-xs font-medium text-brand bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
            >
              {t('common.today')}
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-edge-subtle">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const isToday = isSameDay(cell.date, today);
              const isSelected = isSameDay(cell.date, selectedDate);
              const dayEvents = eventsForDate(cell.date);
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(cell.date);
                    if (!cell.inMonth) {
                      setCurrentMonth(cell.date.getMonth());
                      setCurrentYear(cell.date.getFullYear());
                    }
                  }}
                  className={`
                    relative h-16 sm:h-20 p-1.5 border-b border-r border-edge-subtle
                    flex flex-col items-center
                    transition-colors duration-100
                    ${!cell.inMonth ? 'text-ink-muted/40' : 'text-ink-secondary'}
                    ${isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : 'hover:bg-surface-200/50'}
                  `}
                >
                  <span
                    className={`
                      w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                      ${isToday ? 'bg-brand text-white' : ''}
                      ${isSelected && !isToday ? 'ring-2 ring-brand/40' : ''}
                    `}
                  >
                    {cell.day}
                  </span>

                  {/* Event dots */}
                  {hasEvents && (
                    <div className="flex items-center gap-0.5 mt-auto mb-0.5">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <span
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[e.category] || 'bg-brand'}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] font-bold text-ink-muted">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 border-t border-edge-subtle flex items-center gap-4 flex-wrap">
            {Object.entries(EVENT_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-ink-muted capitalize">{cat.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Selected Day Details ─────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Events for selected date */}
          <div className="bg-surface rounded-lg border border-edge shadow-card">
            <div className="px-5 py-4 border-b border-edge-subtle">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <h2 className="text-base font-semibold text-ink">
                  {selectedDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
              </div>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <svg className="w-10 h-10 mx-auto text-ink-muted/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <p className="text-sm font-medium text-ink-secondary">{t('common.noEvents')}</p>
                <p className="text-xs text-ink-muted mt-1">{t('calendar.selectAnother')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-edge-subtle">
                {selectedEvents.map((event) => (
                  <li key={event.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded ${EVENT_BADGE_STYLES[event.category] || ''}`}>
                        {event.category?.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink">{event.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.time}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {event.location}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* All upcoming events summary */}
          <div className="bg-surface rounded-lg border border-edge shadow-card">
            <div className="px-5 py-4 border-b border-edge-subtle">
              <h2 className="text-base font-semibold text-ink">{t('common.allUpcoming')}</h2>
            </div>
            <ul className="divide-y divide-edge-subtle max-h-64 overflow-y-auto">
              {events.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-ink-muted">{t('common.noUpcoming')}</li>
              )}
              {events.map((event) => (
                <li
                  key={event.id}
                  onClick={() => {
                    setSelectedDate(new Date(event.date));
                    setCurrentMonth(new Date(event.date).getMonth());
                    setCurrentYear(new Date(event.date).getFullYear());
                  }}
                  className="px-5 py-3 hover:bg-surface-200/50 transition-colors duration-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-surface-200 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-semibold text-ink-muted uppercase leading-none">
                        {new Date(event.date).toLocaleDateString(locale, { month: 'short' })}
                      </span>
                      <span className="text-sm font-bold text-ink leading-tight">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{event.title}</p>
                      <p className="text-xs text-ink-muted">{event.time} · {event.location}</p>
                    </div>
                    <span className={`shrink-0 w-2 h-2 rounded-full ${EVENT_COLORS[event.category] || 'bg-brand'}`} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
