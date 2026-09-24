const ExcelJS = require('exceljs');

/**
 * Exports leads to an Excel (.xlsx) workbook strictly matching the PDC Lead Intelligence format
 */
const exportLeadsToExcel = async (leads, campaignName = 'PDC_Leads') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pixie Digital Creatives (PDC)';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Lead Intelligence', {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  // PDC Exact 15 Columns
  worksheet.columns = [
    { header: 'Business Name', key: 'businessName', width: 28 },
    { header: 'Business Category', key: 'businessCategory', width: 20 },
    { header: 'Website Available?', key: 'websiteAvailable', width: 18 },
    { header: 'Website Link', key: 'websiteLink', width: 32 },
    { header: 'Ratings', key: 'ratings', width: 14 },
    { header: 'Competitor', key: 'competitor', width: 18 },
    { header: 'Instagram ID', key: 'instagramId', width: 22 },
    { header: 'Followers', key: 'followers', width: 14 },
    { header: 'Phone / Contact Number', key: 'phone', width: 22 },
    { header: 'Pipeline Stage', key: 'stage', width: 18 },
    { header: 'What We Can Pitch', key: 'pitch', width: 36 },
    { header: 'Contact Person', key: 'contactPerson', width: 18 },
    { header: 'Email Address', key: 'email', width: 24 },
    { header: 'Inbound Source', key: 'source', width: 18 },
    { header: 'General Notes', key: 'notes', width: 35 }
  ];

  // Header Styling - PDC Metallic Dark
  const headerRow = worksheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF121216' }
    };
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF33333E' } },
      left: { style: 'thin', color: { argb: 'FF33333E' } },
      bottom: { style: 'medium', color: { argb: 'FF3B82F6' } }, // Electric blue accent line
      right: { style: 'thin', color: { argb: 'FF33333E' } }
    };
  });

  // Populate Lead Rows
  leads.forEach((lead) => {
    const hasWeb = lead.website && lead.websiteStatus !== 'NO WEBSITE';
    const webStatusLabel = hasWeb ? `YES (${lead.websiteStatus})` : 'NO';
    const ratingStr = `${lead.rating || 0}★ (${lead.reviewCount || 0})`;
    const followersStr = lead.instagramFollowers ? lead.instagramFollowers.toLocaleString() : 'N/A';
    const whatWeCanPitch = lead.recommendedServices?.length > 0 
      ? lead.recommendedServices.join(', ')
      : (lead.pitch?.recommendedService || 'Custom Web & Lead Funnels');

    const notesSummary = [
      lead.reasonToContact,
      lead.score ? `[PDC Score: ${lead.score}/100 - ${lead.scoreClassification}]` : '',
      lead.notes?.map(n => n.text).join('; ')
    ].filter(Boolean).join(' | ');

    const row = worksheet.addRow({
      businessName: lead.businessName,
      businessCategory: lead.category || lead.businessCategory,
      websiteAvailable: webStatusLabel,
      websiteLink: lead.website || 'N/A',
      ratings: ratingStr,
      competitor: lead.competitor || 'N/A',
      instagramId: lead.instagramUsername !== 'NOT FOUND' ? `@${lead.instagramUsername}` : 'NOT FOUND',
      followers: followersStr,
      phone: lead.phone || 'NOT FOUND',
      stage: lead.stage || 'NEW',
      pitch: whatWeCanPitch,
      contactPerson: lead.contactPerson || 'NOT FOUND',
      email: lead.email || 'NOT FOUND',
      source: lead.source || 'Google Places',
      notes: notesSummary
    });

    row.height = 22;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };

      // Center align specific columns
      if ([3, 5, 8, 10, 14].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = {
  exportLeadsToExcel
};
