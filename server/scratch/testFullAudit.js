const { auditWebsite } = require('../src/services/websiteAuditService');

async function test() {
  const result = await auditWebsite('https://blackvigor.com');
  console.log(JSON.stringify(result, null, 2));
}

test();
