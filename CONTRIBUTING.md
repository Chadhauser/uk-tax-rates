# Contributing

## Reporting a wrong figure

This is the most useful contribution you can make. Open an issue with:

- Which figure is wrong
- What it should be
- A link to the GOV.UK, HMRC or IRS page that says so

Rate errors are treated as urgent. If you are right, it will be fixed and
released the same day.

## Adding a rate

Rates live in `rates.json`. Every value needs a public source — GOV.UK, an HMRC
publication, a statutory instrument, or the IRS. Please include the link in
your pull request.

Please do not add:

- Estimated or forecast rates that have not been announced
- Rates from secondary sources without checking the primary
- Anything you have not verified yourself

## Adding a function

Functions live in `index.js` and must:

1. Have no dependencies
2. Work on Node 14 and above
3. Have a test in `test.js` with a worked example from a published source
4. Have a TypeScript declaration in `index.d.ts`

Run `node test.js` before opening a pull request. All tests must pass.

## The awkward cases

If you are adding a calculation, please handle these properly rather than
approximating:

- **The personal allowance taper** above £100,000 — £1 lost for every £2 earned
- **Dividends stack on top of other income**, so the band depends on salary
- **Corporation tax marginal relief** uses the 3/200 fraction
- **Stamp duty first-time buyer relief** is lost entirely above £500,000, not tapered
- **The residence nil-rate band tapers** above a £2m estate
- **Redundancy age bands** are worked out per year of service, not on current age alone

Getting these wrong is why most tax libraries are unreliable.

## Licence

By contributing you agree your work is licensed CC BY 4.0.
