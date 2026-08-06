import type { TodayPageProps } from "../types.ts";

export type TodayTimeStripProps = Pick<
  TodayPageProps,
  | "record"
  | "data"
  | "suggestedExit"
  | "updateRecord"
  | "lunchRunning"
  | "startLunch"
  | "finishLunch"
  | "activeBreak"
  | "todayCalc"
  | "startBreak"
  | "finishBreak"
>;

export type TodayTimeStripViewProps = TodayTimeStripProps & {
  showQuickActions?: boolean;
};
