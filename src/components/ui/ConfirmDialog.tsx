import type { ReactNode } from "react";

import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      size="sm"
      onClose={onCancel}
      closeOnOverlayClick={!loading}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-muted">
        {description}
      </div>
    </Modal>
  );
};

export default ConfirmDialog;