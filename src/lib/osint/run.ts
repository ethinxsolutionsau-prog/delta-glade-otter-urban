import parsePhoneNumberFromString, { getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { classify, extractDomain, extractHost } from "./classify";
import {
  generateBrief,
  reconDomain,
  reconEmail,
  reconGithub,
  reconIp,
  reconUrl,
  reconUsername,
} from "./server";
import { compactFacts } from "./report";
import { useCaseStore } from "@/lib/cases/store";
import type { CaseRecord, ImageIntel, ModuleState } from "./types";

function setModule<K extends keyof CaseRecord["modules"]>(
  id: string,
  runId: number,
  key: K,
  state: CaseRecord["modules"][K],
) {
  useCaseStore.getState().patch(id, (c) => {
    if (c.runId !== runId) return c;
    return {
      ...c,
      updatedAt: Date.now(),
      modules: { ...c.modules, [key]: state },
    };
  });
}

async function load<K extends keyof CaseRecord["modules"]>(
  id: string,
  runId: number,
  key: K,
  fn: () => Promise<NonNullable<CaseRecord["modules"][K]> extends ModuleState<infer T> ? T : never>,
) {
  setModule(id, runId, key, { status: "loading" } as CaseRecord["modules"][K]);
  try {
    const data = await fn();
    setModule(id, runId, key, { status: "ready", data } as CaseRecord["modules"][K]);
  } catch (e) {
    setModule(id, runId, key, {
      status: "error",
      error: e instanceof Error ? e.message : "Failed",
    } as CaseRecord["modules"][K]);
  }
}

function phoneIntel(raw: string) {
  const parsed = parsePhoneNumberFromString(raw) ?? parsePhoneNumberFromString(raw, "US");
  const typeMap: Record<string, string> = {
    MOBILE: "Mobile",
    FIXED_LINE: "Fixed line",
    FIXED_LINE_OR_MOBILE: "Fixed or mobile",
    TOLL_FREE: "Toll-free",
    PREMIUM_RATE: "Premium",
    VOIP: "VoIP",
    PERSONAL_NUMBER: "Personal",
    PAGER: "Pager",
    UAN: "UAN",
    VOICEMAIL: "Voicemail",
  };
  return {
    raw,
    valid: parsed?.isValid() ?? false,
    possible: parsed?.isPossible() ?? false,
    e164: parsed?.number,
    international: parsed?.formatInternational(),
    national: parsed?.formatNational(),
    country: parsed?.country,
    countryCallingCode: parsed?.country
      ? `+${getCountryCallingCode(parsed.country as CountryCode)}`
      : parsed?.countryCallingCode
        ? `+${parsed.countryCallingCode}`
        : undefined,
    type: parsed?.getType() ? typeMap[parsed.getType() as string] ?? parsed.getType() ?? undefined : undefined,
  };
}

export async function runInvestigation(raw: string, extras?: { image?: ImageIntel }) {
  if (extras?.image) {
    const store = useCaseStore.getState();
    const record = store.createCase(extras.image.fileName, "image");
    const id = record.id;
    const runId = record.runId;
    setModule(id, runId, "image", { status: "ready", data: extras.image });
    return;
  }

  const classified = classify(raw);
  if (!classified.normalized || classified.type === "unknown") {
    throw new Error("Could not classify that input");
  }

  const store = useCaseStore.getState();
  const existing = store.cases.find((c) => c.query === classified.normalized && c.id === store.activeId);
  const record =
    existing ??
    store.createCase(classified.normalized, classified.type);
  const id = record.id;
  const runId = existing ? record.runId + 1 : record.runId;

  store.patch(id, (c) => ({
    ...c,
    query: classified.normalized,
    type: classified.type,
    runId,
    brief: null,
    briefStatus: "idle",
    updatedAt: Date.now(),
    modules: {},
  }));

  const jobs: Promise<void>[] = [];
  const { type, normalized } = classified;

  if (type === "username") {
    jobs.push(load(id, runId, "username", () => reconUsername({ data: { username: normalized } })));
    jobs.push(load(id, runId, "github", () => reconGithub({ data: { username: normalized } })));
  }

  if (type === "email") {
    const local = normalized.split("@")[0] ?? "";
    const domain = normalized.split("@")[1] ?? "";
    jobs.push(load(id, runId, "email", () => reconEmail({ data: { email: normalized } })));
    if (local) jobs.push(load(id, runId, "username", () => reconUsername({ data: { username: local } })));
    if (domain) jobs.push(load(id, runId, "domain", () => reconDomain({ data: { domain } })));
  }

  if (type === "domain") {
    jobs.push(load(id, runId, "domain", () => reconDomain({ data: { domain: normalized } })));
  }

  if (type === "url") {
    jobs.push(load(id, runId, "url", () => reconUrl({ data: { url: normalized } })));
    const host = extractHost(normalized);
    if (host) {
      const domain = extractDomain(host);
      jobs.push(load(id, runId, "domain", () => reconDomain({ data: { domain } })));
    }
  }

  if (type === "ipv4" || type === "ipv6") {
    jobs.push(
      load(id, runId, "ip", async () => {
        const one = await reconIp({ data: { ip: normalized } });
        return [one];
      }),
    );
  }

  if (type === "phone") {
    setModule(id, runId, "phone", { status: "ready", data: phoneIntel(normalized) });
  }

  if (type === "hash") {
    const bits = (classified.hashAlgo === "MD5" ? 128 : classified.hashAlgo === "SHA-1" ? 160 : classified.hashAlgo === "SHA-256" ? 256 : classified.hashAlgo === "SHA-384" ? 384 : classified.hashAlgo === "SHA-512" ? 512 : 0);
    setModule(id, runId, "hash", {
      status: "ready",
      data: { value: normalized, algo: classified.hashAlgo ?? "unknown", bits },
    });
  }

  if (type === "wallet") {
    setModule(id, runId, "wallet", {
      status: "ready",
      data: { address: normalized, chain: classified.chain ?? "unknown" },
    });
  }

  await Promise.all(jobs);

  const latest = useCaseStore.getState().cases.find((c) => c.id === id);
  const domainIps = latest?.modules.domain?.data?.ips.filter((ip) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)).slice(0, 2) ?? [];
  if (domainIps.length && !latest?.modules.ip?.data?.length) {
    await load(id, runId, "ip", async () => {
      const rows = await Promise.all(domainIps.map((ip) => reconIp({ data: { ip } })));
      return rows;
    });
  }
}

export async function runBrief(id: string) {
  const rec = useCaseStore.getState().cases.find((c) => c.id === id);
  if (!rec) return;
  useCaseStore.getState().patch(id, (c) => ({ ...c, briefStatus: "loading", briefError: undefined }));
  try {
    const result = await generateBrief({
      data: {
        query: rec.query,
        facts: JSON.stringify(compactFacts(rec)),
      },
    });
    if (!result.ok) {
      useCaseStore.getState().patch(id, (c) => ({
        ...c,
        briefStatus: "error",
        briefError: result.error,
      }));
      return;
    }
    useCaseStore.getState().patch(id, (c) => ({
      ...c,
      brief: result.text,
      briefStatus: "ready",
      updatedAt: Date.now(),
    }));
  } catch (e) {
    useCaseStore.getState().patch(id, (c) => ({
      ...c,
      briefStatus: "error",
      briefError: e instanceof Error ? e.message : "Failed",
    }));
  }
}
