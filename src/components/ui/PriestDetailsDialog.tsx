import React, { useEffect, useId, useRef } from 'react';
import { Church, X } from 'lucide-react';

interface PriestDetailsDialogProps {
  open: boolean;
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  description?: string | null;
  metadata?: string[];
  videoUrl?: string | null;
  onClose: () => void;
}

export const PriestDetailsDialog: React.FC<PriestDetailsDialogProps> = ({
  open,
  name,
  title,
  photoUrl,
  description,
  metadata = [],
  videoUrl,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-black/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#c5a059]/30 bg-[#240404] px-5 py-4 text-white sm:px-6">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase text-[#e8c872]">{title || 'Clero paroquial'}</p>
          <h2 id={titleId} className="text-balance font-serif text-2xl font-bold sm:text-3xl">{name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/20 text-white transition-colors duration-150 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#e8c872]"
          aria-label="Fechar detalhes do sacerdote"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="max-h-[calc(100dvh-7.5rem)] overflow-y-auto p-5 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-[11rem_1fr] sm:items-start">
          <div className="mx-auto size-40 overflow-hidden rounded-lg border border-[#c5a059]/50 bg-stone-100 sm:size-44">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="size-full object-cover object-top" />
            ) : (
              <div className="flex size-full items-center justify-center text-[#8f6d25]">
                <Church className="size-14" />
              </div>
            )}
          </div>

          <div>
            {metadata.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2" aria-label="Informações do sacerdote">
                {metadata.map((item) => (
                  <li key={item} className="rounded-md border border-[#c5a059]/30 bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-[#611a1a]">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <p id={descriptionId} className="text-pretty whitespace-pre-line text-sm leading-7 text-stone-700 sm:text-base">
              {description || 'Informações biográficas serão adicionadas em breve.'}
            </p>
          </div>
        </div>

        {videoUrl && (
          <div className="mt-6 border-t border-stone-200 pt-6">
            <video src={videoUrl} controls className="w-full rounded-lg bg-black" />
          </div>
        )}
      </div>
    </dialog>
  );
};
