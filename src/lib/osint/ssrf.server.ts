import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "0.0.0.0") return true;
  if (v.startsWith("127.") || v.startsWith("10.") || v.startsWith("192.168.")) return true;
  if (v.startsWith("169.254.") || v.startsWith("100.64.")) return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
  const m = v.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

const BLOCKED_HOSTS = /^(localhost|metadata\.google\.internal|.*\.(local|internal|localhost))$/i;

export async function assertPublicHost(host: string): Promise<string[]> {
  const h = host.replace(/\.$/, "").toLowerCase();
  if (!h || BLOCKED_HOSTS.test(h)) {
    throw new Error("Host is not allowed");
  }
  if (isIP(h)) {
    if (isPrivateIp(h)) throw new Error("Private address blocked");
    return [h];
  }
  const addrs = await lookup(h, { all: true });
  const ips = addrs.map((a) => a.address);
  if (ips.length === 0) throw new Error("Could not resolve host");
  if (ips.some(isPrivateIp)) throw new Error("Private address blocked");
  return ips;
}

export function parseHttpUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }
  if (url.username || url.password) {
    throw new Error("Credentials in URL are not allowed");
  }
  return url;
}
