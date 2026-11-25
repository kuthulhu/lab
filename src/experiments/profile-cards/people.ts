export interface MiraProfile {
  name: string;
  role: string;
  followers: number;
  shots: number;
  landscapeSrc: string;
  portraitSrc: string;
}

export interface JonasProfile {
  name: string;
  role: string;
  bio: string;
  location: string;
  timezone: string;
  email: string;
  portraitSrc: string;
}

export interface AikoProfile {
  name: string;
  role: string;
  email: string;
  bannerSrc: string;
  avatarSrc: string;
  stats: { label: string; value: string }[];
}

export const MIRA: MiraProfile = {
  name: "Mira Okafor",
  role: "Product Designer",
  followers: 4041,
  shots: 128,
  landscapeSrc: "/profile-cards/mira-landscape.webp",
  portraitSrc: "/profile-cards/mira-portrait.webp",
};

export const JONAS: JonasProfile = {
  name: "Jonas Lindqvist",
  role: "Design Engineer",
  bio: "Bridges Figma and the browser. Writes springs by hand and has opinions about easing curves.",
  location: "Stockholm, Sweden",
  timezone: "CET · UTC+1",
  email: "jonas@example.com",
  portraitSrc: "/profile-cards/jonas-portrait.webp",
};

export const AIKO: AikoProfile = {
  name: "Aiko Tanaka",
  role: "Motion Designer",
  email: "aiko@example.com",
  bannerSrc: "/profile-cards/aiko-banner.webp",
  avatarSrc: "/profile-cards/aiko-avatar.webp",
  stats: [
    { label: "Projects", value: "72" },
    { label: "Followers", value: "8.9k" },
    { label: "Following", value: "540" },
  ],
};
