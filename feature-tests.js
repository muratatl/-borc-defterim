const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const checks = [];
function test(name, fn) { try { fn(); checks.push(['PASS', name]); } catch (e) { checks.push(['FAIL', name + ': ' + e.message]); } }
function assert(x, msg) { if (!x) throw new Error(msg || 'assertion failed'); }

// Extract the pure calendar status helper and run it with representative local data.
const match = html.match(/function calendarPaymentStatus\(p\)\{[\s\S]*?\nfunction paymentCard/);
assert(match, 'calendarPaymentStatus helper not found');
const helper = match[0].replace(/\nfunction paymentCard[\s\S]*$/, '');
const ctx = {
  data: { payments: [] },
  parseDate: s => { const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); },
  money: n => String(n),
  Number, String, Math
};
vm.createContext(ctx); vm.runInContext(helper + '\nthis.statusFn=calendarPaymentStatus;', ctx);
const occurrence = { type:'debt', sourceId:'rent-or-debt-1', amount:5000, date:'2026-11-28' };
test('no payment => pending', () => { ctx.data.payments=[]; assert(ctx.statusFn(occurrence).state==='pending'); });
test('partial payments summed within same month', () => { ctx.data.payments=[{sourceId:'rent-or-debt-1',type:'debt',date:'2026-11-02',amount:1000},{sourceId:'rent-or-debt-1',type:'debt',date:'2026-11-20',amount:1500}]; const r=ctx.statusFn(occurrence); assert(r.state==='partial' && r.paid===2500); });
test('full monthly payment => paid', () => { ctx.data.payments=[{sourceId:'rent-or-debt-1',type:'debt',date:'2026-11-02',amount:2500},{sourceId:'rent-or-debt-1',type:'debt',date:'2026-11-20',amount:2500}]; assert(ctx.statusFn(occurrence).state==='paid'); });
test('other month and card payments do not count', () => { ctx.data.payments=[{sourceId:'rent-or-debt-1',type:'debt',date:'2026-10-30',amount:5000},{sourceId:'rent-or-debt-1',type:'card',date:'2026-11-20',amount:5000}]; assert(ctx.statusFn(occurrence).state==='pending'); });
test('calendar renders status classes and legend', () => { assert(html.includes('day.paid') && html.includes('day.partial') && html.includes('day.pending')); assert(html.includes('Ödendi</span>') && html.includes('Kısmen ödendi</span>') && html.includes('Bekliyor</span>')); });
test('debt categories are selectable and detail panel is rendered', () => { assert(html.includes('data-debt-category=') && html.includes('pie-detail')); assert(html.includes("selectedDebtCategory=b.dataset.debtCategory")); });
test('rent remains excluded from debt composition', () => { assert(html.includes("data.debts.filter(d=>d.status!=='paid'&&!isRecurringRent(d))")); });
for (const [status, name] of checks) console.log(`${status}: ${name}`);
console.log(`\n${checks.filter(x=>x[0]==='PASS').length}/${checks.length} tests passed`);
if (checks.some(x=>x[0]==='FAIL')) process.exit(1);
