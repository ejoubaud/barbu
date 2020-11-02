const { spawn } = require('child_process');

let server;

module.exports = {
  before: (done) => {
    server = spawn('npm', ['start'], {
      env: {
        ...process.env,
        PORT: 3001,
        BROWSER: 'none',
      }
    });
    done();
  },

  after: (done) => {
    server.kill();
    done();
  },
}
