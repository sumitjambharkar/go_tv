import { Platform, useWindowDimensions } from "react-native";

export type ScreenClass = "mobile" | "tablet" | "large";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTV = Platform.isTV === true;
  const isMobile = !isTV && width < 700;
  const isTablet = !isTV && width >= 700 && width < 1000;
  const isLarge = isTV || width >= 1000;
  const screenClass: ScreenClass = isMobile ? "mobile" : isTablet ? "tablet" : "large";

  return { width, height, isTV, isMobile, isTablet, isLarge, isLandscape: width >= height, screenClass };
}
