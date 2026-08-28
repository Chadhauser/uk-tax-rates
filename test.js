const t = require('./index.js');
let pass = 0, fail = 0;

function eq(label, actual, expected, tol = 1) {
  const ok = Math.abs(actual - expected) <= tol;
  if (ok) { pass++; console.log(`  PASS  ${label}: ${Math.round(actual)}`); }
  else { fail++; console.log(`  FAIL  ${label}: got ${Math.round(actual)}, expected ${expected}`); }
}

console.log('\nIncome tax');
eq('30,000', t.incomeTax(30000).tax, 3486);
eq('60,000', t.incomeTax(60000).tax, 11432);
eq('PA at 110,000 (tapered)', t.incomeTax(110000).personalAllowance, 7570);
eq('PA at 125,140 (gone)', t.incomeTax(125140).personalAllowance, 0);

console.log('\nEmployee NI');
eq('30,000', t.employeeNI(30000), 1394);
eq('60,000', t.employeeNI(60000), 3211);

console.log('\nEmployer NI');
eq('35,000', t.employerNI(35000), 4500);

console.log('\nSelf-employed Class 4');
eq('45,000', t.selfEmployedNI(45000), 1946);
eq('60,000', t.selfEmployedNI(60000), 2456);

console.log('\nDividends');
eq('12,570 salary + 10,000 div', t.dividendTax(12570, 10000).tax, 1021);
eq('0 salary + 20,000 div', t.dividendTax(0, 20000).tax, 745);
eq('50,270 salary + 10,000 div', t.dividendTax(50270, 10000).tax, 3396);

console.log('\nCorporation tax');
eq('40,000 small profits', t.corporationTax(40000).tax, 7600);
eq('100,000 marginal relief', t.corporationTax(100000).tax, 22750);
eq('300,000 main rate', t.corporationTax(300000).tax, 75000);

console.log('\nStamp duty');
eq('350,000 standard', t.stampDuty(350000).tax, 7500);
eq('350,000 first-time buyer', t.stampDuty(350000, { firstTimeBuyer: true }).tax, 2500);
eq('350,000 additional property', t.stampDuty(350000, { additionalProperty: true }).tax, 25000);

console.log('\nInheritance tax');
eq('800k with residence band', t.inheritanceTax(800000, { homeToDescendants: true }).tax, 120000);
eq('400k no residence band', t.inheritanceTax(400000).tax, 30000);

console.log('\nVAT');
eq('1,000 plus VAT', t.vat(1000).vat, 200);
eq('1,200 inclusive', t.vat(1200, { inclusive: true }).vat, 200);

console.log('\nStudent loans');
eq('35,000 plan 2', t.studentLoan(35000, 2).total, 505);
eq('35,000 plan 1', t.studentLoan(35000, 1).total, 729);

console.log('\nScottish income tax');
eq('45,000', t.scottishIncomeTax(45000).tax, 6882, 5);

console.log('\nCapital gains');
eq('30k gain, 40k income', t.capitalGainsTax(30000, 40000).tax, 5864, 5);

console.log('\nRedundancy (worked examples from published sources)');
eq('35yo, 8yrs, 550/wk', t.redundancyPay(35, 8, 550).payment, 4400);
eq('25yo, 4yrs, 480/wk', t.redundancyPay(25, 4, 480).payment, 1680);
eq('statutory maximum', t.redundancyPay(61, 20, 900).payment, 22530);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
