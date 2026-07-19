"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

// The API only returns ISO codes — map the common ones to a readable name
// so the list is scannable without guessing what "AED" means.
const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CNY: "Chinese Yuan",
  JPY: "Japanese Yen",
  INR: "Indian Rupee",
  CHF: "Swiss Franc",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  THB: "Thai Baht",
  TRY: "Turkish Lira",
  ZAR: "South African Rand",
  MYR: "Malaysian Ringgit",
  IDR: "Indonesian Rupiah",
  KRW: "South Korean Won",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  CZK: "Czech Koruna",
  HUF: "Hungarian Forint",
  ILS: "Israeli Shekel",
  PHP: "Philippine Peso",
  BGN: "Bulgarian Lev",
  RON: "Romanian Leu",
  ISK: "Icelandic Krona",
};

type RatesResponse = {
  result: "success" | "error";
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
};

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

  const parsedAmount = Number(amount);
  const validAmount = amount !== "" && !Number.isNaN(parsedAmount) && parsedAmount >= 0;

  const filteredRates = useMemo(() => {
    if (!rates) return [];
    const query = search.trim().toLowerCase();
    return Object.entries(rates)
      .filter(([code]) => {
        if (!query) return true;
        const name = CURRENCY_NAMES[code]?.toLowerCase() ?? "";
        return code.toLowerCase().includes(query) || name.includes(query);
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
                placeholder="e.g. USD or Dollar"
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

        {asOfDate && !loading && !error && (
          <p className="mt-4 text-xs text-muted-foreground">
            Rates as of {asOfDate}, base currency PKR.
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
                          {CURRENCY_NAMES[code] ?? "Currency"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        1 PKR = {rate.toFixed(4)} {code}
                      </p>
                      <p className="font-semibold text-gold">
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
      </section>
    </div>
  );
}
