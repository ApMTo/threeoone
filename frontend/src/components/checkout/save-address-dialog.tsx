"use client";

import { Button } from "@/components/ui/button";

type SaveAddressDialogProps = {
  open: boolean;
  isSaving: boolean;
  onSave: () => void;
  onSkip: () => void;
};

export function SaveAddressDialog({
  open,
  isSaving,
  onSave,
  onSkip,
}: SaveAddressDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-zinc-950/40"
        onClick={onSkip}
        disabled={isSaving}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-address-title"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-7"
      >
        <h2
          id="save-address-title"
          className="text-xl font-semibold tracking-tight text-zinc-950"
        >
          Save this address?
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
          You don&apos;t have a saved shipping address yet. Save these details so
          you can reuse them on your next purchase.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={onSkip}
            disabled={isSaving}
          >
            Not now
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={onSave}
            disabled={isSaving}
            isLoading={isSaving}
          >
            Save address
          </Button>
        </div>
      </div>
    </div>
  );
}
