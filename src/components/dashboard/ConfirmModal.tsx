import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLabels } from "@/hooks/useLabels";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
}

// Radix Dialog so it also works nested inside a Sheet (raw fixed overlays
// inherit pointer-events: none from body and dismiss the parent dialog).
const ConfirmModal = ({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant = "default" }: ConfirmModalProps) => {
  const { ACTIONS } = useLabels();
  const confirm = confirmLabel || ACTIONS.CONFIRM;
  const cancel = cancelLabel || ACTIONS.CANCEL;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent className="w-full max-w-sm space-y-5 rounded-none font-mono [&>button]:hidden">
        <div className="flex items-center gap-2">
          {variant === "danger" && <AlertTriangle className="w-5 h-5 text-destructive" />}
          <DialogTitle asChild>
            <h3 className="font-mono text-xl font-bold">{title}</h3>
          </DialogTitle>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-mono tracking-wide uppercase border border-border rounded-none hover:bg-muted transition-colors">{cancel}</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm font-mono tracking-wide uppercase bg-primary text-primary-foreground rounded-none hover:opacity-90 transition-opacity active:scale-[0.98]">{confirm}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
