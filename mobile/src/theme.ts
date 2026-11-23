import { Platform } from "react-native";

// Palette: black + white / blue + black / red
export const colors = {
  ink: "#0A0A0B",
  ink2: "#1A1A1D",
  white: "#FFFFFF",
  bg: "#F4F5F8",
  line: "#E7E8EC",
  muted: "#6B7280",
  faint: "#A3A8B3",

  blue: "#1F6FEB",
  blueDark: "#1553B8",
  blueSoft: "#E8F0FE",

  red: "#E5383B",
  redSoft: "#FDECEC",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const shadow = Platform.select({
  ios: {
    shadowColor: "#0A0A0B",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  default: { elevation: 4 },
})!;

export const type = {
  h1: { fontSize: 28, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: "800" as const, color: colors.ink, letterSpacing: -0.3 },
  body: { fontSize: 15, color: colors.ink },
  small: { fontSize: 13, color: colors.muted },
};
