import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Check, RefreshCw, AlertCircle, CalendarRange, Sparkles, LogOut, ExternalLink } from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, initAuth, logout } from '../lib/firebase';
import { BookingState } from '../types';

interface SchedulerProps {
  onBooked: (booking: BookingState, synced: boolean) => void;
  userEmail?: string;
}

export default function Scheduler({ onBooked, userEmail }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [days, setDays] = useState<{ dateString: string; label: string; dayName: string; isPast: boolean; isWeekend: boolean }[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successEvent, setSuccessEvent] = useState<any>(null);

  // Load next 12 available weekday dates
  useEffect(() => {
    const list = [];
    let current = new Date();
    current.setDate(current.getDate() + 1);

    while (list.length < 12) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const date = String(current.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${date}`;

      const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
      const label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (!isWeekend) {
        list.push({ dateString, label, dayName, isPast: false, isWeekend: false });
      }
      current.setDate(current.getDate() + 1);
    }
    setDays(list);
    if (list.length > 0) setSelectedDate(list[0].dateString);
  }, []);

  // Initialize Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        if (currentToken) setToken(currentToken);
      },
      () => { setUser(null); setToken(null); }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) { setUser(result.user); setToken(result.accessToken); }
    } catch (err: any) {
      console.error('Sign in failure:', err);
      setError('Could not establish secure synchronization with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null); setToken(null); setSuccessEvent(null);
  };

  const slots = {
    morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'],
  };

  const formatSlotTime24h = (dateStr: string, timeStr12h: string): { start: string; end: string } => {
    const [time, modifier] = timeStr12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hrs = parseInt(hours, 10);
    if (modifier === 'PM' && hrs < 12) hrs += 12;
    if (modifier === 'AM' && hrs === 12) hrs = 0;
    const formattedHrs = String(hrs).padStart(2, '0');
    const startIso = `${dateStr}T${formattedHrs}:${minutes}:00`;
    let endMins = parseInt(minutes, 10) + 45;
    let endHrs = hrs;
    if (endMins >= 60) { endMins -= 60; endHrs += 1; }
    const endIso = `${dateStr}T${String(endHrs).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`;
    return { start: startIso, end: endIso };
  };

  const scheduleGoogleEvent = async (booking: BookingState, userAccessToken: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
      const { start, end } = formatSlotTime24h(booking.date, booking.timeSlot);
      const eventBody = {
        summary: 'Breakthrough & Values Alignment Session',
        description: `Your personal transformation and perception-shifting breakthrough review with your facilitator.\n\nTimezone: ${timeZone}\nConfirmed email: ${user?.email || userEmail || 'Intake Client'}\nWe will evaluate your 7 areas of life objectives and release the blockages.`,
        start: { dateTime: start, timeZone },
        end: { dateTime: end, timeZone },
        reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 24 * 65 }, { method: 'popup', minutes: 45 }] },
        attendees: [
          ...(user?.email ? [{ email: user.email }] : []),
          ...(userEmail && userEmail !== user?.email ? [{ email: userEmail }] : [])
        ]
      };
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAccessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventBody)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Failed to insert calendar event.');
      }
      const responseData = await res.json();
      setSuccessEvent(responseData);
      onBooked(booking, true);
    } catch (err: any) {
      console.error('Google Calendar error:', err);
      setError(`Google sync failed: ${err.message || 'Check your permissions and scopes.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSession = () => {
    if (!selectedSlot) { setError('Please select an inspiring consultation time slot first.'); return; }
    const booking: BookingState = { date: selectedDate, timeSlot: selectedSlot };
    if (token) { scheduleGoogleEvent(booking, token); }
    else { onBooked(booking, false); }
  };

  const selectedDayLabel = days.find(d => d.dateString === selectedDate)?.label || '';

  return (
    <div id="scheduler-container" className="space-y-8">

      {/* Header */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
          color: '#F5F3EF', letterSpacing: '0.01em', lineHeight: 1.2,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'rgba(202,138,4,0.08)',
            border: '1px solid rgba(202,138,4,0.3)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarRange style={{ width: 16, height: 16, color: 'var(--gold)' }} />
          </div>
          Breakthrough Booking & Alignment
        </h3>
        <p style={{
          marginTop: 10, fontFamily: 'var(--font-sans)', fontSize: 14,
          color: 'var(--text-secondary)', lineHeight: 1.7, fontWeight: 400,
        }}>
          Finalize your high-performance schedule. Select a convenient date and time block to solidify your 45-minute intake session.
        </p>
      </div>

      {/* Date + Time Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Date Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-muted)', fontWeight: 500,
            }}>
              Select Available Date
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              Business Days Only
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {days.map((d) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <button
                  key={d.dateString}
                  id={`date-cell-${d.dateString}`}
                  type="button"
                  onClick={() => { setSelectedDate(d.dateString); setSelectedSlot(''); setError(null); }}
                  className={`date-cell${isSelected ? ' selected' : ''}`}
                >
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                    color: isSelected ? 'var(--gold)' : 'var(--text-muted)',
                    transition: 'color 250ms ease',
                  }}>
                    {d.dayName}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                    color: isSelected ? '#EAB308' : 'var(--text-primary)',
                    marginTop: 4, letterSpacing: '0.02em',
                    transition: 'color 250ms ease',
                  }}>
                    {d.label.split(' ')[1]}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color: isSelected ? 'rgba(202,138,4,0.75)' : 'var(--text-muted)',
                    marginTop: 2, transition: 'color 250ms ease',
                  }}>
                    {d.label.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="lg:col-span-5 space-y-5">
          <div style={{
            paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--text-muted)', fontWeight: 500,
            }}>
              Available Hours: {selectedDayLabel || 'Select Date'}
            </span>
          </div>

          <div className="space-y-5">
            {/* Morning */}
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--text-muted)', display: 'block', marginBottom: 8,
              }}>
                Morning Core
              </span>
              <div className="grid grid-cols-3 gap-2">
                {slots.morning.map((slot) => (
                  <button
                    key={slot}
                    id={`slot-btn-morning-${slot.replace(/:/g, '-').replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => { setSelectedSlot(slot); setError(null); }}
                    className={`time-slot${selectedSlot === slot ? ' selected' : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon */}
            <div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--text-muted)', display: 'block', marginBottom: 8,
              }}>
                Afternoon Core
              </span>
              <div className="grid grid-cols-2 gap-2">
                {slots.afternoon.map((slot) => (
                  <button
                    key={slot}
                    id={`slot-btn-afternoon-${slot.replace(/:/g, '-').replace(/\s+/g, '-').toLowerCase()}`}
                    type="button"
                    onClick={() => { setSelectedSlot(slot); setError(null); }}
                    className={`time-slot${selectedSlot === slot ? ' selected' : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration Panel */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 28 }}>
        <div style={{
          background: 'rgba(8,7,6,0.65)',
          border: '1px solid rgba(202,138,4,0.12)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Panel header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ maxWidth: 520 }}>
              <h4 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 6,
              }}>
                <CalendarIcon style={{ width: 14, height: 14, color: 'var(--gold)', flexShrink: 0 }} />
                Google Calendar Integration
              </h4>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                Connect your Google Account to push this breakthrough session directly into your calendar, triggering automatic de-identified reminders.
              </p>
            </div>

            {/* Auth control */}
            {user ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(20,17,13,0.9)',
                border: '1px solid rgba(202,138,4,0.2)',
                borderRadius: 12, padding: '10px 14px',
              }}>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Google Profile"
                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(202,138,4,0.25)' }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.displayName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
                <button
                  id="google-disconnect-btn"
                  onClick={handleLogout}
                  title="Disconnect account"
                  style={{
                    padding: 6, borderRadius: '50%', border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'color 200ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ) : (
              <button
                id="google-sync-btn"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px',
                  background: 'rgba(20,17,13,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9999,
                  fontFamily: 'var(--font-heading)', fontSize: 11,
                  fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 250ms ease',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(202,138,4,0.25)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }}
              >
                {isLoading ? (
                  <RefreshCw style={{ width: 14, height: 14, animation: 'gold-spin 1s linear infinite' }} />
                ) : (
                  <svg style={{ width: 14, height: 14, flexShrink: 0 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.82z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 4.91 12c0-.79.13-1.57.38-2.31V6.54H1.21A11.94 11.94 0 0 0 0 12c0 2.01.5 3.91 1.21 5.62l4.11-3.38z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.62l4.11 3.38c.94-2.85 3.57-4.96 6.68-4.96z" />
                  </svg>
                )}
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div id="scheduler-error-banner" style={{
          padding: '14px 18px',
          background: 'rgba(185,28,28,0.08)',
          border: '1px solid rgba(185,28,28,0.25)',
          borderRadius: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <AlertCircle style={{ width: 14, height: 14, color: 'rgba(239,68,68,0.8)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(239,68,68,0.8)', letterSpacing: '0.06em' }}>
            {error}
          </span>
        </div>
      )}

      {/* Google Success Card */}
      {successEvent && (
        <div id="scheduler-google-success-card" style={{
          padding: '16px 20px',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check style={{ width: 14, height: 14, color: '#34d399' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              Google Calendar Event Synced Successfully
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The session has been written live to <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>'s calendar and invites dispatched.
          </p>
          <a
            id="view-calendar-link"
            href={successEvent.htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              color: 'var(--gold)', letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            Open Calendar <ExternalLink style={{ width: 11, height: 11 }} />
          </a>
        </div>
      )}

      {/* Booking Actions */}
      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        paddingTop: 20, borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            Duration: 45-Minute Intense Perception Shift
          </span>
        </div>

        <button
          id="confirm-booking-btn"
          type="button"
          disabled={isLoading || !selectedSlot}
          onClick={handleBookSession}
          className="btn-gold"
        >
          {isLoading ? (
            <>
              <RefreshCw style={{ width: 14, height: 14, animation: 'gold-spin 1s linear infinite' }} />
              Aligning & Reserving...
            </>
          ) : token ? (
            <>
              <Sparkles style={{ width: 14, height: 14 }} />
              Sync & Book Breakthrough
            </>
          ) : (
            <>
              <Check style={{ width: 14, height: 14 }} />
              Book Breakthrough Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}
