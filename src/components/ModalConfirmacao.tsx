interface Props {
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  perigo?: boolean;
  confirmando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalConfirmacao({
  titulo,
  mensagem,
  textoConfirmar,
  perigo = false,
  confirmando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{titulo}</h2>
        <p className="dica">{mensagem}</p>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancelar} disabled={confirmando}>
            Cancelar
          </button>
          
          <button
            className={perigo ? 'btn-primary btn-perigo' : 'btn-primary'}
            onClick={onConfirmar}
            disabled={confirmando}
          >
            {confirmando ? 'Aguarde…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
