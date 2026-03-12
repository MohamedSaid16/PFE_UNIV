import React, { useMemo, useState } from 'react';

const THREADS = [
  {
    id: 1,
    name: 'Department Administration',
    role: 'Internal Staff',
    unread: 2,
    lastMessage: 'Please confirm the updated committee schedule before 16:00.',
    time: '10:42',
    messages: [
      { id: 11, sender: 'Admin Office', mine: false, text: 'We have revised tomorrow\'s committee schedule.', time: '09:14' },
      { id: 12, sender: 'You', mine: true, text: 'Received. I\'m reviewing the conflicts now.', time: '09:26' },
      { id: 13, sender: 'Admin Office', mine: false, text: 'Please confirm the updated committee schedule before 16:00.', time: '10:42' },
    ],
  },
  {
    id: 2,
    name: 'Academic Affairs',
    role: 'Pedagogical Team',
    unread: 0,
    lastMessage: 'The absence-justification report is ready for review.',
    time: 'Yesterday',
    messages: [
      { id: 21, sender: 'Academic Affairs', mine: false, text: 'The absence-justification report is ready for review.', time: 'Yesterday' },
      { id: 22, sender: 'You', mine: true, text: 'I will validate the pending records this afternoon.', time: 'Yesterday' },
    ],
  },
  {
    id: 3,
    name: 'Supervision Pool',
    role: 'Projects',
    unread: 1,
    lastMessage: 'Three students still need project assignment before Friday.',
    time: 'Mon',
    messages: [
      { id: 31, sender: 'Supervision Pool', mine: false, text: 'Three students still need project assignment before Friday.', time: 'Mon' },
      { id: 32, sender: 'You', mine: true, text: 'Send me the remaining list and I will update the assignments.', time: 'Mon' },
    ],
  },
];

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(THREADS[0].id);
  const activeThread = useMemo(() => THREADS.find((thread) => thread.id === selectedId) || THREADS[0], [selectedId]);

  return (
    <div className="space-y-6 max-w-7xl min-w-0">
      <section className="relative overflow-hidden rounded-3xl border border-edge bg-surface shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_30%)]" />
        <div className="relative px-6 py-8 md:px-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Communication Hub</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Messages</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-secondary md:text-base">
            Follow internal conversations with administration, academic teams, and project supervisors in one controlled workspace.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-edge bg-surface p-4 shadow-card">
          <div className="border-b border-edge-subtle px-2 pb-4">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Conversations</h2>
            <p className="mt-1 text-sm text-ink-secondary">Unread messages and the latest academic coordination threads.</p>
          </div>

          <div className="mt-4 space-y-3">
            {THREADS.map((thread) => {
              const selected = thread.id === activeThread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedId(thread.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? 'border-brand bg-brand-light/70 shadow-sm'
                      : 'border-edge bg-canvas hover:border-brand/25 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{thread.name}</p>
                      <p className="mt-1 text-xs text-ink-tertiary">{thread.role}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-tertiary">{thread.time}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-ink-secondary">{thread.lastMessage}</p>
                  {thread.unread ? (
                    <div className="mt-3 inline-flex rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
                      {thread.unread} unread
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="rounded-3xl border border-edge bg-surface shadow-card">
          <div className="flex items-center justify-between gap-4 border-b border-edge-subtle px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">{activeThread.name}</h2>
              <p className="mt-1 text-sm text-ink-secondary">{activeThread.role}</p>
            </div>
            <button type="button" className="rounded-xl border border-edge bg-canvas px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-200">
              New Message
            </button>
          </div>

          <div className="space-y-4 px-6 py-6">
            {activeThread.messages.map((message) => (
              <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl rounded-2xl px-4 py-3 ${message.mine ? 'bg-brand text-white' : 'border border-edge bg-canvas text-ink'}`}>
                  <p className={`text-xs font-semibold ${message.mine ? 'text-white/80' : 'text-ink-tertiary'}`}>{message.sender}</p>
                  <p className="mt-1 text-sm leading-6">{message.text}</p>
                  <p className={`mt-2 text-xs ${message.mine ? 'text-white/75' : 'text-ink-muted'}`}>{message.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-edge-subtle px-6 py-5">
            <div className="rounded-2xl border border-edge bg-canvas p-3">
              <textarea
                rows={4}
                placeholder="Write a message to the selected thread..."
                className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
              />
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-edge-subtle pt-3">
                <p className="text-xs text-ink-tertiary">Attachments and live delivery can be connected later.</p>
                <button type="button" className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
