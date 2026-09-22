import type { IdType } from "./types";

export type PivotLink = {
  label: string;
  href: string;
  group: string;
};

function g(q: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

function ddg(q: string) {
  return `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
}

export function pivotLinks(type: IdType, value: string): PivotLink[] {
  const q = value.trim();
  const enc = encodeURIComponent(q);
  const links: PivotLink[] = [
    { group: "Search", label: "Google", href: g(`"${q}"`) },
    { group: "Search", label: "DuckDuckGo", href: ddg(`"${q}"`) },
  ];

  if (type === "username") {
    links.push(
      { group: "Search", label: "Google dork", href: g(`"${q}" (profile OR username OR account)`) },
      { group: "Code", label: "GitHub users", href: `https://github.com/${enc}` },
      { group: "Code", label: "GitHub search", href: `https://github.com/search?q=${enc}&type=users` },
      { group: "Social", label: "Reddit", href: `https://www.reddit.com/user/${enc}` },
      { group: "Social", label: "X", href: `https://x.com/${enc}` },
      { group: "Social", label: "LinkedIn", href: `https://www.linkedin.com/in/${enc}` },
      { group: "Archives", label: "Wayback", href: `https://web.archive.org/web/*/${enc}` },
    );
  }

  if (type === "email") {
    const domain = q.split("@")[1] ?? "";
    links.push(
      { group: "Breach", label: "Have I Been Pwned", href: `https://haveibeenpwned.com/account/${enc}` },
      { group: "Breach", label: "DeHashed", href: `https://www.dehashed.com/search?query=${enc}` },
      { group: "Code", label: "GitHub code", href: `https://github.com/search?q=${enc}&type=code` },
      { group: "Search", label: `site:${domain}`, href: g(`"${q}"`) },
      { group: "Search", label: "Pastebin", href: g(`site:pastebin.com "${q}"`) },
      { group: "People", label: "Hunter", href: `https://hunter.io/search/${encodeURIComponent(domain)}` },
      { group: "Archives", label: "Wayback", href: `https://web.archive.org/web/*/${enc}` },
    );
  }

  if (type === "domain" || type === "url") {
    const host = q.replace(/^https?:\/\//, "").split("/")[0] ?? q;
    links.push(
      { group: "DNS", label: "SecurityTrails", href: `https://securitytrails.com/domain/${host}/dns` },
      { group: "DNS", label: "ViewDNS", href: `https://viewdns.info/whois/?domain=${host}` },
      { group: "DNS", label: "crt.sh", href: `https://crt.sh/?q=${host}` },
      { group: "Scan", label: "urlscan", href: `https://urlscan.io/domain/${host}` },
      { group: "Scan", label: "VirusTotal", href: `https://www.virustotal.com/gui/domain/${host}` },
      { group: "Scan", label: "Shodan", href: `https://www.shodan.io/search?query=hostname%3A${host}` },
      { group: "Scan", label: "Censys", href: `https://search.censys.io/search?resource=hosts&q=${host}` },
      { group: "Archives", label: "Wayback", href: `https://web.archive.org/web/*/${host}` },
      { group: "Archives", label: "archive.today", href: `https://archive.ph/${host}` },
      { group: "Tech", label: "BuiltWith", href: `https://builtwith.com/${host}` },
      { group: "Search", label: "inurl dork", href: g(`site:${host}`) },
    );
  }

  if (type === "ipv4" || type === "ipv6") {
    links.push(
      { group: "Net", label: "Shodan", href: `https://www.shodan.io/host/${q}` },
      { group: "Net", label: "Censys", href: `https://search.censys.io/hosts/${q}` },
      { group: "Net", label: "VirusTotal", href: `https://www.virustotal.com/gui/ip-address/${q}` },
      { group: "Net", label: "AbuseIPDB", href: `https://www.abuseipdb.com/check/${q}` },
      { group: "Net", label: "BGPView", href: `https://bgpview.io/ip/${q}` },
      { group: "DNS", label: "ViewDNS reverse", href: `https://viewdns.info/reverseip/?host=${q}&t=1` },
    );
  }

  if (type === "phone") {
    const digits = q.replace(/\D/g, "");
    links.push(
      { group: "People", label: "Truecaller", href: `https://www.truecaller.com/search/us/${digits}` },
      { group: "Search", label: "Quoted number", href: g(`"${q}"`) },
      { group: "Search", label: "Digits only", href: g(`"${digits}"`) },
    );
  }

  if (type === "hash") {
    links.push(
      { group: "Malware", label: "VirusTotal", href: `https://www.virustotal.com/gui/search/${q}` },
      { group: "Malware", label: "MalwareBazaar", href: `https://bazaar.abuse.ch/sample/${q}/` },
      { group: "Malware", label: "Hybrid Analysis", href: `https://www.hybrid-analysis.com/search?query=${q}` },
      { group: "Search", label: "Google", href: g(q) },
    );
  }

  if (type === "wallet") {
    const eth = q.startsWith("0x");
    links.push(
      {
        group: "Chain",
        label: eth ? "Etherscan" : "mempool.space",
        href: eth ? `https://etherscan.io/address/${q}` : `https://mempool.space/address/${q}`,
      },
      {
        group: "Chain",
        label: "Blockchain.com",
        href: `https://www.blockchain.com/explorer/search?search=${enc}`,
      },
      { group: "Search", label: "Wallet dork", href: g(`"${q}"`) },
    );
  }

  if (type === "image") {
    links.push(
      { group: "Image", label: "Google Lens", href: "https://lens.google.com/upload" },
      { group: "Image", label: "Yandex Images", href: "https://yandex.com/images" },
      { group: "Image", label: "TinEye", href: "https://tineye.com" },
      { group: "Image", label: "PimEyes", href: "https://pimeyes.com" },
    );
  }

  return links;
}
