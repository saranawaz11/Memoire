"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  children: React.ReactNode;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export const ConfirmModal = ({
  children,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
}: Props) => {
  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onConfirm();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent
        className="bg-[var(--card)] border border-[var(--rule)] rounded-[3px_3px_12px_12px] shadow-[0_18px_30px_rgba(43,28,15,0.28)] px-8 py-7"
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className="text-[22px] italic font-semibold text-[var(--ink)]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className="text-[14px] leading-relaxed text-[var(--ink-soft)] pt-1"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* dashed-rule divider, matches the note card's meta border */}
        <div
          className="h-px my-3"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--rule) 60%, transparent 0%)",
            backgroundSize: "7px 1px",
            backgroundRepeat: "repeat-x",
          }}
        />

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            className="rounded-full px-5 text-[11px] uppercase tracking-wider text-[var(--ink-soft)] border border-[var(--rule)] bg-transparent hover:bg-black/5 hover:text-[var(--ink)]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="rounded-full px-5 text-[11px] uppercase tracking-wider text-[#f4e9dd] border-none bg-[#6e1b28] hover:bg-[#7a1f2b] hover:text-[#f4e9dd] shadow-[0_3px_6px_rgba(43,28,15,0.4)]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};