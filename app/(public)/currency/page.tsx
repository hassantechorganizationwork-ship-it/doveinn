"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import currencyCodes from "currency-codes";
import { format } from "date-fns";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_CURRENCY = "PKR";
// Frankfurter (ECB-based) doesn't support PKR as a base or target currency
// at all, so we use open.er-api.com instead — also free, no key required,
// and it does carry PKR.
const RATES_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;

// A handful of pseudo-/retired-currency codes that open.er-api.com returns
// but the ISO 4217 `currency-codes` package doesn't recognize — regional
// currencies that peg to another territory's currency, or superseded codes.
// Also covers cases where the package's official ISO short name omits the
// country (e.g. "Lek" instead of "Albanian Lek"), for a more scannable card.
const NAME_OVERRIDES: Record<string, string> = {
  AFN: "Afghan Afghani",
  ALL: "Albanian Lek",
  AOA: "Angolan Kwanza",
  AZN: "Azerbaijani Manat",
  BAM: "Bosnia-Herzegovina Convertible Mark",
  BDT: "Bangladeshi Taka",
  BOB: "Bolivian Boliviano",
  BTN: "Bhutanese Ngultrum",
  BWP: "Botswana Pula",
  CLF: "Chilean Unit of Account (UF)",
  CNH: "Offshore Chinese Yuan",
  CNY: "Chinese Yuan",
  ERN: "Eritrean Nakfa",
  FOK: "Faroese Króna",
  GBP: "British Pound Sterling",
  GEL: "Georgian Lari",
  GGP: "Guernsey Pound",
  GMD: "Gambian Dalasi",
  GTQ: "Guatemalan Quetzal",
  HNL: "Honduran Lempira",
  HRK: "Croatian Kuna (retired)",
  HTG: "Haitian Gourde",
  HUF: "Hungarian Forint",
  ILS: "Israeli New Shekel",
  IMP: "Isle of Man Pound",
  ISK: "Icelandic Króna",
  JEP: "Jersey Pound",
  JPY: "Japanese Yen",
  KGS: "Kyrgyzstani Som",
  KHR: "Cambodian Riel",
  KID: "Kiribati Dollar",
  KMF: "Comorian Franc",
  KRW: "South Korean Won",
  KZT: "Kazakhstani Tenge",
  LSL: "Lesotho Loti",
  MKD: "Macedonian Denar",
  MMK: "Myanmar Kyat",
  MNT: "Mongolian Tugrik",
  MOP: "Macanese Pataca",
  MRU: "Mauritanian Ouguiya",
  MVR: "Maldivian Rufiyaa",
  NGN: "Nigerian Naira",
  NIO: "Nicaraguan Córdoba",
  OMR: "Omani Rial",
  PAB: "Panamanian Balboa",
  PEN: "Peruvian Sol",
  PGK: "Papua New Guinean Kina",
  PLN: "Polish Zloty",
  PYG: "Paraguayan Guarani",
  SLE: "Sierra Leonean Leone",
  SLL: "Sierra Leonean Leone (old)",
  STN: "São Tomé & Príncipe Dobra",
  SZL: "Swazi Lilangeni",
  THB: "Thai Baht",
  TJS: "Tajikistani Somoni",
  TOP: "Tongan Paʻanga",
  TVD: "Tuvaluan Dollar",
  UAH: "Ukrainian Hryvnia",
  VES: "Venezuelan Bolívar",
  VND: "Vietnamese Dong",
  WST: "Samoan Tala",
  XCG: "Caribbean Guilder",
  ZAR: "South African Rand",
  ZWL: "Zimbabwean Dollar (old)",
};

function currencyName(code: string): string {
  if (NAME_OVERRIDES[code]) return NAME_OVERRIDES[code];
  return currencyCodes.code(code)?.currency ?? code;
}

// Smaller, hand-picked list of search aliases for the currencies most
// relevant to Pakistani hotel guests (Gulf states, US/UK/EU, nearby Asia).
// Doesn't need to cover all 160+ codes — just common nicknames people
// actually type, on top of the code/name match every currency already gets.
const SEARCH_ALIASES: Record<string, string[]> = {
  USD: ["usd", "dollar", "us dollar", "usa", "america", "united states"],
  GBP: ["gbp", "pound", "british pound", "sterling", "uk", "britain", "england"],
  EUR: ["eur", "euro", "europe", "eurozone"],
  SAR: ["sar", "riyal", "saudi riyal", "saudi arabia", "ksa", "saudi"],
  AED: ["aed", "dirham", "uae", "emirates", "dubai", "abu dhabi"],
  QAR: ["qar", "riyal", "qatari riyal", "qatar", "doha"],
  KWD: ["kwd", "dinar", "kuwaiti dinar", "kuwait"],
  OMR: ["omr", "rial", "omani rial", "oman", "muscat"],
  BHD: ["bhd", "dinar", "bahraini dinar", "bahrain", "manama"],
  CNY: ["cny", "yuan", "chinese yuan", "china", "renminbi", "rmb"],
  JPY: ["jpy", "yen", "japanese yen", "japan"],
  CAD: ["cad", "canadian dollar", "canada"],
  AUD: ["aud", "australian dollar", "australia"],
  CHF: ["chf", "swiss franc", "switzerland"],
  TRY: ["try", "lira", "turkish lira", "turkey"],
  MYR: ["myr", "ringgit", "malaysian ringgit", "malaysia"],
  THB: ["thb", "baht", "thai baht", "thailand"],
  SGD: ["sgd", "singapore dollar", "singapore"],
  HKD: ["hkd", "hong kong dollar", "hong kong"],
  INR: ["inr", "rupee", "indian rupee", "india"],
  NZD: ["nzd", "new zealand dollar", "new zealand"],
};

