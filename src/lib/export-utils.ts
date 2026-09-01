import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ApprovalChecklistItem } from '@/types';

export function exportApprovalChecklistPDF(
  projectName: string,
  district: string,
  checklist: ApprovalChecklistItem[]
) {
  const doc = new jsPDF();

  // Header Branding
  doc.setFillColor(18, 59, 102); // Govt Primary Blue
  doc.rect(0, 0, 210, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('UdyogSathi - Government of Maharashtra', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Industrial Approval & Compliance Single Window Gateway', 14, 21);

  // Document Title & Metadata
  doc.setTextColor(23, 32, 51);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Personalized Approval Checklist`, 14, 35);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project Name: ${projectName}`, 14, 42);
  doc.text(`District / Location: ${district}, Maharashtra`, 14, 48);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 54);

  doc.setTextColor(199, 53, 53); // Disclaimer Red
  doc.setFontSize(8);
  doc.text(
    'DEMO / INFORMATIONAL PROTOTYPE: Final eligibility and approval decisions remain with competent government authorities.',
    14,
    60
  );

  // Table Data Preparation
  const tableRows = checklist.map((item, index) => [
    (index + 1).toString(),
    item.approvalTitle,
    item.department,
    item.projectStage,
    `${item.estimatedSlaDays} Days`,
    item.riskLevel,
    item.requiredDocuments.join(', '),
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['#', 'Approval Required', 'Department', 'Stage', 'SLA', 'Risk', 'Required Documents']],
    body: tableRows,
    headStyles: { fillColor: [18, 59, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Save PDF
  doc.save(`UdyogSathi_Checklist_${projectName.replace(/\s+/g, '_')}.pdf`);
}

export function exportApplicationsCSV(applications: Array<Record<string, any>>) {
  const headers = ['Application ID', 'Approval Title', 'Department', 'Status', 'Risk Level', 'Submission Date', 'SLA Due Date'];
  const csvRows = [
    headers.join(','),
    ...applications.map(app =>
      [
        `"${app.id || ''}"`,
        `"${app.approvalName || ''}"`,
        `"${app.department || ''}"`,
        `"${app.status || ''}"`,
        `"${app.riskLevel || ''}"`,
        `"${app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : 'N/A'}"`,
        `"${app.slaDueDate ? new Date(app.slaDueDate).toLocaleDateString() : 'N/A'}"`,
      ].join(',')
    ),
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `UdyogSathi_Applications_Export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateICSCalendarFile(title: string, description: string, dateStr: string) {
  const eventDate = new Date(dateStr);
  const startStr = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);
  const endStr = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UdyogSathi Maharashtra//Compliance Reminder//EN',
    'BEGIN:VEVENT',
    `SUMMARY:UdyogSathi Compliance: ${title}`,
    `DESCRIPTION:${description}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Reminder.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
