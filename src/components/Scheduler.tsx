import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check, RefreshCw, AlertCircle, CalendarRange, Download } from 'lucide-react';
import { BookingState } from '../types';
import { downloadIcsFile } from '../lib/ics';

interface SchedulerProps {
  onBooked: (booking: BookingState, synced: boolean) => void;
  userEmail?: string;
}

export default function Scheduler({ onBooked }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [days, setDays] = useState<{ dateString: string; label: string; dayName: string; isPast: boolean; isWeekend: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load next 12 available weekday dates
  useEffect(() => {
    const list = [];
    const current = new Date();
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

  const slots = {
    morning: ['09:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM'],
  };

  const handleBookSession = () => {
    if (!selectedSlot) {
      setError('Please select an inspiring consultation time slot first.');
      return;
    }

    setIsLoading(true);
    const booking: BookingState = { date: selectedDate, timeSlot: selectedSlot };

    try {
      // Trigger instant iCal (.ics) file download
      downloadIcsFile(selectedDate, selectedSlot);
    } catch (err) {
      console.error('Error generating iCal event:', err);
    }

    // Call prop onBooked (synced is false as we're bypassing Google API)
    setTimeout(() => {
      setIsLoading(false);
      onBooked(booking, false);
    }, 600);
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

      {/* iCal Integration Panel */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 28 }}>
        <div className="glass-subtle" style={{
          borderColor: 'rgba(202,138,4,0.15)',
          borderRadius: 16,
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <CalendarIcon style={{ width: 18, height: 18, color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}>
                Instant iCalendar (.ics) Integration
              </h4>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                No account linking or authorizations required. Booking your session will instantly generate and save a de-identified, secure iCalendar (.ics) file to your system, which can be imported into Apple Calendar, Outlook, Google Calendar, or any local planner with a single click.
              </p>
            </div>
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
          ) : (
            <>
              <Check style={{ width: 14, height: 14 }} />
              Book breakthrough & save to calendar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
