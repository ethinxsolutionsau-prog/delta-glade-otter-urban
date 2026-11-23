import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-COuOr56x.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function str(v, max) {
	if (typeof v !== "string") throw new Error("invalid");
	const s = v.trim();
	if (!s || s.length > max) throw new Error("invalid");
	return s;
}
var reconUsername_createServerFn_handler = createServerRpc({
	id: "2e5be6340dd9c6843a4b18735df4fca0f045acdf15fe81094ca05ed8d4f3a2f0",
	name: "reconUsername",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconUsername.__executeServer(opts));
var reconUsername = createServerFn({ method: "POST" }).validator((d) => ({ username: str(d.username, 64) })).handler(reconUsername_createServerFn_handler, async ({ data }) => {
	const { collectUsername } = await import("./collectors.server-DkprSwY5.mjs");
	return collectUsername(data.username);
});
var reconGithub_createServerFn_handler = createServerRpc({
	id: "08fd78146b6a2704000b5bc41ff939602049612259f94365920686808a66fdba",
	name: "reconGithub",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconGithub.__executeServer(opts));
var reconGithub = createServerFn({ method: "POST" }).validator((d) => ({ username: str(d.username, 64) })).handler(reconGithub_createServerFn_handler, async ({ data }) => {
	const { collectGithub } = await import("./collectors.server-DkprSwY5.mjs");
	return collectGithub(data.username);
});
var reconEmail_createServerFn_handler = createServerRpc({
	id: "8dc1747b8478f261a46decf96efcbad9adc9972a1863ca6c7b4e167c0ae22540",
	name: "reconEmail",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconEmail.__executeServer(opts));
var reconEmail = createServerFn({ method: "POST" }).validator((d) => ({ email: str(d.email, 254).toLowerCase() })).handler(reconEmail_createServerFn_handler, async ({ data }) => {
	const { collectEmail } = await import("./collectors.server-DkprSwY5.mjs");
	return collectEmail(data.email);
});
var reconDomain_createServerFn_handler = createServerRpc({
	id: "41ffc14549090a732f3bae82665d4016a6a115f3ced5159e6baf0ce0da9ba3a7",
	name: "reconDomain",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconDomain.__executeServer(opts));
var reconDomain = createServerFn({ method: "POST" }).validator((d) => ({ domain: str(d.domain, 253).toLowerCase() })).handler(reconDomain_createServerFn_handler, async ({ data }) => {
	const { collectDomain } = await import("./collectors.server-DkprSwY5.mjs");
	return collectDomain(data.domain);
});
var reconIp_createServerFn_handler = createServerRpc({
	id: "8cba289e0b70e1a31198868f7cddf7c13468da10482f7f63ee2ea3b420926908",
	name: "reconIp",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconIp.__executeServer(opts));
var reconIp = createServerFn({ method: "POST" }).validator((d) => ({ ip: str(d.ip, 64) })).handler(reconIp_createServerFn_handler, async ({ data }) => {
	const { collectIp } = await import("./collectors.server-DkprSwY5.mjs");
	return collectIp(data.ip);
});
var reconUrl_createServerFn_handler = createServerRpc({
	id: "e4282222e931c5bc279173b6e243e5a1fcf65b6f56b3cd17e1aa4593ef07f691",
	name: "reconUrl",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconUrl.__executeServer(opts));
var reconUrl = createServerFn({ method: "POST" }).validator((d) => ({ url: str(d.url, 2048) })).handler(reconUrl_createServerFn_handler, async ({ data }) => {
	const { collectUrl } = await import("./collectors.server-DkprSwY5.mjs");
	return collectUrl(data.url);
});
var reconPhone_createServerFn_handler = createServerRpc({
	id: "4ad3655e047f1cbd9ebae198a5a08ae3db8e2fdf7730badcf97fdac01dcbd22c",
	name: "reconPhone",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconPhone.__executeServer(opts));
var reconPhone = createServerFn({ method: "POST" }).validator((d) => ({ phone: str(d.phone, 32) })).handler(reconPhone_createServerFn_handler, async ({ data }) => {
	const { collectPhone } = await import("./collectors.server-DkprSwY5.mjs");
	return collectPhone(data.phone);
});
var reconHash_createServerFn_handler = createServerRpc({
	id: "1ca4320098cc64c9934ca7068483826153503970b4eddf60a8ded1da3722a974",
	name: "reconHash",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconHash.__executeServer(opts));
var reconHash = createServerFn({ method: "POST" }).validator((d) => ({
	hash: str(d.hash, 128).toLowerCase(),
	algo: str(d.algo, 16)
})).handler(reconHash_createServerFn_handler, async ({ data }) => {
	const { collectHash } = await import("./collectors.server-DkprSwY5.mjs");
	const algo = data.algo;
	return collectHash(data.hash, algo);
});
var reconWallet_createServerFn_handler = createServerRpc({
	id: "2b14b4f8a8a1bce53f750cd24ab4c6077558acdfad4daac8e53c3c9c9d5ec5df",
	name: "reconWallet",
	filename: "src/lib/osint/server.ts"
}, (opts) => reconWallet.__executeServer(opts));
var reconWallet = createServerFn({ method: "POST" }).validator((d) => ({
	address: str(d.address, 128),
	chain: str(d.chain, 16)
})).handler(reconWallet_createServerFn_handler, async ({ data }) => {
	const { collectWallet } = await import("./collectors.server-DkprSwY5.mjs");
	const chain = data.chain === "bitcoin" || data.chain === "ethereum" ? data.chain : "unknown";
	return collectWallet(data.address, chain);
});
var generateBrief_createServerFn_handler = createServerRpc({
	id: "dc8ca333f29ea1e2ae48f9d52626e41eb77b5d246eb8f68fd7602016fac65e95",
	name: "generateBrief",
	filename: "src/lib/osint/server.ts"
}, (opts) => generateBrief.__executeServer(opts));
var generateBrief = createServerFn({ method: "POST" }).validator((d) => ({
	facts: str(d.facts, 12e3),
	query: str(d.query, 400)
})).handler(generateBrief_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI briefing is unavailable here."
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: .25,
			max_tokens: 700,
			messages: [{
				role: "system",
				content: "You are an OSINT analyst writing a short intelligence brief. Use only the supplied findings. Do not invent facts. Mark uncertainty. Structure: Subject, Confirmed, Infrastructure, Open questions, Recommended next public-source steps. Neutral professional tone. No purple prose."
			}, {
				role: "user",
				content: `Target: ${data.query}\n\nFindings JSON:\n${data.facts}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `Briefing failed (${res.status})`
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "Empty brief"
	};
	return {
		ok: true,
		text
	};
});
//#endregion
export { generateBrief_createServerFn_handler, reconDomain_createServerFn_handler, reconEmail_createServerFn_handler, reconGithub_createServerFn_handler, reconHash_createServerFn_handler, reconIp_createServerFn_handler, reconPhone_createServerFn_handler, reconUrl_createServerFn_handler, reconUsername_createServerFn_handler, reconWallet_createServerFn_handler };
