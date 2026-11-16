const fs = require('fs');
const c = fs.readFileSync('src/app/dashboard/customer/page.jsx', 'utf8');
console.log('BOM:', c.charCodeAt(0) === 0xFEFF);
console.log('NULL:', c.includes(String.fromCharCode(0)));
var n = [];
c.split('\n').forEach(function(l, i) {
  if (l.indexOf(String.fromCharCode(160)) !== -1) n.push(i + 1);
});
console.log('NBSP lines:', n);
console.log('CRLF count:', (c.match(/\r\n/g) || []).length);
console.log('Total length:', c.length);
console.log('Lines:', c.split('\n').length);
