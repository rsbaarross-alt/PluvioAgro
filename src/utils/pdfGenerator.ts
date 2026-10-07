import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyProfile } from '../types';
import { formatMm } from './formatters';
import { getCompanyLogoPngDataUrl } from '../assets/companyLogo';

export interface PdfReportRow {
  title: string;
  subtitle?: string;
  totalMm: number;
  count: number;
  maxMm: number;
  percentageOfTotal: number;
}

export interface PdfDetailedRecord {
  date: string;
  time: string;
  farmName: string;
  pointName: string;
  amountMm: number;
  observation?: string;
}

export interface GeneratePdfOptions {
  company: CompanyProfile;
  title: string;
  farmName: string;
  harvestName: string;
  periodText: string;
  groupingLabel: string;
  grandTotalMm: number;
  rainyDaysTotal: number;
  recordsCount: number;
  averageMm?: number;
  reportRows: PdfReportRow[];
  detailedRecords?: PdfDetailedRecord[];
}

export async function buildPdfDocument(options: GeneratePdfOptions): Promise<jsPDF> {
  const {
    company,
    title,
    farmName,
    harvestName,
    periodText,
    groupingLabel,
    grandTotalMm,
    rainyDaysTotal,
    recordsCount,
    averageMm,
    reportRows,
    detailedRecords = [],
  } = options;

  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;

  /* -------------------------------------------------------------
     1. LOGO RESOLUTION (PROPORTIONAL FIDELITY)
     ------------------------------------------------------------- */
  let logoDataUrl = company.logoUrl;
  if (!logoDataUrl || !logoDataUrl.startsWith('data:image')) {
    try {
      logoDataUrl = await getCompanyLogoPngDataUrl();
    } catch {
      logoDataUrl = undefined;
    }
  }

  // Exact 1:1 proportional dimensions for logo: max 18mm height
  const logoSize = 18;
  const logoX = marginX;
  const logoY = 12;

  /* -------------------------------------------------------------
     2. INSTITUTIONAL HEADER (ONLY ON PAGE 1)
     ------------------------------------------------------------- */
  let textStartX = marginX;

  if (logoDataUrl && logoDataUrl.startsWith('data:image')) {
    try {
      const format = logoDataUrl.includes('image/jpeg') || logoDataUrl.includes('image/jpg') ? 'JPEG' : 'PNG';
      doc.addImage(logoDataUrl, format, logoX, logoY, logoSize, logoSize, undefined, 'FAST');
      textStartX = logoX + logoSize + 4;
    } catch (e) {
      console.warn('Erro ao renderizar imagem do logo:', e);
      textStartX = marginX;
    }
  }

  // Company Information (Left block)
  doc.setTextColor(20, 61, 43); // Corporate Green #143D2B
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const companyName = company.name || company.tradeName || 'Agropecuária';
  doc.text(companyName, textStartX, logoY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // Slate 600

  let headerLineY = logoY + 8.5;
  if (company.document) {
    doc.text(`CNPJ/CPF: ${company.document}`, textStartX, headerLineY);
    headerLineY += 3.5;
  }

  const addressParts = [
    company.address,
    [company.city, company.state].filter(Boolean).join(' - '),
    company.zipCode ? `CEP ${company.zipCode}` : '',
  ].filter(Boolean).join(', ');

  const contactLine = [addressParts || company.address, company.phone, company.email].filter(Boolean).join(' • ');
  if (contactLine) {
    doc.text(contactLine.slice(0, 85), textStartX, headerLineY);
    headerLineY += 3.5;
  }

  // Emission Metadata (Right block)
  const now = new Date();
  const emissionDateStr = now.toLocaleDateString('pt-BR');
  const emissionTimeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(20, 61, 43);
  doc.text('GESTÃO PLUVIOMÉTRICA PROFISSIONAL', pageWidth - marginX, logoY + 4.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emissão: ${emissionDateStr} às ${emissionTimeStr}`, pageWidth - marginX, logoY + 8.5, { align: 'right' });
  doc.text('Documento Oficial de Monitoramento', pageWidth - marginX, logoY + 12, { align: 'right' });

  // Green separator line
  const headerBottomY = Math.max(headerLineY, logoY + logoSize) + 2;
  doc.setDrawColor(20, 61, 43);
  doc.setLineWidth(0.6);
  doc.line(marginX, headerBottomY, pageWidth - marginX, headerBottomY);

  /* -------------------------------------------------------------
     3. REPORT TITLE & COMPACT TOTALS SUMMARY STRIP
     ------------------------------------------------------------- */
  let currentY = headerBottomY + 4;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(title.toUpperCase(), marginX, currentY + 1);
  currentY += 4.5;

  // COMPACT & ELEGANT 1-LINE TOTALS SUMMARY STRIP
  const stripWidth = pageWidth - (marginX * 2);
  const stripHeight = 7.5;

  doc.setFillColor(241, 247, 244); // Subtle emerald tint #F1F7F4
  doc.setDrawColor(20, 61, 43); // Corporate green #143D2B
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, stripWidth, stripHeight, 1, 1, 'FD');

  const avgVal = averageMm !== undefined
    ? formatMm(averageMm)
    : (rainyDaysTotal > 0 ? formatMm(grandTotalMm / rainyDaysTotal) : '0,0 mm');

  const summarySegments = [
    { label: 'VOLUME TOTAL:', val: formatMm(grandTotalMm), isBold: true },
    { label: 'DIAS COM CHUVA:', val: `${rainyDaysTotal} ${rainyDaysTotal === 1 ? 'dia' : 'dias'}`, isBold: false },
    { label: 'LANÇAMENTOS:', val: `${recordsCount} registros`, isBold: false },
    { label: 'MÉDIA POR DIA CHUVOSO:', val: avgVal, isBold: false },
  ];

  const colWidth = stripWidth / summarySegments.length;
  summarySegments.forEach((seg, idx) => {
    const colX = marginX + (idx * colWidth);
    const midX = colX + (colWidth / 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);

    const labelW = doc.getTextWidth(seg.label);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 61, 43);
    const valW = doc.getTextWidth(seg.val);

    const totalSegW = labelW + 1.5 + valW;
    const startSegX = midX - (totalSegW / 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(seg.label, startSegX, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 61, 43);
    doc.text(seg.val, startSegX + labelW + 1.5, currentY + 4.8);

    if (idx < summarySegments.length - 1) {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.line(colX + colWidth, currentY + 1.5, colX + colWidth, currentY + stripHeight - 1.5);
    }
  });

  currentY += stripHeight + 4;

  /* -------------------------------------------------------------
     4. PRIMARY SECTION: TABLES (MAIN REPORT BODY)
     ------------------------------------------------------------- */
  // Decide whether to show Grouped Summary table or Detailed Records as main
  const hasDetailedRecords = detailedRecords.length > 0;

  // 4A. If Grouped Summary Table has items
  if (reportRows.length > 0) {
    const summaryHeaders = [
      'Item / Período',
      'Detalhamento / Local',
      'Volume (mm)',
      'Registros',
      'Pico Diário (mm)',
      '% do Total',
    ];

    const summaryBody = reportRows.map(row => [
      row.title,
      row.subtitle || '-',
      formatMm(row.totalMm),
      `${row.count} ${row.count === 1 ? 'leitura' : 'leituras'}`,
      row.maxMm > 0 ? formatMm(row.maxMm) : '-',
      `${Math.round(row.percentageOfTotal)}%`,
    ]);

    const summaryFoot = [
      'TOTAL CONSOLIDADO',
      `${reportRows.length} itens/períodos`,
      formatMm(grandTotalMm),
      `${recordsCount} leituras`,
      '-',
      '100%',
    ];

    autoTable(doc, {
      startY: currentY,
      head: [summaryHeaders],
      body: summaryBody,
      foot: [summaryFoot],
      theme: 'plain',
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
      margin: {
        left: marginX,
        right: marginX,
        top: 17, // Clean top margin on page 2+
        bottom: 22,
      },
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [20, 61, 43],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      footStyles: {
        fillColor: [241, 247, 244],
        textColor: [20, 61, 43],
        fontStyle: 'bold',
        fontSize: 7.5,
        lineColor: [20, 61, 43],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { textColor: [100, 116, 139] },
        2: { fontStyle: 'bold', halign: 'right', textColor: [20, 61, 43] },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });

    const lastTable = (doc as any).lastAutoTable;
    currentY = lastTable ? lastTable.finalY + 5 : currentY + 30;
  }

  // 4B. Detailed Records Table (Detalhamento dos Lançamentos)
  if (hasDetailedRecords) {
    // If remaining space on current page is tight, add new page cleanly to avoid orphan single lines
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 61, 43);
    doc.text('DETALHAMENTO DOS LANÇAMENTOS NO PERÍODO', marginX, currentY);
    currentY += 3;

    const detailedHeaders = ['Data', 'Hora', 'Fazenda', 'Talhão / Ponto', 'Precipitação', 'Observação'];
    const detailedBody = detailedRecords.map(r => [
      r.date,
      r.time,
      r.farmName,
      r.pointName,
      formatMm(r.amountMm),
      r.observation || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [detailedHeaders],
      body: detailedBody,
      theme: 'plain',
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
      margin: {
        left: marginX,
        right: marginX,
        top: 17,
        bottom: 22,
      },
      styles: {
        font: 'helvetica',
        fontSize: 7.5,
        cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [51, 65, 85], // Slate 700
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        4: { fontStyle: 'bold', halign: 'right', textColor: [20, 61, 43] },
        5: { textColor: [100, 116, 139], fontStyle: 'italic' },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
    });

    const lastTable = (doc as any).lastAutoTable;
    currentY = lastTable ? lastTable.finalY + 5 : currentY + 30;
  }

  /* -------------------------------------------------------------
     5. LOWER SECTION: IDENTIFICAÇÃO DO RELATÓRIO E PARÂMETROS
     (Moved to lower section as requested by user)
     ------------------------------------------------------------- */
  const idBoxHeight = 15;
  // If not enough space before bottom margin, push to new page
  if (currentY > pageHeight - idBoxHeight - 16) {
    doc.addPage();
    currentY = 18;
  }

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, stripWidth, idBoxHeight, 1.5, 1.5, 'FD');

  // Title bar inside the box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(20, 61, 43);
  doc.text('IDENTIFICAÇÃO DO RELATÓRIO E PARÂMETROS DE CONTROLE', marginX + 3.5, currentY + 4);

  const idCol1X = marginX + 3.5;
  const idCol2X = marginX + 50;
  const idCol3X = marginX + 105;
  const idCol4X = marginX + 145;

  const idLabelY = currentY + 8.5;
  const idValY = currentY + 12.5;

  // Propriedade
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('PROPRIEDADE / FAZENDA', idCol1X, idLabelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(farmName.slice(0, 25), idCol1X, idValY);

  // Safra
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('SAFRA AGRÍCOLA', idCol2X, idLabelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(harvestName.slice(0, 28), idCol2X, idValY);

  // Agrupamento
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('TIPO DE AGRUPAMENTO', idCol3X, idLabelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(groupingLabel, idCol3X, idValY);

  // Período
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('PERÍODO ANALISADO', idCol4X, idLabelY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(periodText.slice(0, 25), idCol4X, idValY);

  /* -------------------------------------------------------------
     6. SUBSEQUENT PAGES: MINI HEADER & NUMBERING ON ALL PAGES
     (Does not repeat the heavy institutional header!)
     ------------------------------------------------------------- */
  const totalPages = doc.getNumberOfPages();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    // On pages 2+, draw a subtle, clean mini header line
    if (pageNum > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 61, 43);
      doc.text(
        `${company.name || 'Agropecuária São Paulo'} • Relatório de Precipitação (Continuação)`,
        marginX,
        11
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Emissão: ${emissionDateStr}`, pageWidth - marginX, 11, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, 13.5, pageWidth - marginX, 13.5);
    }

    // Bottom Footer on all pages
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PluvioAgro - Sistema de Monitoramento Pluviométrico | ${company.name || 'Agropecuária'}`,
      marginX,
      pageHeight - 7.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text(
      `Página ${pageNum} de ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 7.5,
      { align: 'right' }
    );
  }

  return doc;
}

export async function downloadPdfReport(options: GeneratePdfOptions, customFilename?: string): Promise<void> {
  const doc = await buildPdfDocument(options);
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanTitle = (options.title || 'relatorio_pluviometrico')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  const cleanFarm = (options.farmName || 'fazenda')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 20);

  const filename = customFilename || `${cleanTitle}_${cleanFarm}_${dateStr}.pdf`;
  doc.save(filename);
}

export async function getPdfBlobUrl(options: GeneratePdfOptions): Promise<string> {
  const doc = await buildPdfDocument(options);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
