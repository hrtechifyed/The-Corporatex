import { City, Country, State } from "npm:country-state-city@3.2.1";

const ALLOWED_ORIGIN = "https://hrtechifyed.github.io";
const MAX_RESULTS = 15;

const normalize = (value: unknown) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const PROMINENT_CITY_SCORES = new Map<string, number>([
  ["chennai|IN", 1000], ["chicago|US", 995], ["cairo|EG", 990], ["chongqing|CN", 985],
  ["chengdu|CN", 980], ["cape town|ZA", 975], ["colombo|LK", 970], ["casablanca|MA", 965],
  ["calgary|CA", 960], ["canberra|AU", 955], ["charlotte|US", 950], ["coimbatore|IN", 945],
  ["cincinnati|US", 940], ["curitiba|BR", 935], ["copenhagen|DK", 930], ["chandigarh|IN", 925],
  ["changsha|CN", 920], ["christchurch|NZ", 915], ["cleveland|US", 910], ["cologne|DE", 905],
  ["bengaluru|IN", 1000], ["beijing|CN", 995], ["berlin|DE", 990], ["bangkok|TH", 985],
  ["barcelona|ES", 980], ["boston|US", 975], ["brisbane|AU", 970], ["brussels|BE", 965],
  ["mumbai|IN", 1000], ["mexico city|MX", 995], ["madrid|ES", 990], ["manila|PH", 985],
  ["melbourne|AU", 980], ["munich|DE", 975], ["montreal|CA", 970], ["milan|IT", 965],
  ["new york|US", 1000], ["new delhi|IN", 995], ["nairobi|KE", 990], ["nagoya|JP", 985],
  ["noida|IN", 980], ["london|GB", 1000], ["los angeles|US", 995], ["lagos|NG", 990],
  ["lisbon|PT", 985], ["lima|PE", 980], ["lucknow|IN", 975], ["singapore|SG", 1000],
  ["shanghai|CN", 995], ["san francisco|US", 990], ["seoul|KR", 985], ["sydney|AU", 980],
  ["sao paulo|BR", 975], ["seattle|US", 970], ["shenzhen|CN", 965], ["stockholm|SE", 960],
  ["hyderabad|IN", 1000], ["hong kong|HK", 995], ["houston|US", 990], ["hamburg|DE", 985],
  ["helsinki|FI", 980], ["hanoi|VN", 975], ["hangzhou|CN", 970], ["pune|IN", 1000],
  ["paris|FR", 995], ["philadelphia|US", 990], ["phoenix|US", 985], ["prague|CZ", 980],
  ["perth|AU", 975], ["dubai|AE", 1000], ["delhi|IN", 995], ["dublin|IE", 990],
  ["doha|QA", 985], ["detroit|US", 980], ["toronto|CA", 1000], ["tokyo|JP", 995],
  ["taipei|TW", 990], ["tel aviv|IL", 985], ["gurugram|IN", 1000], ["guangzhou|CN", 995],
  ["geneva|CH", 990], ["glasgow|GB", 985], ["frankfurt|DE", 1000], ["florence|IT", 995],
  ["amsterdam|NL", 1000], ["abu dhabi|AE", 995], ["atlanta|US", 990], ["auckland|NZ", 985],
  ["athens|GR", 980], ["ahmedabad|IN", 975], ["austin|US", 970], ["vienna|AT", 1000],
  ["vancouver|CA", 995], ["valencia|ES", 990], ["zurich|CH", 1000], ["washington|US", 1000],
  ["warsaw|PL", 995], ["wuhan|CN", 990], ["yokohama|JP", 1000], ["jakarta|ID", 1000],
  ["johannesburg|ZA", 995], ["jaipur|IN", 990], ["kuala lumpur|MY", 1000], ["kolkata|IN", 995],
  ["kyoto|JP", 990], ["karachi|PK", 985], ["kochi|IN", 980], ["osaka|JP", 1000],
  ["oslo|NO", 995], ["ottawa|CA", 990], ["rome|IT", 1000], ["riyadh|SA", 995],
  ["rotterdam|NL", 990], ["rio de janeiro|BR", 985]
]);

