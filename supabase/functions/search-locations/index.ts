import { City, Country, State } from "npm:country-state-city@3.2.1";

const ALLOWED_ORIGIN = "https://hrtechifyed.github.io";
const MAX_RESULTS = 20;

const normalize = (value: unknown) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const countries = new Map(Country.getAllCountries().map((country) => [country.isoCode, country]));
const states = new Map(State.getAllStates().map((state) => [`${state.countryCode}|${state.isoCode}`, state]));
const cities = City.getAllCities().map((city) => {
  const country = countries.get(city.countryCode);
  const state = states.get(`${city.countryCode}|${city.stateCode}`);
  const parts = [city.name, state?.name, country?.name].filter(Boolean);
  const displayName = [...new Set(parts)].join(", ");
  return {
    display_name: displayName,
    category: "city",
    city: city.name,
    country_code: city.countryCode,
    state_code: city.stateCode || "",
    country: country?.name || city.countryCode,
    state: state?.name || "",
    latitude: city.latitude || "",
    longitude: city.longitude || "",
    search_name: normalize(displayName),
    city_search: normalize(city.name),
  };
});

function headers() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300",
    "Vary": "Origin",
  };
}

function specialResults(query: string) {
  const results = [] as Array<Record<string, string>>;
  if (!query || "remote".startsWith(query)) {
    results.push({ display_name: "Remote", category: "remote", city: "", country_code: "", state_code: "", country: "", state: "" });
  }
  if (!query || "other".startsWith(query)) {
    results.push({ display_name: "Other", category: "other", city: "", country_code: "", state_code: "", country: "", state: "" });
  }
  return results;
}

Deno.serve((req: Request) => {
  const responseHeaders = headers();
  if (req.method === "OPTIONS") return new Response("ok", { headers: responseHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: responseHeaders });

  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: responseHeaders });
  }

  const url = new URL(req.url);
  const query = normalize(url.searchParams.get("q") || "").slice(0, 80);
  if (!query) {
    return new Response(JSON.stringify({
      results: specialResults(query),
      more: false,
      attribution: "Countries States Cities Database · ODbL",
    }), { headers: responseHeaders });
  }

  const prefix: typeof cities = [];
  const secondary: typeof cities = [];
  for (const city of cities) {
    if (city.city_search.startsWith(query)) prefix.push(city);
    else if (query.length >= 2 && city.search_name.includes(query)) secondary.push(city);
    if (prefix.length >= MAX_RESULTS && query.length === 1) break;
  }

  prefix.sort((a, b) => a.display_name.localeCompare(b.display_name));
  secondary.sort((a, b) => a.display_name.localeCompare(b.display_name));

  const seen = new Set<string>();
  const selected = [] as Array<Record<string, unknown>>;
  for (const item of [...specialResults(query), ...prefix, ...secondary]) {
    const key = String(item.display_name);
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(item);
    if (selected.length >= MAX_RESULTS) break;
  }

  return new Response(JSON.stringify({
    results: selected.map(({ search_name: _search, city_search: _citySearch, ...result }) => result),
    more: prefix.length + secondary.length > MAX_RESULTS,
    attribution: "Countries States Cities Database · ODbL",
  }), { headers: responseHeaders });
});
