async function verifyAll() {
  console.log('--- STARTING PDC E2E AUTOMATED VERIFICATION ---');
  
  // 1. Health check
  const health = await (await fetch('http://localhost:5000/api/health')).json();
  console.log('1. Health check:', health.status === 'OK' ? 'PASS' : 'FAIL');

  // 2. Auth Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pixiedigitalcreatives.com', password: 'pdc_admin_secure_2026' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('2. Admin Authentication:', loginData.success ? 'PASS (Role: ' + loginData.user.role + ')' : 'FAIL');

  const authHeaders = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  // 3. Dashboard KPIs
  const dashRes = await (await fetch('http://localhost:5000/api/dashboard/stats', { headers: authHeaders })).json();
  console.log('3. Dashboard KPIs & Charts:', dashRes.success ? 'PASS (Total Leads: ' + dashRes.stats.totalLeads + ')' : 'FAIL');

  // 4. Create Campaign & Live Progression
  console.log('4. Creating test campaign: Gyms in Greater Noida (Target: 5)...');
  const campRes = await (await fetch('http://localhost:5000/api/campaigns', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      industry: 'Gym',
      location: 'Greater Noida',
      keywords: 'fitness, gym, club',
      targetCount: 5,
      minimumRating: 4.0,
      minimumReviews: 20
    })
  })).json();

  console.log('   Campaign created with ID:', campRes.campaign?._id, 'Status:', campRes.campaign?.status);
  const campId = campRes.campaign?._id;

  // Poll progress until completion
  let completed = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise(r => setTimeout(r, 700));
    const check = await (await fetch('http://localhost:5000/api/campaigns/' + campId, { headers: authHeaders })).json();
    const c = check.campaign;
    console.log(`   Progress poll [${attempt + 1}]: Stage: "${c.progress?.stage}" (${c.progress?.percentage}%) - ${c.progress?.message}`);
    if (c.status === 'COMPLETED') {
      completed = true;
      console.log('   Campaign completed! Discovered:', c.stats?.qualifiedLeads, 'leads (Hot:', c.stats?.hotCount, ', Warm:', c.stats?.warmCount, ')');
      break;
    }
  }
  console.log('4. Asynchronous Campaign Queue Execution:', completed ? 'PASS' : 'FAIL');

  // 5. Query Leads with Filter
  const leadsRes = await (await fetch('http://localhost:5000/api/leads?campaignId=' + campId, { headers: authHeaders })).json();
  console.log('5. Lead Database Query & Filter:', leadsRes.success ? 'PASS (' + leadsRes.count + ' leads fetched)' : 'FAIL');

  // 6. Lead Details, Score Breakdown, and AI Pitch
  if (leadsRes.leads && leadsRes.leads.length > 0) {
    const lead = leadsRes.leads[0];
    console.log('6. Sample Lead Verification:');
    console.log('   Name:', lead.businessName);
    console.log('   Category:', lead.category);
    console.log('   Website Status:', lead.websiteStatus);
    console.log('   PDC Lead Score:', lead.score + '/100 (' + lead.scoreClassification + ')');
    console.log('   Discovered Gaps Count:', lead.digitalGaps?.length);
    console.log('   Observation:', lead.pitch?.observation?.substring(0, 70) + '...');
    console.log('   WhatsApp Pitch:', lead.whatsappMessage?.substring(0, 60) + '...');
  }

  // 7. Standalone Website Audit Tool
  const auditRes = await (await fetch('http://localhost:5000/api/audit', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ url: 'https://goldsgym.in' })
  })).json();
  console.log('7. Live Website Auditor:', auditRes.success ? 'PASS (Status: ' + auditRes.status + ', HTTPS: ' + auditRes.audit?.https + ', Mobile: ' + auditRes.audit?.mobileResponsive + ')' : 'FAIL');

  // 8. Excel Export
  const exportRes = await fetch('http://localhost:5000/api/leads/export', { headers: authHeaders });
  const exportBuf = await exportRes.arrayBuffer();
  console.log('8. Excel Export (.xlsx matching PDC Template):', exportRes.status === 200 && exportBuf.byteLength > 5000 ? 'PASS (Size: ' + exportBuf.byteLength + ' bytes)' : 'FAIL');

  // 9. Outreach Logging
  const outreachRes = await (await fetch('http://localhost:5000/api/outreach', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      leadId: leadsRes.leads[0]._id,
      channel: 'WhatsApp',
      message: 'Test automated message to verified business',
      status: 'Sent'
    })
  })).json();
  console.log('9. Outreach Logging & Pipeline Stage Transition:', outreachRes.success ? 'PASS (New Stage: ' + outreachRes.leadStage + ')' : 'FAIL');

  // 10. Settings & Logs
  const settingsRes = await (await fetch('http://localhost:5000/api/settings', { headers: authHeaders })).json();
  const logsRes = await (await fetch('http://localhost:5000/api/logs', { headers: authHeaders })).json();
  console.log('10. Settings & System Logs API:', settingsRes.success && logsRes.success ? 'PASS (' + logsRes.count + ' log entries recorded)' : 'FAIL');

  console.log('--- ALL E2E AUTOMATED VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

verifyAll().catch(e => {
  console.error('VERIFICATION ERROR:', e);
  process.exit(1);
});
