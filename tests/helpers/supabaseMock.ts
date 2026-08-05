import { vi } from "vitest";

type QueryResult = { data: unknown; error: unknown; count?: number | null };

// Supabase's query builder is chainable (.select().eq()...) AND awaitable
// directly (it's a thenable) — most methods just return `this`, while the
// object itself resolves to { data, error } when awaited, and .single() /
// .maybeSingle() resolve the same way. This fake reproduces just enough of
// that shape for our route handlers.
function createQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  const chainable = ["select", "insert", "update", "delete", "eq", "order", "limit", "match"];

  for (const method of chainable) {
    builder[method] = vi.fn(() => builder);
  }

  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.then = (
    resolve: (value: QueryResult) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(resolve, reject);

  return builder;
}

// `results` are consumed in the exact order the route under test calls
// `.from(...)` — since these are unit tests against code we wrote
// ourselves, the call sequence is known and deterministic per test case.
export function createSupabaseMock(results: QueryResult[] = []) {
  let callIndex = 0;

  const from = vi.fn(() => {
    const result = results[callIndex] ?? { data: null, error: null };
    callIndex++;
    return createQueryBuilder(result);
  });

  return {
    from,
    auth: {
      getUser: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/review-photos/test.jpg" },
        })),
      })),
    },
  };
}
