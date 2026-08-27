interface Props {
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  title,
  message,
  confirmText,
  danger = false,
  confirming = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="hint">{message}</p>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} disabled={confirming}>
            Cancelar
          </button>

          <button
            className={danger ? 'btn-primary btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming ? 'Aguarde…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
