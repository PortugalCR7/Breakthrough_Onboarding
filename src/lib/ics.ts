/**
 * Helper to generate and download iCal (.ics) calendar files for the Breakthrough Experience booking.
 */

export const generateIcsFile = (dateStr: string, timeSlotStr: string): string => {
  // dateStr is in 'YYYY-MM-DD' format
  const dateFormatted = dateStr.replace(/-/g, '');

  // Parse 12-hour slot time (e.g., '09:00 AM' or '01:30 PM')
  const [time, modifier] = timeSlotStr.split(' ');
  const [hoursStr, minutesStr] = time.split(':');
  let hrs = parseInt(hoursStr, 10);
  if (modifier === 'PM' && hrs < 12) hrs += 12;
  if (modifier === 'AM' && hrs === 12) hrs = 0;

  const startHours = String(hrs).padStart(2, '0');
  const startMinutes = minutesStr.padStart(2, '0');

  // End time is 45 minutes later
  let endHrs = hrs;
  let endMins = parseInt(minutesStr, 10) + 45;
  if (endMins >= 60) {
    endMins -= 60;
    endHrs += 1;
  }
  const endHoursFormatted = String(endHrs).padStart(2, '0');
  const endMinutesFormatted = String(endMins).padStart(2, '0');

  // DTSTAMP format: YYYYMMDDTHHMMSSZ (UTC)
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `breakthrough-experience-${Date.now()}@breakthroughexperience.com`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Breakthrough Experience//NONSGML Breakthrough Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dateFormatted}T${startHours}${startMinutes}00`,
    `DTEND:${dateFormatted}T${endHoursFormatted}${endMinutesFormatted}00`,
    'SUMMARY:Breakthrough & Values Alignment Session',
    'DESCRIPTION:Your personal transformation and perception-shifting breakthrough review with your facilitator.\\n\\nWe will evaluate your 7 areas of life objectives and release blockages.',
    'LOCATION:Virtual / Breakthrough Experience Live',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Breakthrough & Values Alignment Session in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
};

export const downloadIcsFile = (dateStr: string, timeSlotStr: string) => {
  const icsContent = generateIcsFile(dateStr, timeSlotStr);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Breakthrough_Session_${dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
