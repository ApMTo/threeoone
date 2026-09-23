"use client";

import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/lib/api/errors";

type QueryStateProps = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyMessage = "Nothing here yet.",
  children,
}: QueryStateProps) {
  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <p className="text-sm text-red-600">{getErrorMessage(error)}</p>;
  }

  if (isEmpty) {
    return <p className="text-sm text-zinc-600">{emptyMessage}</p>;
  }

  return children;
}
