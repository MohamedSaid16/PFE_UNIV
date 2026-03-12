import React, { useMemo, useState } from 'react';

const NOTIFICATIONS = [
  {
    id: 1,
    category: 'Deadline',
    title: 'Project assignment cutoff approaching',
    description: 'Five student records still need supervisor assignment before Friday at 12:00.',
    time: '12 min ago',
    read: false,
    priority: 'high',
  },
  {
    id: 2,
    category: 'Requests',
    title: 'New reclamation submitted',
    description: 'A grade-related reclamation for Algorithms S1 has been filed and awaits review.',
    time: '1 hour ago',
    read: false,
    priority: 'medium',
  },
  {
    id: 3,
    category: 'Calendar',
    title: 'Committee hearing updated',
    description: 'Room allocation has changed for tomorrow\'s disciplinary hearing.',
    time: 'Yesterday',
    read: true,
    priority: 'medium',
  },
  {
    id: 4,
    category: 'Documents',
    title: 'Faculty report generated',
    description: 'The monthly faculty activity report is now available for download.',
    time: 'Yesterday',
    read: true,
    priority: 'low',
  },
];

function priorityClasses(priority) {
  if (priority === 'high') return 'border-danger/25 bg-danger/10 text-danger';
  if (priority === 'medium') return 'border-brand/25 bg-brand-light text-brand';
  return 'border-edge bg-surface text-ink-secondary';
}

export default function NotificationsPage() {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const filtered = useMemo(
    () => NOTIFICATIONS.filter((item) => (showUnreadOnly ? !item.read : true)),
    [showUnreadOnly]
  );
  const unreadCount = NOTIFICATIONS.filter((item) => !item.read).length;

  return (
    <div className="space-y-6 max-w-6xl min-w-0">
      <section className="relative overflow-hidden rounded-3xl border border-edge bg-surface shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.1),transparent_32%)]" />
        <div className="relative px-6 py-8 md:px-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">System Feed</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Notifications</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary md:text-base">
            Stay on top of academic deadlines, requests, hearings, and generated documents without switching between modules.
          </p>
          <div className="mt-6 inline-flex rounded-2xl border border-edge bg-canvas px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-tertiary">Unread</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-ink">{unreadCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-edge bg-surface shadow-card">
        <div className="flex flex-col gap-3 border-b border-edge-subtle px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Activity Stream</h2>
            <p className="mt-1 text-sm text-ink-secondary">A consolidated list of alerts across the pedagogical platform.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowUnreadOnly((value) => !value)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              showUnreadOnly
                ? 'border-brand bg-brand-light text-brand'
                : 'border-edge bg-canvas text-ink-secondary hover:text-ink'
            }`}
          >
            {showUnreadOnly ? 'Showing unread only' : 'Show unread only'}
          </button>
        </div>

        <div className="divide-y divide-edge-subtle">
          {filtered.map((item) => (
            <article key={item.id} className="px-6 py-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(item.priority)}`}>
                      {item.category}
                    </span>
                    {!item.read ? <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">Unread</span> : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">{item.description}</p>
                </div>
                <div className="shrink-0 text-sm text-ink-tertiary">{item.time}</div>
              </div>
            </article>
          ))}

          {!filtered.length ? (
            <div className="px-6 py-14 text-center">
              <p className="text-base font-medium text-ink">No notifications match the current filter.</p>
              <p className="mt-2 text-sm text-ink-secondary">Turn off the unread filter to view the full activity stream.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
