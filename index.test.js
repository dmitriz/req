const test = require('ava');
const http = require('http');
const req = require('./index');

const createServer = () => {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url === '/success') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } else if (req.url === '/error') {
        res.writeHead(500);
        res.end();
      }
    });
    
    server.listen(0, () => {
      resolve({
        server,
        port: server.address().port
      });
    });
  });
};

test.beforeEach(async t => {
  const { server, port } = await createServer();
  t.context.server = server;
  t.context.port = port;
});

test.afterEach.always(t => {
  t.context.server.close();
});

test('handles successful request', async t => {
  const request = {
    url: `http://localhost:${t.context.port}/success`,
    method: 'get'
  };

  const response = await req(request)(
    res => {
      t.deepEqual(res.data, { status: 'ok' });
      return res;
    },
    err => t.fail(err.message)
  );

  t.deepEqual(response.data, { status: 'ok' });
});

test('handles failed request', async t => {
  const request = {
    url: `http://localhost:${t.context.port}/error`,
    method: 'get'
  };

  await t.throwsAsync(async () => {
    await req(request)(
      () => t.fail('should not succeed'),
      err => {
        t.is(err.response.status, 500);
        throw err;
      }
    );
  });
});
