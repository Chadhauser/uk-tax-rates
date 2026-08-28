declare module 'uk-tax-rates' {
  export interface BandBreakdown {
    basic: number;
    higher: number;
    additional: number;
  }

  export interface IncomeTaxResult {
    tax: number;
    personalAllowance: number;
    bands: BandBreakdown;
  }

  export interface ScottishResult {
    tax: number;
    personalAllowance: number;
    bands: Record<string, number>;
  }

  export interface DividendResult {
    tax: number;
    taxFree: number;
    bands: BandBreakdown;
  }

  export interface CorporationTaxResult {
    tax: number;
    band: 'small profits' | 'main rate' | 'marginal relief';
  }

  export interface CapitalGainsResult {
    tax: number;
    taxableGain: number;
    bands: { basic: number; higher: number };
  }

  export interface StampDutyResult {
    tax: number;
    effectiveRate: number;
  }

  export interface InheritanceTaxResult {
    tax: number;
    allowance: number;
    taxableEstate: number;
  }

  export interface VatResult {
    net: number;
    vat: number;
    gross: number;
  }

  export interface StudentLoanResult {
    total: number;
    undergraduate: number;
    postgraduate: number;
    threshold: number;
  }

  export interface RedundancyResult {
    payment: number;
    weeks: number;
    qualifies: boolean;
    weeklyPayUsed: number;
    capped: boolean;
    bands: { under22: number; middle: number; over41: number };
  }

  export const rates: Record<string, any>;
  export const uk: Record<string, any>;
  export const us: Record<string, any>;

  export function personalAllowance(totalIncome: number): number;
  export function incomeTax(salary: number): IncomeTaxResult;
  export function scottishIncomeTax(salary: number): ScottishResult;
  export function employeeNI(salary: number): number;
  export function employerNI(salary: number): number;
  export function selfEmployedNI(profit: number): number;
  export function dividendTax(otherIncome: number, dividends: number): DividendResult;
  export function corporationTax(profit: number): CorporationTaxResult;
  export function capitalGainsTax(gain: number, otherIncome: number): CapitalGainsResult;
  export function stampDuty(
    price: number,
    options?: { firstTimeBuyer?: boolean; additionalProperty?: boolean }
  ): StampDutyResult;
  export function inheritanceTax(
    estate: number,
    options?: { homeToDescendants?: boolean; transferableBands?: boolean }
  ): InheritanceTaxResult;
  export function vat(
    amount: number,
    options?: { rate?: number; inclusive?: boolean }
  ): VatResult;
  export function studentLoan(
    salary: number,
    plan: 1 | 2 | 4 | 5,
    options?: { postgraduate?: boolean }
  ): StudentLoanResult;
  export function redundancyPay(
    age: number,
    yearsOfService: number,
    weeklyPay: number
  ): RedundancyResult;
}