function matchesSearch(code: string, name: string, query: string): boolean {
  if (code.toLowerCase().includes(query)) return true;
  if (name.toLowerCase().includes(query)) return true;
  const aliases = SEARCH_ALIASES[code];
  if (!aliases) return false;
  return aliases.some((alias) => alias.includes(query));
}

type RatesResponse = {
  result: "success" | "error";
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
};

// The API's timestamp is UTC (e.g. "Sun, 19 Jul 2026 00:02:31 +0000"). Pakistan
// Standard Time is a fixed UTC+5 offset with no DST, so we resolve it via the
// IANA "Asia/Karachi" zone (correct by definition, not a hardcoded +5) and
// hand the resolved wall-clock fields to date-fns for the actual formatting.
function formatPktTimestamp(utcString: string): string {
  const utcDate = new Date(utcString);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(utcDate);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  // Construct a Date whose LOCAL getters equal the PKT wall-clock time, so
  // date-fns' format() (which reads local getters) prints the right value
  // regardless of the viewer's own browser timezone.
  const pktAsLocal = new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute")
  );

  return `${format(pktAsLocal, "d MMM yyyy, h:mm a")} (PKT)`;
}

export default function CurrencyPage() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [asOfDate, setAsOfDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("7000");

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(RATES_URL);
      if (!res.ok) throw new Error("Bad response");
      const data: RatesResponse = await res.json();
      if (data.result !== "success") throw new Error("API returned an error");
      const { [BASE_CURRENCY]: _base, ...otherRates } = data.rates;
      setRates(otherRates);
      setAsOfDate(data.time_last_update_utc);
    } catch {
      setError(true);
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Dev-only: forces the same error state a real fetch failure produces, so
  // it can be triggered on demand for a demo recording without needing to
  // fake a network failure. `NODE_ENV === "development"` is inlined at build
  // time, so this whole branch (and the button below) is dead code that gets
  // stripped out of the production bundle — it never ships.
  const simulateError = useCallback(() => {
    setLoading(false);
    setError(true);
    setRates(null);
  }, []);

  const parsedAmount = Number(amount);
  const validAmount = amount !== "" && !Number.isNaN(parsedAmount) && parsedAmount >= 0;

  const filteredRates = useMemo(() => {
    if (!rates) return [];
    const query = search.trim().toLowerCase();
    return Object.entries(rates)
      .filter(([code]) => {
        if (!query) return true;
        return matchesSearch(code, currencyName(code), query);
      })
      .sort(([a], [b]) => a.localeCompare(b));
  }, [rates, search]);

  return (
    <div>
      {/* PAGE HEADER */}
      <section className="-mt-20 bg-primary pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-heading text-3xl text-primary-foreground sm:text-4xl md:text-5xl">
            Currency Converter
          </h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <span>/</span>
            <span className="text-gold">Currency</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <p className="max-w-2xl text-muted-foreground">
          Check today&apos;s exchange rates against the Pakistani Rupee and see
          what a Dove Inn room costs in your home currency.
        </p>

        {/* CONTROLS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currency-search">Search currency</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="currency-search"
                placeholder="e.g. USD, dollar, america"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkr-amount">Amount in PKR</Label>
            <Input
              id="pkr-amount"
              type="number"
              min="0"
              inputMode="decimal"
              placeholder="7000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {process.env.NODE_ENV === "development" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={simulateError}
            className="mt-4 border-destructive text-destructive hover:bg-destructive/10"
          >
            Simulate API failure (dev only)
          </Button>
        )}

        {asOfDate && !loading && !error && (
          <p className="mt-4 text-xs text-muted-foreground">
            Rates last updated: {formatPktTimestamp(asOfDate)}
          </p>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
            <p className="text-muted-foreground">
              Couldn&apos;t load exchange rates right now. Please try again.
            </p>
            <Button
              onClick={fetchRates}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        )}

        {/* SUCCESS STATE */}
        {!loading && !error && (
          <>
            {filteredRates.length === 0 ? (
              <p className="mt-12 text-center text-muted-foreground">
                No currencies match &quot;{search}&quot;.
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRates.map(([code, rate]) => (
                  <Card key={code} className="border-none shadow-sm">
                    <CardContent className="flex flex-col gap-2 p-5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-heading text-xl font-bold text-primary">
                          {code}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {currencyName(code)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        1 PKR = {rate.toFixed(4)} {code}
                      </p>
                      <p className="font-semibold text-gold-text">
                        {validAmount
                          ? `${amount} PKR ≈ ${(parsedAmount * rate).toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 }
                            )} ${code}`
                          : "Enter a valid amount above"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Exchange rate data provided by{" "}
          <a
            href="https://www.exchangerate-api.com/docs/free"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gold"
          >
            open.er-api.com
          </a>
        </p>
      </section>
    </div>
  );
}
