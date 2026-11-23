import { createServerFn } from "@tanstack/react-start";

function str(v: unknown, max: number) {
  if (typeof v !== "string") throw new Error("invalid");
  const s = v.trim();
  if (!s || s.length > max) throw new Error("invalid");
  return s;
}

export const reconUsername = createServerFn({ method: "POST" })
  .validator((d: { username: string }) => ({ username: str(d.username, 64) }))
  .handler(async ({ data }) => {
    const { collectUsername } = await import("./collectors.server");
    return collectUsername(data.username);
  });

export const reconGithub = createServerFn({ method: "POST" })
  .validator((d: { username: string }) => ({ username: str(d.username, 64) }))
  .handler(async ({ data }) => {
    const { collectGithub } = await import("./collectors.server");
    return collectGithub(data.username);
  });

export const reconEmail = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => ({ email: str(d.email, 254).toLowerCase() }))
  .handler(async ({ data }) => {
    const { collectEmail } = await import("./collectors.server");
    return collectEmail(data.email);
  });

export const reconDomain = createServerFn({ method: "POST" })
  .validator((d: { domain: string }) => ({ domain: str(d.domain, 253).toLowerCase() }))
  .handler(async ({ data }) => {
    const { collectDomain } = await import("./collectors.server");
    return collectDomain(data.domain);
  });

export const reconIp = createServerFn({ method: "POST" })
  .validator((d: { ip: string }) => ({ ip: str(d.ip, 64) }))
  .handler(async ({ data }) => {
    const { collectIp } = await import("./collectors.server");
    return collectIp(data.ip);
  });

export const reconUrl = createServerFn({ method: "POST" })
  .validator((d: { url: string }) => ({ url: str(d.url, 2048) }))
  .handler(async ({ data }) => {
    const { collectUrl } = await import("./collectors.server");
    return collectUrl(data.url);
  });

export const reconPhone = createServerFn({ method: "POST" })
  .validator((d: { phone: string }) => ({ phone: str(d.phone, 32) }))
  .handler(async ({ data }) => {
    const { collectPhone } = await import("./collectors.server");
    return collectPhone(data.phone);
  });

export const reconHash = createServerFn({ method: "POST" })
  .validator((d: { hash: string; algo: string }) => ({
    hash: str(d.hash, 128).toLowerCase(),
    algo: str(d.algo, 16),
  }))
  .handler(async ({ data }) => {
    const { collectHash } = await import("./collectors.server");
    const algo = data.algo as "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | "unknown";
    return collectHash(data.hash, algo);
  });

export const reconWallet = createServerFn({ method: "POST" })
  .validator((d: { address: string; chain: string }) => ({
    address: str(d.address, 128),
    chain: str(d.chain, 16),
  }))
  .handler(async ({ data }) => {
    const { collectWallet } = await import("./collectors.server");
    const chain = data.chain === "bitcoin" || data.chain === "ethereum" ? data.chain : "unknown";
    return collectWallet(data.address, chain);
  });

export const generateBrief = createServerFn({ method: "POST" })
  .validator((d: { facts: string; query: string }) => ({
    facts: str(d.facts, 12_000),
    query: str(d.query, 400),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI briefing is unavailable here." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.25,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You are an OSINT analyst writing a short intelligence brief. Use only the supplied findings. Do not invent facts. Mark uncertainty. Structure: Subject, Confirmed, Infrastructure, Open questions, Recommended next public-source steps. Neutral professional tone. No purple prose.",
          },
          {
            role: "user",
            content: `Target: ${data.query}\n\nFindings JSON:\n${data.facts}`,
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false as const, error: `Briefing failed (${res.status})` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Empty brief" };
    return { ok: true as const, text };
  });
