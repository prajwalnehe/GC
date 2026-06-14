import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { PROPOSAL_STATUSES, getStatusColor } from '../../utils/helpers';

const ProposalStatusSelect = ({ value, onChange, disabled, fullWidth = false }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const ref = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const menuHeight = PROPOSAL_STATUSES.length * 44 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;

    setMenuPos({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    const handleClick = (e) => {
      const inTrigger = ref.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    const handleReposition = () => updateMenuPosition();

    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open, updateMenuPosition]);

  const handleSelect = (status) => {
    if (status !== value) onChange(status);
    setOpen(false);
  };

  const menu = open && menuPos && createPortal(
    <div
      ref={menuRef}
      style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
      className="fixed z-[9999] rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 shadow-xl p-2"
    >
      {PROPOSAL_STATUSES.map((status) => {
        const selected = status === value;
        return (
          <button
            key={status}
            type="button"
            onClick={() => handleSelect(status)}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors ${
              selected
                ? 'bg-secondary-100 dark:bg-secondary-700'
                : 'hover:bg-secondary-50 dark:hover:bg-secondary-700/50'
            }`}
          >
            <span className={`badge ${getStatusColor(status)}`}>{status}</span>
            {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
          </button>
        );
      })}
    </div>,
    document.body
  );

  return (
    <>
      <div ref={ref} className={fullWidth ? 'w-full' : 'inline-block'}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={`${getStatusColor(value)} flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
            fullWidth
              ? 'w-full justify-between px-3 py-2.5 rounded-lg text-sm border border-transparent'
              : 'badge py-1.5 px-2.5 min-w-[120px] justify-between'
          }`}
        >
          <span>{value}</span>
          <ChevronDown className={`w-4 h-4 shrink-0 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {menu}
    </>
  );
};

export default ProposalStatusSelect;
