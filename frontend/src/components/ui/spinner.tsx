import { cn } from "@/lib/utils/cn";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-zinc-600", className)} role="status">
      <span className="inline-block size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
      <span>{label}</span>
    </div>
  );
}
