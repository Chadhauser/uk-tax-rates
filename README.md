# uk-tax-rates

[![npm](https://img.shields.io/npm/v/uk-tax-rates.svg)](https://www.npmjs.com/package/uk-tax-rates)
[![tests](https://github.com/Chadhauser/uk-tax-rates/actions/workflows/test.yml/badge.svg)](https://github.com/Chadhauser/uk-tax-rates/actions)
[![licence](https://img.shields.io/badge/licence-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)

Current UK and US tax rates, allowances and thresholds. No dependencies, no
network calls, works offline.

Maintained by a chartered management accountant, because we use it in our own
calculators.

```bash
npm install uk-tax-rates
```

## Quick use

```js
const tax = require('uk-tax-rates');

tax.incomeTax(45000).tax;              // 6486
tax.employeeNI(45000);                 // 2594.4
tax.corporationTax(120000).tax;        // 28050
tax.stampDuty(350000).tax;             // 7500
tax.dividendTax(12570, 40000).tax;     // 4821.25
tax.redundancyPay(45, 10, 600).payment // 7200
```

Or read the raw figures:

```js
tax.uk.income_tax.personal_allowance;  // 12570
tax.uk.dividends.higher_rate;          // 0.3575
tax.uk.vat.registration_threshold;     // 90000
tax.uk.redundancy.weekly_pay_cap;      // 751
```

## What it covers

**UK, 2026/27** — income tax including the £100,000 taper, Scottish income tax
across all six bands, employee, employer and self-employed Class 4 National
Insurance, dividends, capital gains, corporation tax with marginal relief,
inheritance tax including the residence band and taper, VAT, stamp duty with
first-time buyer relief and the additional property surcharge, ISA and pension
allowances, student loans across all five plans, statutory redundancy pay,
director's loan S455 rates, and HMRC interest rates.

**US, 2026** — 401(k) and IRA contribution limits, long-term capital gains
brackets for all filing statuses, the net investment income tax, and standard
deductions.

## Functions

| Function | Returns |
|---|---|
| `personalAllowance(totalIncome)` | Allowance after the £100,000 taper |
| `incomeTax(salary)` | `{ tax, personalAllowance, bands }` |
| `scottishIncomeTax(salary)` | `{ tax, personalAllowance, bands }` |
| `employeeNI(salary)` | Number |
| `employerNI(salary)` | Number |
| `selfEmployedNI(profit)` | Class 4, number |
| `dividendTax(otherIncome, dividends)` | `{ tax, taxFree, bands }` |
| `corporationTax(profit)` | `{ tax, band }` |
| `capitalGainsTax(gain, otherIncome)` | `{ tax, taxableGain, bands }` |
| `stampDuty(price, options)` | `{ tax, effectiveRate }` |
| `inheritanceTax(estate, options)` | `{ tax, allowance, taxableEstate }` |
| `vat(amount, options)` | `{ net, vat, gross }` |
| `studentLoan(salary, plan, options)` | `{ total, undergraduate, postgraduate, threshold }` |
| `redundancyPay(age, years, weeklyPay)` | `{ payment, weeks, qualifies, capped, bands }` |

### Options

```js
tax.stampDuty(350000, { firstTimeBuyer: true });
tax.stampDuty(350000, { additionalProperty: true });

tax.inheritanceTax(800000, { homeToDescendants: true, transferableBands: true });

tax.vat(1200, { inclusive: true });        // work backwards from a gross figure
tax.vat(1000, { rate: 0.05 });             // reduced rate

tax.studentLoan(35000, 2, { postgraduate: true });
```

## The awkward bits, handled

**Dividends stack on top of other income**, so the band they fall into depends
on your salary. `dividendTax` takes both.

**The personal allowance tapers** by £1 for every £2 above £100,000, which
creates the 60% effective marginal rate. Handled everywhere it applies.

**Corporation tax marginal relief** between £50,000 and £250,000 uses the 3/200
fraction, giving a 26.5% marginal rate.

**Stamp duty first-time buyer relief** is lost entirely above £500,000, not
tapered.

**The residence nil-rate band tapers** above a £2m estate.

**Redundancy pay uses age bands** — half a week per year under 22, one week
from 22 to 40, one and a half weeks at 41 and over, with pay capped at £751 and
service capped at 20 years.

## TypeScript

Types are included. No `@types` package needed.

## Accuracy

Every figure is checked against GOV.UK, HMRC, statutory instruments or the IRS.
The test suite covers 29 cases including the edge conditions above and worked
examples taken from published sources.

That said, **verify anything you rely on in production**. Tax is
circumstance-specific and this library does not know about your particular
situation. If you find an error, please open an issue.

## Why this exists

Every UK payroll tool, invoicing app and finance spreadsheet needs the same
handful of numbers, and there was no maintained free source for them. GOV.UK
publishes them across dozens of pages in prose.

We built this because we needed it ourselves for
[our own calculators](https://financeclearly.com/uk-calculators/), and keeping
it public costs us nothing extra.

## Updates

Rates change in April, and occasionally mid-year. Minor version bumps carry
rate changes; patch versions are fixes.

## Contributing

Found a wrong figure? [Open an issue](https://github.com/Chadhauser/uk-tax-rates/issues).
Rate errors are treated as urgent. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Also available as an API

If you would rather fetch than bundle, the same data is at
[financeclearly.com/api/uk-tax-rates.json](https://financeclearly.com/api/uk-tax-rates.json),
documented [here](https://financeclearly.com/tax-rates-api/). No key, no signup.

## Licence

CC BY 4.0. Free to use, including commercially, with attribution.

Data and library by [Finance Clearly](https://financeclearly.com).
