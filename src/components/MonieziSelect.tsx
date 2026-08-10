import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export type MonieziSelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type MonieziSelectProps = {
  value: string;
  options: MonieziSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  menuClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
  placeholder?: string;
  menuMinWidth?: number;
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

const VIEWPORT_MARGIN = 12;
const DEFAULT_MENU_MIN_WIDTH = 180;
const MAX_MENU_HEIGHT = 320;

export function MonieziSelect({
  value,
  options,
  onChange,
  className = '',
  menuClassName = '',
  ariaLabel,
  disabled = false,
  placeholder = 'Select',
  menuMinWidth = DEFAULT_MENU_MIN_WIDTH,
}: MonieziSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value],
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const viewportTop = window.visualViewport?.offsetTop || 0;
    const viewportLeft = window.visualViewport?.offsetLeft || 0;

    const width = Math.min(
      Math.max(rect.width, menuMinWidth),
      Math.max(160, viewportWidth - VIEWPORT_MARGIN * 2),
    );

    const preferredMaxHeight = Math.min(MAX_MENU_HEIGHT, Math.max(160, viewportHeight - VIEWPORT_MARGIN * 2));
    const roomBelow = viewportTop + viewportHeight - rect.bottom - VIEWPORT_MARGIN;
    const roomAbove = rect.top - viewportTop - VIEWPORT_MARGIN;
    const openAbove = roomBelow < Math.min(220, preferredMaxHeight) && roomAbove > roomBelow;
    const maxHeight = Math.max(140, Math.min(preferredMaxHeight, openAbove ? roomAbove : roomBelow));

    const unclampedLeft = rect.left;
    const minLeft = viewportLeft + VIEWPORT_MARGIN;
    const maxLeft = viewportLeft + viewportWidth - width - VIEWPORT_MARGIN;
    const left = Math.min(Math.max(unclampedLeft, minLeft), Math.max(minLeft, maxLeft));
    const top = openAbove
      ? Math.max(viewportTop + VIEWPORT_MARGIN, rect.top - maxHeight - 6)
      : Math.min(viewportTop + viewportHeight - VIEWPORT_MARGIN - 40, rect.bottom + 6);

    setMenuPosition({ left, top, width, maxHeight });
  }, [menuMinWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition, options.length]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleViewportChange = () => updatePosition();

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, [open, updatePosition]);

  const choose = (nextValue: string, optionDisabled?: boolean) => {
    if (optionDisabled) return;
    onChange(nextValue);
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const popup = open && menuPosition && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={ariaLabel}
          className={`fixed overflow-y-auto overscroll-contain border border-slate-300 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${menuClassName}`.trim()}
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight,
            borderRadius: '10px',
            zIndex: 200000,
          }}
        >
          {options.map(option => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={option.disabled}
                onClick={() => choose(option.value, option.disabled)}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold leading-5 transition-colors ${
                  selected
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200'
                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
                } ${option.disabled ? 'cursor-not-allowed opacity-45' : ''}`}
              >
                <span className="min-w-0 flex-1 break-words">{option.label}</span>
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {selected ? <Check size={16} strokeWidth={2.4} /> : null}
                </span>
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen(current => !current);
        }}
        className={`inline-flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown size={15} strokeWidth={2} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {popup}
    </>
  );
}
