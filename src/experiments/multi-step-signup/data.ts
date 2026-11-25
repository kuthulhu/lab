export interface CountryOption {
  code: string;
  name: string;
  dial: string;
  flag: string;
  flagImg?: string;
  cities: string[];
}

export const COUNTRIES: CountryOption[] = [
  {
    code: "US",
    name: "United States of America",
    dial: "+1",
    flag: "🇺🇸",
    flagImg: "/multi-step-signup/flag-us.png",
    cities: ["San Francisco", "New York", "Austin", "Los Angeles", "Chicago", "Seattle", "Boston", "Miami"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    dial: "+44",
    flag: "🇬🇧",
    cities: ["London", "Manchester", "Edinburgh", "Bristol", "Birmingham"],
  },
  {
    code: "CA",
    name: "Canada",
    dial: "+1",
    flag: "🇨🇦",
    cities: ["Toronto", "Vancouver", "Montreal", "Ottawa", "Calgary"],
  },
  {
    code: "DE",
    name: "Germany",
    dial: "+49",
    flag: "🇩🇪",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  },
  {
    code: "FR",
    name: "France",
    dial: "+33",
    flag: "🇫🇷",
    cities: ["Paris", "Lyon", "Marseille", "Bordeaux", "Nice"],
  },
  {
    code: "NL",
    name: "Netherlands",
    dial: "+31",
    flag: "🇳🇱",
    cities: ["Amsterdam", "Rotterdam", "Utrecht", "The Hague"],
  },
  {
    code: "SE",
    name: "Sweden",
    dial: "+46",
    flag: "🇸🇪",
    cities: ["Stockholm", "Gothenburg", "Malmö"],
  },
  {
    code: "CH",
    name: "Switzerland",
    dial: "+41",
    flag: "🇨🇭",
    cities: ["Zurich", "Geneva", "Basel", "Bern"],
  },
  {
    code: "ES",
    name: "Spain",
    dial: "+34",
    flag: "🇪🇸",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville"],
  },
  {
    code: "IT",
    name: "Italy",
    dial: "+39",
    flag: "🇮🇹",
    cities: ["Milan", "Rome", "Florence", "Turin"],
  },
  {
    code: "AU",
    name: "Australia",
    dial: "+61",
    flag: "🇦🇺",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth"],
  },
  {
    code: "SG",
    name: "Singapore",
    dial: "+65",
    flag: "🇸🇬",
    cities: ["Singapore"],
  },
  {
    code: "JP",
    name: "Japan",
    dial: "+81",
    flag: "🇯🇵",
    cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama"],
  },
  {
    code: "TR",
    name: "Turkey",
    dial: "+90",
    flag: "🇹🇷",
    cities: ["Istanbul", "Ankara", "Izmir", "Antalya"],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dial: "+971",
    flag: "🇦🇪",
    cities: ["Dubai", "Abu Dhabi", "Sharjah"],
  },
  {
    code: "IE",
    name: "Ireland",
    dial: "+353",
    flag: "🇮🇪",
    cities: ["Dublin", "Cork", "Galway"],
  },
  {
    code: "NO",
    name: "Norway",
    dial: "+47",
    flag: "🇳🇴",
    cities: ["Oslo", "Bergen", "Trondheim"],
  },
];

export const EMPLOYMENT_OPTIONS = [
  "Employed",
  "Self-employed",
  "Student",
  "Retired",
] as const;

export const SOURCE_OF_FUNDS_OPTIONS = [
  "Salary",
  "Savings",
  "Business Income",
  "Investments",
] as const;

export interface KycStepMeta {
  id: string;
  sidebarLabel: string;
  title: string;
  subtitle: string;
  icon: string;
  dividerBefore?: boolean;
}

export const KYC_STEPS: KycStepMeta[] = [
  {
    id: "personal",
    sidebarLabel: "Personal Details",
    title: "Personal Details",
    subtitle: "Enter your information exactly as it appears on your government-issued ID.",
    icon: "files",
  },
  {
    id: "document",
    sidebarLabel: "ID Proof",
    title: "Identity Document",
    subtitle: "Upload a valid, unexpired government-issued photo ID.",
    icon: "identification-card",
  },
  {
    id: "liveness",
    sidebarLabel: "Liveness",
    title: "Liveness Check",
    subtitle: "A quick face match confirms that you are the person on your ID.",
    icon: "camera",
  },
  {
    id: "profile",
    sidebarLabel: "Profile",
    title: "Regulatory and Financial Profile",
    subtitle: "Required by financial regulations to keep your account compliant.",
    icon: "user",
  },
  {
    id: "review",
    sidebarLabel: "Review",
    title: "Review and Submit",
    subtitle: "Double-check your details before sending them for verification.",
    icon: "file-magnifying-glass",
    dividerBefore: true,
  },
];

export const LEGAL_DOCS = {
  terms: {
    title: "Terms of Service",
    updated: "Last updated November 2026",
    sections: [
      {
        heading: "1. Account eligibility & verification",
        body: "You must be at least 18 years old and provide accurate legal information. Regulated features remain locked until identity verification (KYC) is approved.",
      },
      {
        heading: "2. Security & credentials",
        body: "You are responsible for safeguarding your password and verification codes. Notify us immediately if you suspect unauthorized access to your account.",
      },
      {
        heading: "3. Compliance & acceptable use",
        body: "We are required by law to perform anti-money laundering (AML) and Politically Exposed Person (PEP) checks. Accounts providing falsified documentation may be suspended.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated November 2026",
    sections: [
      {
        heading: "1. Identity data encryption",
        body: "Government IDs, selfie captures, and residential records are encrypted in transit with TLS 1.3 and at rest using AES-256 hardware security modules.",
      },
      {
        heading: "2. Why we collect KYC data",
        body: "Your identity documents and financial profile are used strictly to verify your identity, prevent fraud, and fulfill statutory financial reporting obligations.",
      },
      {
        heading: "3. Retention & your rights",
        body: "Biometric liveness templates are purged after verification completes unless required by law. You can request access to or export of your personal records at any time.",
      },
    ],
  },
} as const;

export function findCountryByName(name: string): CountryOption | undefined {
  return COUNTRIES.find((c) => c.name === name);
}
