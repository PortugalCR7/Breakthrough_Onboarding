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

  // Load next 14 available dates (excluding weekends)
  useEffect(() => {
    const list = [];
    let current = new Date();
    // Add 1 day so bookings start from tomorrow
    current.setDate(current.getDate() + 1);

    while (list.length < 12) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
      
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const date = String(current.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${date}`;

      const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
      const dayName = current.toLocaleDateString('en-US', options);

      const labelOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const label = current.toLocaleDateString('en-US', labelOptions);

      if (!isWeekend) {
        list.push({
          dateString,
          label,
          dayName,
          isPast: false,
          isWeekend: false
        });
      }
      current.setDate(current.getDate() + 1);
    }
    setDays(list);
    // Select the first day by default
    if (list.length > 0) {
      setSelectedDate(list[0].dateString);
    }
  }, []);

  // Initialize Auth State on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        if (currentToken) {
          setToken(currentToken);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in failure:', err);
      setError('Could not establish secure synchronization with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setSuccessEvent(null);
  };

  const slots = {
    morning: ["09:00 AM", "10:00 AM", "11:00 AM"],
    afternoon: ["01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM"]
  };

  const formatSlotTime24h = (dateStr: string, timeStr12h: string): { start: string; end: string } => {
    // Parse "09:00 AM" or "02:30 PM"
    const [time, modifier] = timeStr12h.split(' ');
    let [hours, minutes] = time.split(':');
    let hrs = parseInt(hours, 10);
    if (modifier === 'PM' && hrs < 12) {
      hrs += 12;
    }
    if (modifier === 'AM' && hrs === 12) {
      hrs = 0;
    }
    
    const formattedHrs = String(hrs).padStart(2, '0');
    const startIso = `${dateStr}T${formattedHrs}:${minutes}:00`;
    
    // Add 45 minutes for the end time
    let endMins = parseInt(minutes, 10) + 45;
    let endHrs = hrs;
    if (endMins >= 60) {
      endMins -= 60;
      endHrs += 1;
    }
    const formattedEndHrs = String(endHrs).padStart(2, '0');
    const formattedEndMins = String(endMins).padStart(2, '0');
    const endIso = `${dateStr}T${formattedEndHrs}:${formattedEndMins}:00`;

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
        start: {
          dateTime: start,
          timeZone: timeZone,
        },
        end: {
          dateTime: end,
          timeZone: timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 65 },
            { method: 'popup', minutes: 45 }
          ]
        },
        attendees: [
          ...(user?.email ? [{ email: user.email }] : []),
          ...(userEmail && userEmail !== user?.email ? [{ email: userEmail }] : [])
        ]
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Google Calendar Error details:', errData);
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
    if (!selectedSlot) {
      setError("Please select an inspiring consultation time slot first.");
      return;
    }

    const booking: BookingState = {
      date: selectedDate,
      timeSlot: selectedSlot
    };

    if (token) {
      // Create actual Google Calendar Event
      scheduleGoogleEvent(booking, token);
    } else {
      // Manual Booking (saved in client state / local storage)
      onBooked(booking, false);
    }
  };

  const selectedDayLabel = days.find(d => d.dateString === selectedDate)?.label || '';

  return (
    <div id="scheduler-container" className="space-y-8 text-stone-200">
      <div>
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide leading-snug uppercase flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-white shrink-0" /> Breakthrough Booking & Alignment
        </h3>
        <p className="text-sm text-stone-400 mt-1.5 leading-relaxed font-sans font-light">
          Finalize your high-performance schedule. Select a convenient date and choice of morning or afternoon block below to solidify your 45-minute intake session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Date Grid Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-850 pb-2">
            <label className="text-xs font-mono uppercase tracking-wider text-stone-400 font-medium">
              Select Available Date
            </label>
            <span className="text-xs font-mono text-stone-500">Business Days Only</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {days.map((d) => {
              const isSelected = selectedDate === d.dateString;
              return (
                <button
                  key={d.dateString}
                  id={`date-cell-${d.dateString}`}
                  type="button"
                  onClick={() => {
                    setSelectedDate(d.dateString);
                    setSelectedSlot('');
                    setError(null);
                  }}
                  className={`p-3.5 rounded-2xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-white bg-white text-stone-950 shadow-md font-bold'
                      : 'border-stone-200 bg-stone-100 hover:bg-stone-200 hover:border-stone-300 text-stone-900'
                  }`}
                >
                  <div className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isSelected ? 'text-stone-800' : 'text-stone-500'}`}>
                    {d.dayName}
                  </div>
                  <div className={`text-base font-bold font-display mt-0.5 tracking-wider ${isSelected ? 'text-stone-950' : 'text-stone-900'}`}>
                    {d.label.split(' ')[1]}
                  </div>
                  <div className={`text-[10px] ${isSelected ? 'text-stone-800' : 'text-stone-500'} mt-0.5 font-mono`}>
                    {d.label.split(' ')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-stone-850 pb-2">
            <label className="text-xs font-mono uppercase tracking-wider text-stone-400 font-medium">
              Available Hours: {selectedDayLabel || 'Select Date'}
            </label>
          </div>

          <div className="space-y-5">
            {/* Morning Slots */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-2 font-medium">Morning Core</span>
              <div className="grid grid-cols-3 gap-2">
                {slots.morning.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      id={`slot-btn-morning-${slot.replace(/:/g, '-').replace(/\s+/g, '-').toLowerCase()}`}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setError(null);
                      }}
                      className={`py-3 px-2 text-sm font-semibold border rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white bg-white text-stone-950 font-bold'
                          : 'border-stone-200 bg-stone-100 hover:bg-stone-200 hover:border-stone-300 text-stone-900'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-2 font-medium">Afternoon Core</span>
              <div className="grid grid-cols-2 gap-2">
                {slots.afternoon.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      id={`slot-btn-afternoon-${slot.replace(/:/g, '-').replace(/\s+/g, '-').toLowerCase()}`}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setError(null);
                      }}
                      className={`py-3 px-2 text-sm font-semibold border rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white bg-white text-stone-950 font-bold'
                          : 'border-stone-200 bg-stone-100 hover:bg-stone-200 hover:border-stone-300 text-stone-900'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync with Google section */}
      <div className="border-t border-stone-850 pt-6 mt-8">
        <div className="bg-black p-5 border-metallic rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 max-w-xl">
            <h4 className="text-sm font-display font-bold text-white flex items-center gap-1.5 tracking-wider uppercase">
              <CalendarIcon className="w-4 h-4 text-stone-300 shrink-0" /> Google Calendar Integration
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed font-sans font-light">
              Connect with your Google Account to push this high-performance breakthrough session directly into your primary workspace calendar, triggering automatic HIPAA-compliant de-identified reminders.
            </p>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-3 bg-stone-100 p-3 rounded-2xl border border-stone-200 text-stone-950 shadow-sm">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Google Profile"
                    className="w-9 h-9 rounded-full border border-stone-300"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="text-sm font-semibold text-stone-950">{user.displayName}</div>
                  <div className="text-xs text-stone-600 truncate max-w-[140px] font-mono">{user.email}</div>
                </div>
                <button
                  id="google-disconnect-btn"
                  onClick={handleLogout}
                  title="Disconnect account"
                  className="p-1.5 hover:bg-stone-200 text-stone-750 hover:text-stone-950 rounded-full transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="google-sync-btn"
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-2 px-5 py-3 border border-stone-200 hover:border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-950 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.82z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.32 14.24A7.16 7.16 0 0 1 4.91 12c0-.79.13-1.57.38-2.31V6.54H1.21A11.94 11.94 0 0 0 0 12c0 2.01.5 3.91 1.21 5.62l4.11-3.38z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.62l4.11 3.38c.94-2.85 3.57-4.96 6.68-4.96z"
                    />
                  </svg>
                )}
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div id="scheduler-error-banner" className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 flex items-start gap-2.5 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Details */}
      {successEvent && (
        <div id="scheduler-google-success-card" className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl text-stone-300 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
            <Check className="w-4 h-4 text-emerald-400" /> Google Calendar Event Synced Successfully!
          </div>
          <p className="text-stone-300 leading-relaxed font-sans">
            The session has been written live to <strong>{user?.email}</strong>'s calendar and dispatched invites.
          </p>
          <div className="flex items-center gap-3 mt-1">
            <a
              id="view-calendar-link"
              href={successEvent.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-white font-bold underline hover:text-stone-300 font-mono"
            >
              Open Calendar <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Booking Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-between border-t border-stone-850">
        <div className="flex items-center gap-2 text-stone-400 text-sm font-mono font-light">
          <Clock className="w-4 h-4 text-stone-450" /> Duration: 45 Minute Intense Perception Shift
        </div>

        <button
          id="confirm-booking-btn"
          type="button"
          disabled={isLoading || !selectedSlot}
          onClick={handleBookSession}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4.5 bg-white hover:bg-stone-100 text-stone-950 rounded-full font-heading text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Aligning & Reserving...
            </>
          ) : token ? (
            <>
              <Sparkles className="w-4 h-4" /> Sync & Book Breakthrough
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Book Breakthrough Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}
