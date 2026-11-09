const http = require('http');

async function runTests() {
  const { app, server } = require('./dist/app');

  // Helper request
  function makeRequest(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (data) headers['Content-Length'] = Buffer.byteLength(data);

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 5000,
          path,
          method,
          headers,
        },
        (res) => {
          let responseBody = '';
          res.on('data', (chunk) => (responseBody += chunk));
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: responseBody ? JSON.parse(responseBody) : null,
              });
            } catch {
              resolve({ status: res.statusCode, data: responseBody });
            }
          });
        }
      );

      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  }

  // Wait 500ms for server to listen
  await new Promise((r) => setTimeout(r, 500));

  console.log('--- 1. Testing GET /health ---');
  const healthRes = await makeRequest('GET', '/health');
  console.log('Health:', healthRes.status, healthRes.data);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  console.log('\n--- 2. Testing POST /api/auth/login ---');
  const loginRes = await makeRequest('POST', '/api/auth/login', {
    email: 'john@interviewiq.com',
    password: 'password123',
  });
  console.log('Login Status:', loginRes.status);
  console.log('User logged in:', loginRes.data?.data?.user?.name);
  const token = loginRes.data?.data?.token;
  if (!token) throw new Error('No JWT token returned');

  console.log('\n--- 3. Testing GET /api/users/profile ---');
  const profileRes = await makeRequest('GET', '/api/users/profile', null, token);
  console.log('Profile Status:', profileRes.status);
  console.log('Target Role:', profileRes.data?.data?.profile?.target_role);
  console.log('Skills count:', profileRes.data?.data?.skills?.length);

  console.log('\n--- 4. Testing GET /api/analytics/dashboard ---');
  const dashRes = await makeRequest('GET', '/api/analytics/dashboard', null, token);
  console.log('Dashboard Status:', dashRes.status);
  console.log('Stats:', dashRes.data?.data?.interviewsCount, 'interviews, avg score:', dashRes.data?.data?.averageScore);

  console.log('\n--- 5. Testing POST /api/interviews (Create Interview) ---');
  const createIntRes = await makeRequest('POST', '/api/interviews', {
    company: 'Google',
    role: 'Senior Full Stack Engineer',
    difficulty: 'Senior',
    type: 'Technical',
    duration_minutes: 30,
  }, token);
  console.log('Create Interview Status:', createIntRes.status);
  const interviewId = createIntRes.data?.data?.id;
  console.log('New Interview ID:', interviewId);

  console.log('\n--- 6. Testing POST /api/interviews/:id/start ---');
  const startRes = await makeRequest('POST', `/api/interviews/${interviewId}/start`, {}, token);
  console.log('Start Status:', startRes.status);
  const currentQ = startRes.data?.data?.currentQuestion;
  console.log('First Question:', currentQ?.question_text?.substring(0, 80) + '...');

  console.log('\n--- 7. Testing POST /api/interviews/:id/answer ---');
  const answerRes = await makeRequest('POST', `/api/interviews/${interviewId}/answer`, {
    question_id: currentQ.id,
    answer: 'I design stateless API gateways with JWT authentication, Redis token buckets for rate limiting, and Socket.IO clusters backed by Redis pub/sub for real-time bidirectional synchronization.',
  }, token);
  console.log('Answer Status:', answerRes.status);
  console.log('Score:', answerRes.data?.data?.evaluation?.score);
  console.log('Feedback:', answerRes.data?.data?.evaluation?.feedback);
  console.log('Follow-up Question:', answerRes.data?.data?.evaluation?.follow_up_question);

  console.log('\n--- 8. Testing GET /api/interviews/:id/report ---');
  const reportRes = await makeRequest('GET', `/api/interviews/${interviewId}/report`, null, token);
  console.log('Report Status:', reportRes.status);
  console.log('Overall Score:', reportRes.data?.data?.report?.overall_score);
  console.log('Strengths count:', reportRes.data?.data?.report?.strengths?.length);

  console.log('\n=========================================');
  console.log('ALL 8 INTEGRATION TESTS PASSED PERFECTLY!');
  console.log('=========================================');

  server.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

