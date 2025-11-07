/**
 * Export service for PDF and iCal formats
 */

export interface ExportTrip {
  title: string;
  description?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface ExportPlan {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  items: Array<{
    trip: ExportTrip;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }>;
}

/**
 * Generate iCal format for a plan
 */
export function generateICalendar(plan: ExportPlan): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `plan-${Date.now()}@ausflug-manager.app`;
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ausflug Manager//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + plan.title,
    'X-WR-TIMEZONE:Europe/Zurich',
  ];

  plan.items.forEach((item, index) => {
    const eventStart = new Date(plan.startDate);
    if (item.startTime) {
      const [hours, minutes] = item.startTime.split(':');
      eventStart.setHours(parseInt(hours), parseInt(minutes));
    }

    const eventEnd = new Date(plan.startDate);
    if (item.endTime) {
      const [hours, minutes] = item.endTime.split(':');
      eventEnd.setHours(parseInt(hours), parseInt(minutes));
    } else {
      eventEnd.setHours(eventStart.getHours() + 2); // Default 2 hours
    }

    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}-${index}`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(eventStart)}`,
      `DTEND:${formatDate(eventEnd)}`,
      `SUMMARY:${item.trip.title}`,
      `LOCATION:${item.trip.destination}`,
      `DESCRIPTION:${item.notes || item.trip.description || ''}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT'
    );
  });

  ical.push('END:VCALENDAR');
  
  return ical.join('\r\n');
}

/**
 * Generate simple text-based "PDF" content
 * Note: For real PDF generation, you'd use a library like pdfkit or puppeteer
 */
export function generatePDFContent(plan: ExportPlan): string {
  let content = `AUSFLUG MANAGER - PLANUNG\n\n`;
  content += `Titel: ${plan.title}\n`;
  content += `Zeitraum: ${plan.startDate.toLocaleDateString('de-DE')} - ${plan.endDate.toLocaleDateString('de-DE')}\n`;
  
  if (plan.description) {
    content += `\nBeschreibung:\n${plan.description}\n`;
  }

  content += `\n\n=== GEPLANTE AUSFLÜGE ===\n\n`;

  plan.items.forEach((item, index) => {
    content += `${index + 1}. ${item.trip.title}\n`;
    content += `   Ziel: ${item.trip.destination}\n`;
    
    if (item.startTime) {
      content += `   Zeit: ${item.startTime}`;
      if (item.endTime) {
        content += ` - ${item.endTime}`;
      }
      content += `\n`;
    }
    
    if (item.notes) {
      content += `   Notizen: ${item.notes}\n`;
    }
    
    content += `\n`;
  });

  content += `\n\n---\nErstellt mit Ausflug Manager\n`;
  content += `Generiert am: ${new Date().toLocaleString('de-DE')}\n`;

  return content;
}
