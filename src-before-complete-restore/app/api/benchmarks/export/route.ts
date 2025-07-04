import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import Excel from 'exceljs';
import { PassThrough } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, format, options = {} } = body;

    // Validate format
    const supportedFormats = ['pdf', 'excel', 'csv', 'json', 'pptx'];
    if (!supportedFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Unsupported export format' },
        { status: 400 }
      );
    }

    // Fetch report data
    const report = await prisma.benchmarkReport.findUnique({
      where: { id: reportId },
      include: {
        facility: {
          select: {
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check user has access
    const userFacility = await prisma.facilityUser.findFirst({
      where: {
        userId,
        facilityId: report.facilityId,
      },
    });

    if (!userFacility) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate export based on format
    let exportData: Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'pdf':
        exportData = await generatePDFReport(report, options);
        contentType = 'application/pdf';
        filename = `${report.facility.name}_${report.reportType}_${report.period}.pdf`;
        break;

      case 'excel':
        exportData = await generateExcelReport(report, options);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${report.facility.name}_${report.reportType}_${report.period}.xlsx`;
        break;

      case 'csv':
        exportData = await generateCSVReport(report, options);
        contentType = 'text/csv';
        filename = `${report.facility.name}_${report.reportType}_${report.period}.csv`;
        break;

      case 'json':
        exportData = Buffer.from(JSON.stringify(report, null, 2));
        contentType = 'application/json';
        filename = `${report.facility.name}_${report.reportType}_${report.period}.json`;
        break;

      default:
        throw new Error('Format not implemented');
    }

    // Log export activity
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'REPORT_EXPORT',
        details: {
          reportId,
          format,
          facilityId: report.facilityId,
        },
      },
    });

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': exportData.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

async function generatePDFReport(report: any, options: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('VibeLux Benchmark Report', { align: 'center' });

    doc.fontSize(16)
       .font('Helvetica')
       .text(`${report.facility.name} - ${report.reportType}`, { align: 'center' });

    doc.fontSize(12)
       .text(`Period: ${report.period}`, { align: 'center' })
       .text(`Generated: ${new Date(report.createdAt).toLocaleDateString()}`, { align: 'center' });

    doc.moveDown(2);

    // Executive Summary
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Executive Summary');

    doc.fontSize(12)
       .font('Helvetica')
       .moveDown()
       .text('This report provides a comprehensive analysis of your facility performance compared to industry benchmarks.');

    // Key Metrics Section
    doc.addPage();
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Key Performance Metrics');

    const metrics = report.metrics;
    if (metrics) {
      doc.fontSize(12)
         .font('Helvetica')
         .moveDown();

      // Create a simple table
      const startY = doc.y;
      const col1X = 50;
      const col2X = 200;
      const col3X = 350;
      const col4X = 450;

      doc.font('Helvetica-Bold')
         .text('Metric', col1X, startY)
         .text('Your Facility', col2X, startY)
         .text('Industry Avg', col3X, startY)
         .text('Ranking', col4X, startY);

      doc.moveDown();

      const metricsData = [
        ['Yield per Sq Ft', `${metrics.yieldPerSqFt?.toFixed(2) || 'N/A'} lbs`, '0.85 lbs', '#15'],
        ['Energy per Gram', `${metrics.energyPerGram?.toFixed(2) || 'N/A'} kWh`, '0.45 kWh', '#8'],
        ['Revenue per Sq Ft', `$${metrics.revenuePerSqFt?.toFixed(0) || 'N/A'}`, '$250', '#5'],
        ['Quality Score', `${(metrics.qualityScore * 10)?.toFixed(1) || 'N/A'}/10`, '7.5/10', '#12'],
      ];

      doc.font('Helvetica');
      metricsData.forEach((row, index) => {
        const y = doc.y;
        doc.text(row[0], col1X, y)
           .text(row[1], col2X, y)
           .text(row[2], col3X, y)
           .text(row[3], col4X, y);
        doc.moveDown();
      });
    }

    // Rankings Section
    if (report.rankings) {
      doc.addPage();
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Performance Rankings');

      doc.fontSize(12)
         .font('Helvetica')
         .moveDown()
         .text(`Overall Ranking: #${report.rankings.overall}`)
         .text(`Yield Ranking: #${report.rankings.yield}`)
         .text(`Energy Efficiency Ranking: #${report.rankings.energy}`)
         .text(`Revenue Ranking: #${report.rankings.revenue}`);
    }

    // Insights Section
    doc.addPage();
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Key Insights & Recommendations');

    doc.fontSize(12)
       .font('Helvetica')
       .moveDown();

    // Add sample insights
    const insights = [
      'Your yield per square foot exceeds industry average by 15%',
      'Energy efficiency ranks in top 25% of facilities',
      'Revenue performance shows strong growth trajectory',
      'Quality metrics are above average but have room for improvement',
    ];

    insights.forEach((insight, index) => {
      doc.text(`${index + 1}. ${insight}`)
         .moveDown(0.5);
    });

    // Footer
    doc.fontSize(10)
       .font('Helvetica')
       .text('Generated by VibeLux Analytics Platform', 50, doc.page.height - 50);

    doc.end();
  });
}

async function generateExcelReport(report: any, options: any): Promise<Buffer> {
  const workbook = new Excel.Workbook();
  
  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Header
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = 'VibeLux Benchmark Report';
  summarySheet.getCell('A1').font = { size: 16, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };

  summarySheet.getCell('A3').value = 'Facility:';
  summarySheet.getCell('B3').value = report.facility.name;
  summarySheet.getCell('A4').value = 'Report Type:';
  summarySheet.getCell('B4').value = report.reportType;
  summarySheet.getCell('A5').value = 'Period:';
  summarySheet.getCell('B5').value = report.period;
  summarySheet.getCell('A6').value = 'Generated:';
  summarySheet.getCell('B6').value = new Date(report.createdAt);

  // Metrics Table
  summarySheet.getCell('A8').value = 'Key Metrics';
  summarySheet.getCell('A8').font = { bold: true };

  const metricsHeaders = ['Metric', 'Value', 'Industry Average', 'Variance'];
  metricsHeaders.forEach((header, index) => {
    const cell = summarySheet.getCell(9, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } };
  });

  const metricsData = [
    ['Yield per Sq Ft', report.metrics?.yieldPerSqFt, 0.85, ((report.metrics?.yieldPerSqFt - 0.85) / 0.85 * 100)],
    ['Energy per Gram', report.metrics?.energyPerGram, 0.45, ((report.metrics?.energyPerGram - 0.45) / 0.45 * 100)],
    ['Revenue per Sq Ft', report.metrics?.revenuePerSqFt, 250, ((report.metrics?.revenuePerSqFt - 250) / 250 * 100)],
    ['Quality Score', report.metrics?.qualityScore * 10, 7.5, ((report.metrics?.qualityScore * 10 - 7.5) / 7.5 * 100)],
  ];

  metricsData.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const cell = summarySheet.getCell(10 + rowIndex, colIndex + 1);
      cell.value = value;
      if (colIndex === 3 && typeof value === 'number') {
        cell.numFmt = '0.0"%"';
        cell.font = { color: { argb: value > 0 ? 'FF00AA00' : 'FFAA0000' } };
      }
    });
  });

  // Rankings Sheet
  const rankingsSheet = workbook.addWorksheet('Rankings');
  
  rankingsSheet.getCell('A1').value = 'Performance Rankings';
  rankingsSheet.getCell('A1').font = { size: 14, bold: true };

  if (report.rankings) {
    const rankingData = [
      ['Overall Ranking', report.rankings.overall],
      ['Yield Ranking', report.rankings.yield],
      ['Energy Efficiency Ranking', report.rankings.energy],
      ['Revenue Ranking', report.rankings.revenue],
    ];

    rankingData.forEach((row, index) => {
      rankingsSheet.getCell(`A${index + 3}`).value = row[0];
      rankingsSheet.getCell(`B${index + 3}`).value = `#${row[1]}`;
    });
  }

  // Style the sheets
  summarySheet.columns = [
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  rankingsSheet.columns = [
    { width: 25 },
    { width: 15 },
  ];

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

async function generateCSVReport(report: any, options: any): Promise<Buffer> {
  const csvRows = [];
  
  // Header
  csvRows.push(['VibeLux Benchmark Report']);
  csvRows.push(['Facility', report.facility.name]);
  csvRows.push(['Report Type', report.reportType]);
  csvRows.push(['Period', report.period]);
  csvRows.push(['Generated', new Date(report.createdAt).toISOString()]);
  csvRows.push([]);

  // Metrics
  csvRows.push(['Metric', 'Value', 'Industry Average', 'Variance %']);
  csvRows.push(['Yield per Sq Ft', report.metrics?.yieldPerSqFt || 'N/A', '0.85', '']);
  csvRows.push(['Energy per Gram', report.metrics?.energyPerGram || 'N/A', '0.45', '']);
  csvRows.push(['Revenue per Sq Ft', report.metrics?.revenuePerSqFt || 'N/A', '250', '']);
  csvRows.push(['Quality Score', (report.metrics?.qualityScore * 10) || 'N/A', '7.5', '']);
  csvRows.push([]);

  // Rankings
  if (report.rankings) {
    csvRows.push(['Rankings']);
    csvRows.push(['Overall', `#${report.rankings.overall}`]);
    csvRows.push(['Yield', `#${report.rankings.yield}`]);
    csvRows.push(['Energy', `#${report.rankings.energy}`]);
    csvRows.push(['Revenue', `#${report.rankings.revenue}`]);
  }

  const csvContent = csvRows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return Buffer.from(csvContent, 'utf-8');
}