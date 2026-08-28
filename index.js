'use strict';

const rates = require('./rates.json');

const UK = rates.uk;
const US = rates.us;

/** Personal allowance after the £100,000 taper. */
function personalAllowance(totalIncome) {
  const { personal_allowance: pa, taper_threshold: t } = UK.income_tax;
  if (totalIncome <= t) return pa;
  return Math.max(0, pa - Math.floor((totalIncome - t) / 2));
}

/** Income tax for England, Wales and Northern Ireland. */
function incomeTax(salary) {
  const pa = personalAllowance(salary);
  const [basic, higher, additional] = UK.income_tax.bands;
  const taxable = Math.max(0, salary - pa);
  const inBasic = Math.min(taxable, Math.max(0, basic.upper - pa));
  const inHigher = Math.min(taxable - inBasic, Math.max(0, higher.upper - pa - inBasic));
  const inAdditional = Math.max(0, taxable - inBasic - inHigher);
  return {
    tax: inBasic * basic.rate + inHigher * higher.rate + inAdditional * additional.rate,
    personalAllowance: pa,
    bands: { basic: inBasic, higher: inHigher, additional: inAdditional }
  };
}

/** Scottish income tax, all six bands. */
function scottishIncomeTax(salary) {
  const pa = personalAllowance(salary);
  let remaining = Math.max(0, salary - pa);
  let previousUpper = pa;
  let tax = 0;
  const detail = {};
  for (const band of UK.scottish_income_tax.bands) {
    if (remaining <= 0) break;
    const width = band.upper === null ? Infinity : band.upper - previousUpper;
    const inBand = Math.min(remaining, width);
    tax += inBand * band.rate;
    detail[band.name] = inBand;
    remaining -= inBand;
    previousUpper = band.upper;
  }
  return { tax, personalAllowance: pa, bands: detail };
}

/** Employee National Insurance. */
function employeeNI(salary) {
  const ni = UK.national_insurance.employee;
  const main = Math.min(Math.max(0, salary - ni.primary_threshold),
                        ni.upper_earnings_limit - ni.primary_threshold) * ni.main_rate;
  const upper = Math.max(0, salary - ni.upper_earnings_limit) * ni.upper_rate;
  return main + upper;
}

/** Employer National Insurance. */
function employerNI(salary) {
  const ni = UK.national_insurance.employer;
  return Math.max(0, salary - ni.secondary_threshold) * ni.rate;
}

/** Class 4 National Insurance for the self-employed. */
function selfEmployedNI(profit) {
  const ni = UK.national_insurance.self_employed_class_4;
  const main = Math.min(Math.max(0, profit - ni.lower_profits_limit),
                        ni.upper_profits_limit - ni.lower_profits_limit) * ni.main_rate;
  const upper = Math.max(0, profit - ni.upper_profits_limit) * ni.upper_rate;
  return main + upper;
}

/** Dividend tax, stacked on top of other income. */
function dividendTax(otherIncome, dividends) {
  const d = UK.dividends;
  const pa = personalAllowance(otherIncome + dividends);
  const paLeft = Math.max(0, pa - Math.min(otherIncome, pa));
  const coveredByPA = Math.min(dividends, paLeft);
  const remaining = dividends - coveredByPA;
  const allowanceUsed = Math.min(remaining, d.allowance);
  const taxable = remaining - allowanceUsed;

  const position = Math.max(0, otherIncome - Math.min(otherIncome, pa)) + allowanceUsed;
  const [basic, higher] = UK.income_tax.bands;
  const basicRoom = Math.max(0, (basic.upper - pa) - position);
  const higherRoom = Math.max(0, (higher.upper - pa) - Math.max(position, basic.upper - pa));

  const atBasic = Math.min(taxable, basicRoom);
  const atHigher = Math.min(taxable - atBasic, higherRoom);
  const atAdditional = Math.max(0, taxable - atBasic - atHigher);

  return {
    tax: atBasic * d.basic_rate + atHigher * d.higher_rate + atAdditional * d.additional_rate,
    taxFree: coveredByPA + allowanceUsed,
    bands: { basic: atBasic, higher: atHigher, additional: atAdditional }
  };
}

/** Corporation tax with marginal relief. */
function corporationTax(profit) {
  const c = UK.corporation_tax;
  if (profit <= c.small_profits_upper) {
    return { tax: profit * c.small_profits_rate, band: 'small profits' };
  }
  if (profit >= c.main_rate_lower) {
    return { tax: profit * c.main_rate, band: 'main rate' };
  }
  return {
    tax: profit * c.main_rate - c.marginal_relief_fraction * (c.main_rate_lower - profit),
    band: 'marginal relief'
  };
}

