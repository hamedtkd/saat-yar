export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed start-3 top-3 z-[1200] -translate-y-24 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-bold text-[var(--accent-foreground)] shadow-[0_6px_18px_rgba(0,0,0,.14)] transition-transform focus:translate-y-0"
    >
      رفتن به محتوای اصلی
    </a>
  );
}
