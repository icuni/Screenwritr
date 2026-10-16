import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X } from 'lucide-react';
export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button type="button" className="icon-button" title={label} aria-label={label} {...props}>{children}</button>;
}
export function DialogFrame({ title, subtitle, children, onClose, wide = false, busy = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close(); }, []);
  return <dialog ref={ref} className={`dialog ${wide ? 'dialog-wide' : ''}`} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (!busy && event.target === event.currentTarget) onClose(); }} aria-busy={busy} aria-labelledby="dialog-title">
    <header className="dialog-header"><div><h2 id="dialog-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><IconButton label="Close dialog" disabled={busy} onClick={onClose}><X size={18} /></IconButton></header>
    {children}
  </dialog>;
}
export function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) { return <label className="field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>; }
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="empty-state"><span className="empty-mark">✳</span><h2>{title}</h2><p>{description}</p>{action}</div>; }
export const COLORS = ['#b88764','#7e9c88','#8c9fbc','#b495ab','#c1aa6d','#8b8f8a'];