/** Capital gains tax. */
function capitalGainsTax(gain, otherIncome) {
  const cg = UK.capital_gains;
  const taxable = Math.max(0, gain - cg.annual_exempt_amount);
  const pa = personalAllowance(otherIncome + gain);
  const basicRoom = Math.max(0, (UK.income_tax.bands[0].upper - pa) - Math.max(0, otherIncome - pa));
  const atBasic = Math.min(taxable, basicRoom);
  const atHigher = taxable - atBasic;
  return {
    tax: atBasic * cg.basic_rate + atHigher * cg.higher_rate,
    taxableGain: taxable,
    bands: { basic: atBasic, higher: atHigher }
  };
}

/** Stamp duty for England and Northern Ireland. */
function stampDuty(price, options = {}) {
  const { firstTimeBuyer = false, additionalProperty = false } = options;
  const s = UK.stamp_duty_sdlt;
  const surcharge = additionalProperty ? s.additional_property_surcharge : 0;

  let bands;
  if (firstTimeBuyer && price <= s.first_time_buyer.relief_cap) {
    bands = [
      { upper: s.first_time_buyer.nil_rate_upper, rate: 0 },
      { upper: s.first_time_buyer.relief_cap, rate: s.first_time_buyer.rate_above_nil }
    ];
  } else {
    bands = s.standard_bands;
  }

  let tax = 0;
  let previous = 0;
  for (const band of bands) {
    const cap = band.upper === null ? Infinity : band.upper;
    const slice = Math.max(0, Math.min(price, cap) - previous);
    tax += slice * (band.rate + surcharge);
    previous = cap;
    if (price <= cap) break;
  }
  if (price > previous) tax += (price - previous) * surcharge;
  return { tax, effectiveRate: price > 0 ? tax / price : 0 };
}

/** Inheritance tax. */
function inheritanceTax(estate, options = {}) {
  const { homeToDescendants = false, transferableBands = false } = options;
  const iht = UK.inheritance_tax;
  const multiplier = transferableBands ? 2 : 1;
  const nrb = iht.nil_rate_band * multiplier;
  let rnrb = homeToDescendants ? iht.residence_nil_rate_band * multiplier : 0;
  if (estate > iht.taper_threshold) {
    rnrb = Math.max(0, rnrb - Math.floor((estate - iht.taper_threshold) / 2));
  }
  const allowance = nrb + rnrb;
  const taxable = Math.max(0, estate - allowance);
  return { tax: taxable * iht.rate, allowance, taxableEstate: taxable };
}

/** VAT. */
function vat(amount, options = {}) {
  const { rate = UK.vat.standard_rate, inclusive = false } = options;
  if (inclusive) {
    const net = amount / (1 + rate);
    return { net, vat: amount - net, gross: amount };
  }
  return { net: amount, vat: amount * rate, gross: amount * (1 + rate) };
}

/** Student loan repayments. */
function studentLoan(salary, plan, options = {}) {
  const { postgraduate = false } = options;
  const key = String(plan).startsWith('plan_') ? String(plan) : `plan_${plan}`;
  const p = UK.student_loans[key];
  if (!p) throw new Error(`Unknown plan: ${plan}. Use 1, 2, 4 or 5.`);
  const main = Math.max(0, salary - p.threshold) * p.rate;
  const pg = postgraduate
    ? Math.max(0, salary - UK.student_loans.postgraduate.threshold) * UK.student_loans.postgraduate.rate
    : 0;
  return { total: main + pg, undergraduate: main, postgraduate: pg, threshold: p.threshold };
}

/** Statutory redundancy pay. */
function redundancyPay(age, yearsOfService, weeklyPay) {
  const r = UK.redundancy;
  const years = Math.min(yearsOfService, r.service_cap_years);
  const startAge = age - years;
  const pay = Math.min(weeklyPay, r.weekly_pay_cap);

  const under22 = Math.max(0, Math.min(age, 22) - Math.max(startAge, 0));
  const middle = Math.max(0, Math.min(age, 41) - Math.max(startAge, 22));
  const over41 = Math.max(0, age - Math.max(startAge, 41));

  const weeks = under22 * 0.5 + middle * 1.0 + over41 * 1.5;
  return {
    payment: weeks * pay,
    weeks,
    qualifies: yearsOfService >= r.minimum_service_years,
    weeklyPayUsed: pay,
    capped: weeklyPay > r.weekly_pay_cap,
    bands: { under22, middle, over41 }
  };
}

module.exports = {
  rates,
  uk: UK,
  us: US,
  personalAllowance,
  incomeTax,
  scottishIncomeTax,
  employeeNI,
  employerNI,
  selfEmployedNI,
  dividendTax,
  corporationTax,
  capitalGainsTax,
  stampDuty,
  inheritanceTax,
  vat,
  studentLoan,
  redundancyPay
};
