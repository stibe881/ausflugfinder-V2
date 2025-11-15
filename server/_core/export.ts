/**
 * Export service for PDF and iCal formats
 */
import PDFDocument from 'pdfkit';

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
    'PRODID:-//AusflugFinder//DE',
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
 * Generate a modern, beautifully formatted PDF with proper encoding
 */
export async function generatePDFContent(plan: ExportPlan): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    // Force UTF-8 encoding for proper character handling
    font: 'Helvetica',
  });

  // Collect PDF content into buffer
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const colors = {
      primary: '#0ea5e9',     // Modern cyan/blue
      dark: '#0f172a',        // Dark slate
      lightGray: '#f1f5f9',   // Light background
      text: '#1e293b',        // Text color
      lightText: '#64748b',   // Light text
      border: '#cbd5e1',      // Border color
    };

    // ===== HEADER =====
    // Background box
    doc.rect(0, 0, doc.page.width, 100).fill(colors.primary);

    // Title
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff');
    doc.text('AusflugFinder', 50, 25);

    // Subtitle
    doc.fontSize(11).font('Helvetica').fillColor('#e0f2fe');
    doc.text('Tagesplanung', 50, 60);

    // Reset position
    doc.moveDown(3);

    // ===== PLAN TITLE & INFO =====
    doc.fontSize(22).font('Helvetica-Bold').fillColor(colors.dark);
    doc.text(plan.title);

    // Date range with proper text (no emojis)
    doc.fontSize(10).font('Helvetica').fillColor(colors.lightText);
    const startDate = new Date(plan.startDate).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const endDate = new Date(plan.endDate).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`[DATUM] ${startDate} bis ${endDate}`);

    if (plan.description) {
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor(colors.text);
      doc.text(plan.description, { width: 495 });
    }

    doc.moveDown(1.5);

    // ===== SECTION DIVIDER =====
    doc.strokeColor(colors.primary);
    doc.lineWidth(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    // ===== TRIPS SECTION HEADER =====
    doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.dark);
    doc.text('Geplante Ausflüge');
    doc.moveDown(0.5);

    // ===== TRIP ITEMS =====
    plan.items.forEach((item, index) => {
      // Background for each item
      doc.rect(45, doc.y - 3, 505, 75).fillAndStroke(colors.lightGray, colors.border);
      doc.moveDown(0.3);

      // Item number and title
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.primary);
      doc.text(`${index + 1}. ${item.trip.title}`, 55, doc.y);
      doc.moveDown(0.8);

      // Trip details
      doc.fontSize(9).font('Helvetica').fillColor(colors.text);
      doc.text(`Zielort: ${item.trip.destination}`, 55);

      if (item.startTime || item.endTime) {
        let timeStr = 'Zeit: ';
        if (item.startTime) {
          timeStr += item.startTime;
        }
        if (item.endTime) {
          timeStr += (item.startTime ? ' - ' : '') + item.endTime;
        }
        doc.text(timeStr, 55);
      }

      if (item.notes) {
        doc.fontSize(8).font('Helvetica-Oblique').fillColor(colors.lightText);
        doc.text(`Notizen: ${item.notes}`, 55, doc.y, { width: 480 });
      }

      doc.moveDown(0.8);
    });

    doc.moveDown(1);

    // ===== FOOTER =====
    doc.strokeColor(colors.primary);
    doc.lineWidth(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    doc.fontSize(8).font('Helvetica').fillColor(colors.lightText);
    doc.text('Erstellt mit AusflugFinder', { align: 'center' });
    const timestamp = new Date().toLocaleDateString('de-DE') + ' ' +
                     new Date().toLocaleTimeString('de-DE');
    doc.text(timestamp, { align: 'center' });

    // Page numbers
    doc.fontSize(8).fillColor(colors.lightText);
    doc.text(`Seite 1`, 50, doc.page.height - 30, { align: 'right' });

    doc.end();
  });
}
