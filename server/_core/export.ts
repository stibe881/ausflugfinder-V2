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
 * Generate a modern, beautifully formatted PDF
 */
export async function generatePDFContent(plan: ExportPlan): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
  });

  // Collect PDF content into buffer
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header with gradient effect simulation
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#3b82f6');
    doc.text('AusflugFinder', { align: 'center' });

    doc.fontSize(12).fillColor('#666666');
    doc.text('Ausflugplanung', { align: 'center' });

    // Line separator
    doc.moveTo(40, doc.y + 10).lineTo(555, doc.y + 10).stroke('#3b82f6');
    doc.moveDown();

    // Title section
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1f2937');
    doc.text(plan.title);

    // Date range
    doc.fontSize(11).font('Helvetica').fillColor('#666666');
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
    doc.text(`📅 ${startDate} bis ${endDate}`);

    if (plan.description) {
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#555555');
      doc.text(plan.description);
    }

    doc.moveDown();

    // Trips section header
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1f2937');
    doc.text('🗺️ Geplante Ausflüge');

    doc.moveTo(40, doc.y + 5).lineTo(555, doc.y + 5).stroke('#e5e7eb');
    doc.moveDown();

    // Trip items
    plan.items.forEach((item, index) => {
      // Item number and title
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1f2937');
      doc.text(`${index + 1}. ${item.trip.title}`);

      // Trip details
      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text(`📍 Zielort: ${item.trip.destination}`);

      if (item.startTime) {
        let timeStr = `🕐 Zeit: ${item.startTime}`;
        if (item.endTime) {
          timeStr += ` - ${item.endTime}`;
        }
        doc.text(timeStr);
      }

      if (item.notes) {
        doc.fontSize(9).fillColor('#555555').font('Helvetica-Oblique');
        doc.text(`Notizen: ${item.notes}`);
        doc.font('Helvetica');
      }

      // Item separator
      doc.moveDown(0.3);
      if (index < plan.items.length - 1) {
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#f0f0f0');
      }
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke('#3b82f6');
    doc.moveDown();

    doc.fontSize(9).fillColor('#999999').font('Helvetica-Oblique');
    doc.text('Erstellt mit AusflugFinder', { align: 'center' });
    doc.text(`${new Date().toLocaleString('de-DE')}`, { align: 'center' });

    doc.end();
  });
}
