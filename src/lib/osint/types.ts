export type IdType =
  | "email"
  | "ipv4"
  | "ipv6"
  | "domain"
  | "url"
  | "phone"
  | "hash"
  | "username"
  | "wallet"
  | "image"
  | "unknown";

export type ModuleStatus = "idle" | "loading" | "ready" | "error";

export type ModuleState<T> = {
  status: ModuleStatus;
  error?: string;
  data?: T;
};

export type UsernameHit = {
  id: string;
  name: string;
  category: string;
  url: string;
  status: "found" | "absent" | "unknown";
  detail?: string;
  bio?: string;
  followers?: number;
  avatar?: string;
  httpStatus?: number;
};

export type UsernameIntel = {
  username: string;
  hits: UsernameHit[];
  found: number;
  checked: number;
};

export type GithubIntel = {
  found: boolean;
  login?: string;
  name?: string | null;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string | null;
  twitter?: string | null;
  publicRepos?: number;
  followers?: number;
  following?: number;
  createdAt?: string;
  avatarUrl?: string;
  htmlUrl?: string;
  message?: string;
};

export type EmailIntel = {
  email: string;
  local: string;
  domain: string;
  validSyntax: boolean;
  roleAccount: boolean;
  disposable: boolean;
  mx: string[];
  gravatar: {
    hash: string;
    hasImage: boolean;
    profileUrl: string;
    avatarUrl: string;
    displayName?: string;
  };
};

export type DnsRecord = {
  type: string;
  name: string;
  ttl?: number;
  data: string;
};

export type DomainIntel = {
  domain: string;
  dns: DnsRecord[];
  nameservers: string[];
  mx: string[];
  ips: string[];
  txt: string[];
  rdap: {
    handle?: string;
    status?: string[];
    registrar?: string;
    registered?: string;
    expires?: string;
    nameservers?: string[];
    abuse?: string;
  } | null;
  certs: {
    commonName: string;
    sans: string[];
    issuer: string;
    notBefore?: string;
    notAfter?: string;
  }[];
  subdomains: string[];
  wayback: {
    first?: string;
    last?: string;
    count: number;
    samples: { timestamp: string; original: string; status?: string }[];
  };
  http: HttpProbe | null;
  emailAuth?: {
    spf?: string;
    spfAll?: string;
    dmarc?: string;
    dmarcPolicy?: string;
  };
};

export type HttpProbe = {
  url: string;
  status?: number;
  server?: string;
  poweredBy?: string;
  contentType?: string;
  hsts?: string;
  csp?: string;
  title?: string;
  generator?: string;
  securityTxt: boolean;
  robots: boolean;
  sitemaps: string[];
  blocked?: string;
};

export type IpIntel = {
  ip: string;
  version?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  postal?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  asn?: string | number;
  asname?: string;
  reverse?: string;
  isProxy?: boolean;
  isHosting?: boolean;
  isMobile?: boolean;
  rdap?: {
    handle?: string;
    name?: string;
    type?: string;
    country?: string;
    startAddress?: string;
    endAddress?: string;
    cidr?: string;
  } | null;
};

export type UrlIntel = {
  input: string;
  normalized: string;
  host: string;
  chain: { url: string; status?: number }[];
  finalUrl?: string;
  http: HttpProbe | null;
};

export type PhoneSighting = {
  title: string;
  url: string;
  snippet?: string;
  source: string;
};

export type PhoneIntel = {
  raw: string;
  valid: boolean;
  possible: boolean;
  e164?: string;
  international?: string;
  national?: string;
  rfc3966?: string;
  digits?: string;
  country?: string;
  countryName?: string;
  countryCallingCode?: string;
  type?: string;
  region?: string;
  city?: string;
  timezones?: string[];
  carrier?: string;
  carrierPrefix?: string;
  carrierNote?: string;
  lineType?: string;
  mcc?: string;
  geoSource?: string;
  nanp?: {
    npa: string;
    nxx: string;
    company?: string;
    rateCenter?: string;
    region?: string;
    lata?: string;
    switchName?: string;
    lat?: number;
    lon?: number;
  };
  reputation?: { source: string; summary: string; url: string }[];
  directory?: {
    source: string;
    url: string;
    phoneType?: string;
    holder?: string;
    area?: string;
    lastFound?: string;
    complaintsTotal?: number;
    complaintsYear?: number;
    spamNote?: string;
    names?: string[];
    address?: string;
  };
  sightings?: PhoneSighting[];
  notes?: string[];
};

export type HashIntel = {
  value: string;
  algo: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" | "unknown";
  bits: number;
  known?: boolean;
  fileName?: string;
  fileSize?: string;
  md5?: string;
  sha1?: string;
  source?: string;
  message?: string;
};

export type WalletIntel = {
  address: string;
  chain: "bitcoin" | "ethereum" | "unknown";
  balance?: string;
  received?: string;
  txCount?: number;
  ens?: string;
  explorer?: string;
  message?: string;
};

export type ImageIntel = {
  fileName: string;
  mime?: string;
  width?: number;
  height?: number;
  make?: string;
  model?: string;
  software?: string;
  dateOriginal?: string;
  lens?: string;
  gps?: { lat: number; lon: number };
  localOnly: true;
};

export type CaseModules = {
  username?: ModuleState<UsernameIntel>;
  github?: ModuleState<GithubIntel>;
  email?: ModuleState<EmailIntel>;
  domain?: ModuleState<DomainIntel>;
  ip?: ModuleState<IpIntel[]>;
  url?: ModuleState<UrlIntel>;
  phone?: ModuleState<PhoneIntel>;
  hash?: ModuleState<HashIntel>;
  wallet?: ModuleState<WalletIntel>;
  image?: ModuleState<ImageIntel>;
};

export type CaseRecord = {
  id: string;
  query: string;
  type: IdType;
  createdAt: number;
  updatedAt: number;
  notes: string;
  brief: string | null;
  briefStatus: ModuleStatus;
  briefError?: string;
  runId: number;
  modules: CaseModules;
};

export type Classified = {
  type: IdType;
  normalized: string;
  display: string;
  hashAlgo?: HashIntel["algo"];
  chain?: WalletIntel["chain"];
};
