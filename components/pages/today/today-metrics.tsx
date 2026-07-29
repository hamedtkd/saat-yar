import { Clock3, Tag, WalletCards } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { duration, fa, money } from "@/lib/format";
import { tw } from "@/lib/tw";
import type { ReturnTypeCalc } from "@/lib/type-helpers";

export function TodayMetrics({ result, dailyTarget }: { result: ReturnTypeCalc; dailyTarget: number }) {
  const progress = Math.min(100, Math.round(result.credited / dailyTarget * 100));
  return (
    <section className={tw("metric-grid", "four")}>
      <MetricCard icon={<Clock3 />} label="زمان امروز" value={duration(result.worked)} suffix="ساعت" />
      <MetricCard icon={<Tag />} label="قابل صورتحساب" value={duration(Math.max(0, result.worked - result.breakMinutes))} suffix="ساعت" />
      <MetricCard icon={<WalletCards />} label="درآمد تخمینی" value={money(result.worked / 60 * 850_000)} suffix="تومان" tone="blue" />
      <article className={tw("metric-card", "goal-card")}><div className={tw("mini-ring")} style={{ "--p": `${progress * 3.6}deg` } as React.CSSProperties}><strong>{fa.format(progress)}٪</strong></div><div><small>هدف روزانه</small><strong>{duration(result.credited)} <span>از {duration(dailyTarget)}</span></strong></div></article>
    </section>
  );
}
