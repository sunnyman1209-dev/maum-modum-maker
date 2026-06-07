const os = require('node:os');

os.userInfo = () => ({
  uid: -1,
  gid: -1,
  username: 'vercel-user',
  homedir: os.homedir(),
  shell: null,
});

os.hostname = () => 'localhost';

process.env.USERNAME = 'vercel-user';
process.env.USER = 'vercel-user';
process.env.COMPUTERNAME = 'localhost';