type SearchCity = {
  display_name: string;
  category: "city";
  city: string;
  country_code: string;
  state_code: string;
  country: string;
  state: string;
  latitude: string;
  longitude: string;
  city_search: string;
  prominence_score: number;
};

const countries = new Map(Country.getAllCountries().map((country) => [country.isoCode, country]));
const states = new Map(State.getAllStates().map((state) => [`${state.countryCode}|${state.isoCode}`, state]));
const cities: SearchCity[] = City.getAllCities().map((city) => {
  const country = countries.get(city.countryCode);
  const state = states.get(`${city.countryCode}|${city.stateCode}`);
  const parts = [city.name, state?.name, country?.name].filter(Boolean);
  const displayName = [...new Set(parts)].join(", ");
  const citySearch = normalize(city.name);
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
    city_search: citySearch,
    prominence_score: PROMINENT_CITY_SCORES.get(`${citySearch}|${city.countryCode}`) || 0,
  };
});

function rankCities(a: SearchCity, b: SearchCity) {
  return b.prominence_score - a.prominence_score
    || a.city.localeCompare(b.city)
    || a.display_name.localeCompare(b.display_name);
}

const firstLetterIndex = new Map<string, SearchCity[]>();
const firstTwoIndex = new Map<string, SearchCity[]>();

function addToIndex(index: Map<string, SearchCity[]>, key: string, city: SearchCity) {
  if (!key) return;
  const bucket = index.get(key);
  if (bucket) bucket.push(city);
  else index.set(key, [city]);
}

for (const city of cities) {
  addToIndex(firstLetterIndex, city.city_search.slice(0, 1), city);
  addToIndex(firstTwoIndex, city.city_search.slice(0, 2), city);
}
for (const bucket of firstLetterIndex.values()) bucket.sort(rankCities);
for (const bucket of firstTwoIndex.values()) bucket.sort(rankCities);

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
  if (!query || "remote".startsWith(query)) results.push({ display_name: "Remote", category: "remote", city: "", country_code: "", state_code: "", country: "", state: "" });
  if (!query || "other".startsWith(query)) results.push({ display_name: "Other", category: "other", city: "", country_code: "", state_code: "", country: "", state: "" });
  return results;
}

function prefixMatches(query: string) {
  if (query.length === 1) return firstLetterIndex.get(query) || [];
  const bucket = firstTwoIndex.get(query.slice(0, 2)) || [];
  if (query.length === 2) return bucket;
  return bucket.filter((city) => city.city_search.startsWith(query));
}

Deno.serve((req: Request) => {
  const responseHeaders = headers();
  if (req.method === "OPTIONS") return new Response("ok", { headers: responseHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: responseHeaders });

  const origin = req.headers.get("Origin");
  if (origin && origin !== ALLOWED_ORIGIN) return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403, headers: responseHeaders });

  const url = new URL(req.url);
  const query = normalize(url.searchParams.get("q") || "").slice(0, 80);
  if (!query) {
    return new Response(JSON.stringify({
      results: specialResults(query),
      more: false,
      attribution: "Countries States Cities Database · ODbL",
    }), { headers: responseHeaders });
  }

  const matches = prefixMatches(query);
  const specials = specialResults(query);
  const seen = new Set<string>();
  const selected = [] as Array<Record<string, unknown>>;
  for (const item of [...specials, ...matches]) {
    const key = String(item.display_name);
    if (seen.has(key)) continue;
    seen.add(key);
    if ("city_search" in item) {
      const { city_search: _citySearch, prominence_score: _prominence, ...result } = item;
      selected.push(result);
    } else {
      selected.push(item);
    }
    if (selected.length >= MAX_RESULTS) break;
  }

  return new Response(JSON.stringify({
    results: selected,
    more: specials.length + matches.length > MAX_RESULTS,
    attribution: "Countries States Cities Database · ODbL",
  }), { headers: responseHeaders });
});
