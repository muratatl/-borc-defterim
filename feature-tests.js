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
test('statement expense taxonomy includes requested categories', () => { for (const c of ['Sağlık','Market','Akaryakıt','Online alışveriş','Giyim','Yeme-içme']) assert(html.includes(`'${c}'`), `missing ${c}`); });
test('expense donut and category detail interaction are wired', () => { assert(html.includes('id="expenseDonut"') && html.includes('data-expense-category=') && html.includes("selectedExpenseCategory=b.dataset.expenseCategory")); });
test('unknown merchants are flagged for review and learned rules are stored locally', () => { assert(html.includes("categoryConfidence==='review'") && html.includes('merchantCategoryRules')); });
test('card statement amount is separate from total used balance', () => { assert(html.includes('card.statementAmount=m.statementAmount')); assert(html.includes('m.availableLimit!==null&&m.limit!==null)card.amount=Math.max(0,Math.round((m.limit-m.availableLimit)*100)/100)')); });
test('manual card availability edit no longer blocked by payment history guard', () => { assert(!html.includes('Bu karta bağlı ödeme geçmişi var. Bakiye tutarını buradan değiştirmek')); assert(html.includes('Kartın kullanılabilir limiti bankadaki güncel duruma göre düzeltilebilir')); });


// Real arithmetic tests for credit-card payment accounting (not string-presence checks).
const cardFns = html.match(/function cardUsedBalance\(card\)\{[\s\S]*?function pay\(type,id\)\{/);
assert(cardFns, 'card accounting helpers not found');
const cardCode = cardFns[0].replace(/function pay\(type,id\)\{[\s\S]*$/, '');
const cardCtx = { Number, Math, Error };
vm.createContext(cardCtx); vm.runInContext(cardCode + '\nthis.used=cardUsedBalance;this.math=cardPaymentMath;', cardCtx);
const sampleCard = {limit:221000, availableLimit:57000, amount:54000, statementAmount:54000};
test('221k limit / 57k available / 61k payment => 103k used and 118k available', () => { const r=cardCtx.math(sampleCard,61000); assert(r.before===164000 && r.after===103000 && r.availableAfter===118000, JSON.stringify(r)); });
test('statement debt is reduced separately from total used balance', () => { const r=cardCtx.math(sampleCard,61000); assert(r.statementAfter===0 && r.after===103000); });
test('actual payment is not truncated to the statement amount', () => { const r=cardCtx.math(sampleCard,61000); assert(r.paid===61000); });
test('legacy card amount is reconciled from limit minus available limit', () => { assert(cardCtx.used({limit:221000,availableLimit:57000,amount:54000})===164000); });
test('without usable limit data, card amount remains fallback balance', () => { assert(cardCtx.used({amount:54000,limit:null,availableLimit:null})===54000); });
test('zero payment is rejected', () => { let ok=false; try { cardCtx.math(sampleCard,0); } catch(e) { ok=true; } assert(ok); });
test('negative payment is rejected', () => { let ok=false; try { cardCtx.math(sampleCard,-1); } catch(e) { ok=true; } assert(ok); });
test('partial payment reduces used balance by exact amount', () => { const r=cardCtx.math(sampleCard,20000); assert(r.after===144000 && r.availableAfter===77000); });
test('payment equal to used balance closes used balance, not card limit', () => { const r=cardCtx.math(sampleCard,164000); assert(r.after===0 && r.availableAfter===221000); });
test('payment above used balance retains actual paid amount and caps available limit', () => { const r=cardCtx.math(sampleCard,170000); assert(r.paid===170000 && r.after===0 && r.availableAfter===221000 && r.creditBalance===6000); });
for (let i=1;i<=20;i++) test(`payment arithmetic invariant case ${i}`, () => { const used=1000+i*137.25,available=500000-used,amount=Math.min(used,Math.round((i*31.17)*100)/100),c={limit:500000,availableLimit:available,amount:999,statementAmount:Math.max(0,amount/2)};const r=cardCtx.math(c,amount);assert(Math.abs(r.before-used)<0.011);assert(Math.abs(r.after-Math.max(0,used-amount))<0.011);assert(Math.abs(r.availableAfter-Math.min(500000,available+amount))<0.011); });



// V8.5: month-based summary engine. It deliberately starts at the first day,
// rather than today, so overdue obligations earlier in the month remain visible.
const monthFns = html.match(/function monthOccurrences\(year,month\)[\s\S]*?function monthPayments\(\)/);
assert(monthFns, 'month summary helpers not found');
const monthCode = monthFns[0].replace(/function monthPayments\(\)[\s\S]*$/, '');
const monthCtx = {
  data: { debts:[], subscriptions:[], payments:[], expenses:[], cards:[] },
  Number, Math, String,
  dateStr: d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
  parseDate: s => s ? new Date(s+'T00:00:00') : null,
  monthDayDate: (day,base) => new Date(base.getFullYear(),base.getMonth(),Math.min(Math.max(Number(day)||1,1),new Date(base.getFullYear(),base.getMonth()+1,0).getDate())),
  adjusted: d => new Date(d),
  addMonthsClamped: (date,months) => new Date(date.getFullYear(),date.getMonth()+months,Math.min(date.getDate(),new Date(date.getFullYear(),date.getMonth()+months+1,0).getDate()))
};
vm.createContext(monthCtx); vm.runInContext(monthCode+'\nthis.summary=monthSummary;this.occ=monthOccurrences;',monthCtx);
test('month engine includes recurring due dates earlier than today in the month', () => { monthCtx.data={debts:[{id:'r1',name:'Kira',recurring:true,day:5,monthly:5000,status:'active'}],subscriptions:[],payments:[],expenses:[],cards:[]}; const r=monthCtx.summary(2026,10); assert(r.plannedDebt===5000 && r.remainingDebt===5000); });
test('partial payments reduce monthly remainder without losing planned amount', () => { monthCtx.data.payments=[{sourceId:'r1',type:'debt',date:'2026-11-02',amount:1000},{sourceId:'r1',type:'debt',date:'2026-11-20',amount:1000}]; const r=monthCtx.summary(2026,10); assert(r.plannedDebt===5000 && r.paidDebt===2000 && r.remainingDebt===3000); });
test('overpayment clamps remaining monthly obligation at zero', () => { monthCtx.data.payments=[{sourceId:'r1',type:'debt',date:'2026-11-02',amount:6000}]; const r=monthCtx.summary(2026,10); assert(r.remainingDebt===0 && r.paidDebt===6000); });
test('one-off debt due early in selected month is included', () => { monthCtx.data={debts:[{id:'o1',name:'Taksit',recurring:false,dueDate:'2026-11-03',amount:7500,remaining:7500,status:'active'}],subscriptions:[],payments:[],expenses:[],cards:[]}; const r=monthCtx.summary(2026,10); assert(r.plannedDebt===7500); });
test('subscription is included only in its actual billing month', () => { monthCtx.data={debts:[],subscriptions:[{id:'s1',name:'Video',amount:300,frequency:'quarterly',nextDate:'2026-10-15',status:'active'}],payments:[],expenses:[],cards:[]}; assert(monthCtx.summary(2026,9).subscriptionsDue===300); assert(monthCtx.summary(2026,10).subscriptionsDue===0); });
test('legacy statement without period key is flagged, not guessed into month total', () => { monthCtx.data={debts:[],subscriptions:[],payments:[],expenses:[],cards:[{id:'c1',status:'active',statementAmount:4200}]}; const r=monthCtx.summary(2026,10); assert(r.unlinkedStatements===1 && r.totalPlanned===0); });
test('new card statement period key avoids legacy unlinked warning', () => { monthCtx.data.cards=[{id:'c1',status:'active',statementAmount:4200,statementPeriodKey:'2026-11'}]; assert(monthCtx.summary(2026,10).unlinkedStatements===0); });
test('linked card statement is included in its actual due month only', () => { monthCtx.data.cards=[{id:'c1',status:'active',statementAmount:4200,statementPeriodKey:'2026-10',statementDueDate:'2026-11-20'}]; assert(monthCtx.summary(2026,10).cardStatementRemaining===4200 && monthCtx.summary(2026,10).totalPlanned===4200); assert(monthCtx.summary(2026,9).cardStatementRemaining===0); });
test('month summary renderer and UI slot are wired', () => { assert(html.includes('function renderMonthSummary()') && html.includes('id="monthSummaryDetail"')); });

for (const [status, name] of checks) console.log(`${status}: ${name}`);
console.log(`\n${checks.filter(x=>x[0]==='PASS').length}/${checks.length} tests passed`);
if (checks.some(x=>x[0]==='FAIL')) process.exit(1);
