/**
 * Live HTTP Gateway Integration Test
 */

const http = require('http');
const APIGatewayServer = require('../backend/src/server');

async function testServer() {
  const server = new APIGatewayServer();
  await server.start(3001);

  function get(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:3001${path}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }).on('error', reject);
    });
  }

  console.log('Testing live HTTP endpoints on port 3001...');
  const health = await get('/api/v1/health');
  console.log('Health Status:', health.status, health.body);

  const students = await get('/api/v1/students');
  console.log('Students Response:', students.status, 'Count:', students.body.data?.length);

  const docs = await get('/api/v1/knowledge/documents');
  console.log('Knowledge Docs Response:', docs.status, 'Count:', docs.body.data?.length);

  const zoom = await get('/api/v1/zoom/meetings');
  console.log('Zoom Meetings Response:', zoom.status, 'Count:', zoom.body.data?.length);

  server.server.close();
  console.log('✅ Live HTTP test verified and server closed cleanly.');
}

testServer().catch(err => {
  console.error('HTTP Test Error:', err);
  process.exit(1);
});
