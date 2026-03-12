/*
  Intent: A student or teacher configuring their experience. Not a wall of toggles —
          a calm, organized set of grouped preferences. Each section is a card,
          each setting is a clear row. University admin software, not a SaaS onboarding.
  Palette: canvas base, surface cards. Brand for active toggles, semantic for status.
  Depth: shadow-card + border-edge on section cards. No stacked shadows.
  Surfaces: canvas (page bg via layout), surface (card), surface-200 (toggle wells, select bgs).
  Typography: Inter. Section headings = text-base font-semibold. Body = text-sm.
  Spacing: 4px base. Cards p-6. gap-6 between sections.
*/

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';
import ThemeSwitcher from '../theme/ThemeSwitcher';

/* ── Toggle Component ──────────────────────────────────────── */
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-ink-tertiary mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange?.(!enabled)}
        className={`
          shrink-0 relative inline-flex h-5 w-9 items-center rounded-full
          transition-colors duration-150
          ${enabled ? 'bg-brand' : 'bg-surface-300'}
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
            transition-transform duration-150
            ${enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}
          `}
        />
      </button>
    </div>
  );
}

/* ── Select Row Component ──────────────────────────────────── */
function SelectRow({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-ink-tertiary mt-0.5">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="shrink-0 text-sm font-medium text-ink bg-control-bg border border-control-border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-colors duration-150"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Section Card Wrapper ──────────────────────────────────── */
function SettingsSection({ title, description, icon, children }) {
  return (
    <div className="bg-surface rounded-lg border border-edge shadow-card">
      <div className="px-6 py-4 border-b border-edge-subtle flex items-center gap-3">
        <span className="w-5 h-5 text-ink-tertiary shrink-0">{icon}</span>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && <p className="text-xs text-ink-tertiary mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-6 divide-y divide-edge-subtle">
        {children}
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────── */
export default function SettingsPage() {
  const { mode, accent } = useTheme();
  const { t, i18n } = useTranslation();

  /* Local settings state (mock — would connect to backend) */
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    gradeAlerts: true,
    deadlineReminders: true,
    newsDigest: false,
    weeklyReport: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: false,
    activityStatus: true,
  });

  const [general, setGeneral] = useState({
    language: i18n.language?.substring(0, 2) || 'fr',
    timezone: 'africa-algiers',
    dateFormat: 'dd-mm-yyyy',
    startPage: '/dashboard',
  });

  const [accessibility, setAccessibility] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  });

  const toggleNotif = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const togglePrivacy = (key) =>
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleA11y = (key) =>
    setAccessibility((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6 max-w-3xl min-w-0">

      {/* ── Page Header ────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-ink tracking-tight">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-ink-tertiary">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* ── Appearance ─────────────────────────────────────── */}
      <SettingsSection
        title={t('settings.appearance')}
        description={t('settings.appearanceDesc')}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
          </svg>
        }
      >
        <div className="py-4">
          <ThemeSwitcher />
        </div>
        <div className="py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">{t('settings.currentTheme')}</p>
            <p className="text-xs text-ink-tertiary mt-0.5">
              {mode === 'dark' ? 'Dark' : 'Light'} mode · {accent.charAt(0).toUpperCase() + accent.slice(1)} accent
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/40 text-brand border border-blue-200 dark:border-blue-800/50">
            {t('settings.active')}
          </span>
        </div>
      </SettingsSection>

      {/* ── General ────────────────────────────────────────── */}
      <SettingsSection
        title={t('settings.general')}
        description={t('settings.generalDesc')}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
        }
      >
        <SelectRow
          label={t('settings.language')}
          description={t('settings.languageDesc')}
          value={general.language}
          onChange={(v) => {
            setGeneral((p) => ({ ...p, language: v }));
            i18n.changeLanguage(v);
            document.documentElement.dir = v === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = v;
          }}
          options={[
            { value: 'fr', label: 'Français' },
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' },
          ]}
        />
        <SelectRow
          label={t('settings.timezone')}
          description={t('settings.timezoneDesc')}
          value={general.timezone}
          onChange={(v) => setGeneral((p) => ({ ...p, timezone: v }))}
          options={[
            { value: 'africa-algiers', label: 'Africa/Algiers (CET)' },
            { value: 'europe-paris', label: 'Europe/Paris (CET)' },
            { value: 'utc', label: 'UTC' },
          ]}
        />
        <SelectRow
          label={t('settings.dateFormat')}
          description={t('settings.dateFormatDesc')}
          value={general.dateFormat}
          onChange={(v) => setGeneral((p) => ({ ...p, dateFormat: v }))}
          options={[
            { value: 'dd-mm-yyyy', label: 'DD/MM/YYYY' },
            { value: 'mm-dd-yyyy', label: 'MM/DD/YYYY' },
            { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
          ]}
        />
        <SelectRow
          label={t('settings.startPage')}
          description={t('settings.startPageDesc')}
          value={general.startPage}
          onChange={(v) => setGeneral((p) => ({ ...p, startPage: v }))}
          options={[
            { value: '/dashboard', label: 'Dashboard' },
            { value: '/actualites', label: 'Actualités' },
            { value: '/projects', label: 'Projects' },
            { value: '/grades', label: 'Grades' },
            { value: '/calendar', label: 'Calendar' },
          ]}
        />
      </SettingsSection>

      {/* ── Notifications ──────────────────────────────────── */}
      <SettingsSection
        title={t('settings.notifications')}
        description={t('settings.notificationsDesc')}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        }
      >
        {/* Delivery channels */}
        <div className="pt-2 pb-1">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Delivery channels</p>
        </div>
        <Toggle
          label={t('settings.emailNotif')}
          description={t('settings.emailNotifDesc')}
          enabled={notifications.email}
          onChange={() => toggleNotif('email')}
        />
        <Toggle
          label={t('settings.pushNotif')}
          description={t('settings.pushNotifDesc')}
          enabled={notifications.push}
          onChange={() => toggleNotif('push')}
        />
        <Toggle
          label="SMS notifications"
          description="Text messages for critical alerts only"
          enabled={notifications.sms}
          onChange={() => toggleNotif('sms')}
        />

        {/* Alert types */}
        <div className="pt-4 pb-1">
          <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Alert types</p>
        </div>
        <Toggle
          label="Grade alerts"
          description="Notified when grades are published or updated"
          enabled={notifications.gradeAlerts}
          onChange={() => toggleNotif('gradeAlerts')}
        />
        <Toggle
          label={t('settings.deadlineReminders')}
          description={t('settings.deadlineRemindersDesc')}
          enabled={notifications.deadlineReminders}
          onChange={() => toggleNotif('deadlineReminders')}
        />
        <Toggle
          label="News digest"
          description="Daily summary of new announcements"
          enabled={notifications.newsDigest}
          onChange={() => toggleNotif('newsDigest')}
        />
        <Toggle
          label="Weekly report"
          description="Summary of your academic activity each Sunday"
          enabled={notifications.weeklyReport}
          onChange={() => toggleNotif('weeklyReport')}
        />
      </SettingsSection>

      {/* ── Privacy ────────────────────────────────────────── */}
      <SettingsSection
        title={t('settings.privacy')}
        description={t('settings.privacyDesc')}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        }
      >
        <Toggle
          label={t('settings.showProfile')}
          description={t('settings.showProfileDesc')}
          enabled={privacy.showProfile}
          onChange={() => togglePrivacy('showProfile')}
        />
        <Toggle
          label={t('settings.showEmail')}
          description={t('settings.showEmailDesc')}
          enabled={privacy.showEmail}
          onChange={() => togglePrivacy('showEmail')}
        />
        <Toggle
          label={t('settings.showPhone')}
          description={t('settings.showPhoneDesc')}
          enabled={privacy.showPhone}
          onChange={() => togglePrivacy('showPhone')}
        />
        <Toggle
          label={t('settings.activityStatus')}
          description={t('settings.activityStatusDesc')}
          enabled={privacy.activityStatus}
          onChange={() => togglePrivacy('activityStatus')}
        />
      </SettingsSection>

      {/* ── Accessibility ──────────────────────────────────── */}
      <SettingsSection
        title={t('settings.accessibility')}
        description={t('settings.accessibilityDesc')}
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      >
        <Toggle
          label={t('settings.reducedMotion')}
          description={t('settings.reducedMotionDesc')}
          enabled={accessibility.reducedMotion}
          onChange={() => toggleA11y('reducedMotion')}
        />
        <Toggle
          label={t('settings.highContrast')}
          description={t('settings.highContrastDesc')}
          enabled={accessibility.highContrast}
          onChange={() => toggleA11y('highContrast')}
        />
        <Toggle
          label={t('settings.largeText')}
          description={t('settings.largeTextDesc')}
          enabled={accessibility.largeText}
          onChange={() => toggleA11y('largeText')}
        />
      </SettingsSection>

      {/* ── Account Actions ────────────────────────────────── */}
      <SettingsSection
        title="Account"
        description="Security and account management"
        icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        }
      >
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Change password</p>
            <p className="text-xs text-ink-tertiary mt-0.5">Last changed 45 days ago</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-edge rounded-md hover:bg-surface-200 transition-colors duration-150">
            Update
          </button>
        </div>
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Two-factor authentication</p>
            <p className="text-xs text-ink-tertiary mt-0.5">Add an extra layer of security to your account</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover active:bg-brand-dark transition-colors duration-150">
            Enable
          </button>
        </div>
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Active sessions</p>
            <p className="text-xs text-ink-tertiary mt-0.5">2 active sessions — this device and 1 other</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-edge rounded-md hover:bg-surface-200 transition-colors duration-150">
            Manage
          </button>
        </div>
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-danger">Delete account</p>
            <p className="text-xs text-ink-tertiary mt-0.5">Permanently delete your account and all data</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-danger bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150">
            Delete
          </button>
        </div>
      </SettingsSection>

      {/* ── Save Footer ────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button className="px-4 py-2.5 text-sm font-medium text-ink-secondary bg-surface border border-edge rounded-md hover:bg-surface-200 transition-colors duration-150">
          Reset to defaults
        </button>
        <button className="px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-hover active:bg-brand-dark focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 transition-all duration-150">
          Save changes
        </button>
      </div>
    </div>
  );
}
