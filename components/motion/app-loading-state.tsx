import { BrandMark } from "@/components/common/brand-mark";
import { cn } from "@/lib/cn";
import { RouteLoadingSkeleton } from "./route-loading-skeleton";

type Props = {
  label: string;
  logoLabel: string;
  pathname: string;
};

const skeleton = "rounded-xl bg-[color-mix(in_srgb,var(--text-muted)_10%,transparent)]";

export function AppLoadingState({ label, logoLabel, pathname }: Props) {
  return (
    <main
      data-app-loading-state
      data-app-loading-path={pathname}
      aria-busy="true"
      aria-live="polite"
      className="dashboard-shell min-h-screen w-full min-w-0 overflow-hidden bg-[var(--page)] p-2 pb-28 max-[359px]:p-1 max-[359px]:pb-24 sm:p-3 sm:pb-28 xl:px-0 xl:pb-3"
    >
      <span className="sr-only">{label}</span>
      <aside
        aria-hidden="true"
        className="fixed inset-y-2 start-2 hidden w-[var(--shell-sidebar-width)] flex-col rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[linear-gradient(180deg,var(--surface-1),var(--surface-raised))] p-3 shadow-[0_10px_32px_rgba(0,0,0,.055)] xl:flex dark:shadow-[0_14px_38px_rgba(0,0,0,.24)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--dashboard-border)] px-2 pb-4 pt-2">
          <BrandMark size={42} animated label={logoLabel} />
          <div className="grid flex-1 gap-2">
            <span className={cn(skeleton, "h-3 w-24")} />
            <span className={cn(skeleton, "h-2.5 w-32")} />
          </div>
        </div>
        <div className="mt-6 grid gap-2 px-1">
          {[0, 1, 2, 3].map((item) => <span key={item} className={cn(skeleton, "h-11 w-full rounded-[var(--control-radius)]")} />)}
        </div>
        <div className="mt-auto grid gap-2 border-t border-[var(--dashboard-border)] px-1 pt-4">
          <span className={cn(skeleton, "h-10 w-full")} />
          <span className={cn(skeleton, "h-16 w-full rounded-2xl")} />
        </div>
      </aside>

      <div aria-hidden="true" className="shell-main-offset h-[68px] rounded-[var(--card-radius)] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] shadow-[0_6px_22px_rgba(0,0,0,.04)]" />

      <div className="shell-main-offset mx-auto w-full min-w-0 px-1 pb-6 pt-4 max-[359px]:px-0.5 max-[359px]:pt-3 sm:px-3 sm:pt-5 lg:px-5">
        <section className="grid min-h-[520px] content-start" aria-label={label}>
          <RouteLoadingSkeleton pathname={pathname} />
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]" aria-hidden="true">
            <span className="block h-full w-1/3 rounded-full bg-[var(--accent)] motion-safe:animate-[saatyar-loading-sweep_1.8s_ease-in-out_infinite]" />
          </div>
        </section>
      </div>

      <div aria-hidden="true" className="fixed bottom-[calc(8px+env(safe-area-inset-bottom))] left-1/2 grid h-[64px] w-[calc(100vw-16px)] max-w-[520px] -translate-x-1/2 grid-cols-5 gap-1 rounded-[21px] border border-[var(--dashboard-border)] bg-[var(--surface-glass)] p-1 max-[359px]:bottom-[calc(5px+env(safe-area-inset-bottom))] max-[359px]:h-[56px] max-[359px]:w-[calc(100vw-10px)] max-[359px]:gap-0.5 max-[359px]:rounded-[18px] max-[359px]:p-0.5 shadow-[0_10px_30px_rgba(0,0,0,.16)] xl:hidden">
        {[0, 1, 2, 3, 4].map((item) => <span key={item} className={cn(skeleton, "m-1 rounded-[13px]")} />)}
      </div>
    </main>
  );
}
