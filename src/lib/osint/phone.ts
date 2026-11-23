import parsePhoneNumberFromString, { getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import type { PhoneIntel } from "./types";

const COUNTRY_NAME: Record<string, string> = {
  AU: "Australia",
  NZ: "New Zealand",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  IE: "Ireland",
  IN: "India",
  SG: "Singapore",
  PH: "Philippines",
  ZA: "South Africa",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  JP: "Japan",
  CN: "China",
};

const AU_AREA: Record<string, string> = {
  "02": "NSW / ACT landline",
  "03": "VIC / TAS landline",
  "07": "QLD landline",
  "08": "SA / WA / NT landline",
  "04": "Australian mobile",
  "05": "Australian mobile",
  "13": "Local-rate (13 / 1300)",
  "18": "Toll-free (1800)",
  "19": "Premium / satellite",
};

const TYPE_LABEL: Record<string, string> = {
  MOBILE: "Mobile",
  FIXED_LINE: "Landline",
  FIXED_LINE_OR_MOBILE: "Landline or mobile",
  TOLL_FREE: "Toll-free",
  PREMIUM_RATE: "Premium",
  SHARED_COST: "Shared cost / 13-1300",
  VOIP: "VoIP",
  PERSONAL_NUMBER: "Personal",
  PAGER: "Pager",
  UAN: "Universal access",
  VOICEMAIL: "Voicemail",
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function looksLikePhone(raw: string): boolean {
  const q = raw.trim();
  if (!q) return false;
  if (/[a-z]/i.test(q) && !q.startsWith("+") && !q.includes("@")) return false;
  if (q.includes("@")) return false;
  const d = digitsOnly(q);
  if (d.length < 6 || d.length > 15) return false;
  if (/^0[234578]\d{8}$/.test(d)) return true;
  if (/^61\d{8,10}$/.test(d)) return true;
  if (/^0061\d{8,10}$/.test(d)) return true;
  if (/^4\d{8}$/.test(d)) return true;
  if (/^1[38]\d{4,9}$/.test(d)) return true;
  if (q.startsWith("+") && d.length >= 8) return true;
  return /^[\d\s().+-]+$/.test(q) && d.length >= 8;
}

function attempts(raw: string): { input: string; country?: CountryCode }[] {
  const trimmed = raw.trim();
  const d = digitsOnly(trimmed);
  const out: { input: string; country?: CountryCode }[] = [];
  if (trimmed.startsWith("+")) out.push({ input: trimmed });
  if (d.startsWith("0061") && d.length >= 12) out.push({ input: `+${d.slice(2)}` });
  if (d.startsWith("61") && d.length >= 11) out.push({ input: `+${d}` });
  out.push({ input: trimmed, country: "AU" });
  if (d.startsWith("0")) out.push({ input: d, country: "AU" });
  if (/^4\d{8}$/.test(d)) out.push({ input: `0${d}`, country: "AU" });
  out.push({ input: trimmed, country: "NZ" });
  out.push({ input: trimmed, country: "US" });
  out.push({ input: trimmed, country: "GB" });
  out.push({ input: trimmed });
  return out;
}

export function parseAnyPhone(raw: string) {
  for (const a of attempts(raw)) {
    const parsed = a.country
      ? parsePhoneNumberFromString(a.input, a.country)
      : parsePhoneNumberFromString(a.input);
    if (parsed?.isPossible()) return parsed;
  }
  return undefined;
}

function auRegion(nationalDigits: string, type?: string): string | undefined {
  if (nationalDigits.startsWith("04") || nationalDigits.startsWith("05") || type === "Mobile") {
    return AU_AREA["04"];
  }
  const two = nationalDigits.slice(0, 2);
  if (AU_AREA[two]) return AU_AREA[two];
  if (nationalDigits.startsWith("1300") || nationalDigits.startsWith("13")) return AU_AREA["13"];
  if (nationalDigits.startsWith("1800") || nationalDigits.startsWith("18")) return AU_AREA["18"];
  return undefined;
}

function auTimezones(nationalDigits: string): string[] | undefined {
  if (nationalDigits.startsWith("02")) return ["Australia/Sydney"];
  if (nationalDigits.startsWith("03")) return ["Australia/Melbourne", "Australia/Hobart"];
  if (nationalDigits.startsWith("07")) return ["Australia/Brisbane"];
  if (nationalDigits.startsWith("08")) return ["Australia/Adelaide", "Australia/Perth", "Australia/Darwin"];
  if (nationalDigits.startsWith("04") || nationalDigits.startsWith("05")) {
    return ["Australia (mobile — timezone depends on the handset, not the prefix)"];
  }
  return ["Australia/Sydney"];
}

export function phoneIntel(raw: string): PhoneIntel {
  const parsed = parseAnyPhone(raw);
  const typeKey = parsed?.getType();
  const type = typeKey ? (TYPE_LABEL[typeKey] ?? typeKey) : undefined;
  const country = parsed?.country;
  const nationalDigits = parsed ? digitsOnly(parsed.formatNational()) : digitsOnly(raw);
  const notes: string[] = [];
  if (country === "AU" && (type === "Mobile" || nationalDigits.startsWith("04"))) {
    notes.push("Australian mobiles are portable. A prefix shows original allocation, not always the current network.");
  }
  return {
    raw,
    valid: parsed?.isValid() ?? false,
    possible: parsed?.isPossible() ?? false,
    e164: parsed?.number,
    international: parsed?.formatInternational(),
    national: parsed?.formatNational(),
    rfc3966: parsed?.getURI(),
    digits: parsed ? `${parsed.countryCallingCode}${parsed.nationalNumber}` : nationalDigits,
    country,
    countryName: country ? (COUNTRY_NAME[country] ?? country) : undefined,
    countryCallingCode: country
      ? `+${getCountryCallingCode(country)}`
      : parsed?.countryCallingCode
        ? `+${parsed.countryCallingCode}`
        : undefined,
    type,
    region: country === "AU" ? auRegion(nationalDigits, type) : undefined,
    timezones: country === "AU" ? auTimezones(nationalDigits) : undefined,
    notes: notes.length ? notes : undefined,
  };
}

export function phoneHint(raw: string): string | null {
  const parsed = parseAnyPhone(raw);
  if (!parsed?.isPossible()) return null;
  const intel = phoneIntel(raw);
  const bits = [intel.countryName, intel.type, intel.national].filter(Boolean);
  return bits.join(" · ");
}

export type PhoneFinding = {
  id: string;
  label: string;
  value: string;
  source: string;
};

export function phoneFindings(data: PhoneIntel): PhoneFinding[] {
  const out: PhoneFinding[] = [];
  const push = (id: string, label: string, value: string | undefined, source: string) => {
    if (!value) return;
    out.push({ id, label, value, source });
  };

  push(
    "plan",
    "Numbering plan",
    data.valid ? "Valid" : data.possible ? "Possible — not a fully assigned length" : "Does not match a national plan",
    "libphonenumber",
  );
  push("type", "Line type", data.type || data.lineType, "libphonenumber");
  push(
    "country",
    "Country",
    data.countryName
      ? `${data.countryName}${data.countryCallingCode ? ` ${data.countryCallingCode}` : ""}`
      : undefined,
    "ITU numbering plan",
  );
  push("region", "Region", data.region, data.geoSource || "numbering plan");
  push("city", "Locality", data.city, data.geoSource || "prefix geography");
  push("carrier", "Original carrier", data.carrier
    ? data.carrierPrefix
      ? `${data.carrier} · block ${data.carrierPrefix}`
      : data.carrier
    : undefined, "published allocation table");
  if (data.directory?.holder) {
    push("holder", "Current holder", data.directory.holder, data.directory.source);
  }
  if (data.directory?.area) {
    push("area", "Numbering area", data.directory.area, data.directory.source);
  }
  if (data.directory?.phoneType && data.directory.phoneType !== data.type) {
    push("dirtype", "Directory line type", data.directory.phoneType, data.directory.source);
  }
  if (data.directory?.names?.length) {
    push("names", "Published names", data.directory.names.join(" · "), data.directory.source);
  }
  if (data.directory?.address) {
    push("address", "Published address", data.directory.address, data.directory.source);
  }
  if (data.directory?.complaintsTotal != null) {
    push(
      "complaints",
      "Complaint reports",
      `${data.directory.complaintsYear ?? 0} this year · ${data.directory.complaintsTotal} total`,
      data.directory.source,
    );
  }
  push("mcc", "Mobile country code", data.mcc ? `MCC ${data.mcc}` : undefined, "ITU");
  if (data.nanp?.company) {
    push("nanp", "Prefix owner", data.nanp.company, "NANPA local calling guide");
  }
  if (data.nanp?.rateCenter) {
    push(
      "rate",
      "Rate center",
      [data.nanp.rateCenter, data.nanp.region].filter(Boolean).join(", "),
      "NANPA local calling guide",
    );
  }
  if (data.nanp?.lata) push("lata", "LATA", data.nanp.lata, "NANPA");
  if (data.nanp?.lat != null && data.nanp.lon != null) {
    push("coords", "Rate-center coordinates", `${data.nanp.lat.toFixed(4)}, ${data.nanp.lon.toFixed(4)}`, "NANPA");
  }
  push("e164", "E.164", data.e164, "libphonenumber");
  push("national", "National format", data.national, "libphonenumber");
  if (data.international && data.international !== data.e164) {
    push("intl", "International format", data.international, "libphonenumber");
  }
  return out;
}
