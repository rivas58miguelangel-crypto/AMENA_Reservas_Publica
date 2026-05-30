export type InventoryStatus = 'available' | 'pre_reserved' | 'reserved' | 'sold' | 'blocked';

export const inventoryStatusConfig: Record<InventoryStatus, {
  label: string;
  isSelectable: boolean;
  buttonClass: string;
  badgeClass: string;
  helperText: string;
}> = {
  available: {
    label: 'Disponible',
    isSelectable: true,
    buttonClass: 'bg-white hover:bg-[#f8efe6] border-[#d0833b] text-[#1e5d8c] shadow-sm hover:shadow-lg',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    helperText: 'Puede seleccionarse en este momento.',
  },
  pre_reserved: {
    label: 'Pre-reservado',
    isSelectable: false,
    buttonClass: 'bg-amber-50 border-amber-300 text-amber-900 opacity-80 cursor-not-allowed',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    helperText: 'Visible para contexto, pero no seleccionable mientras la pre-reserva esté vigente.',
  },
  reserved: {
    label: 'Reservado',
    isSelectable: false,
    buttonClass: 'bg-slate-100 border-slate-300 text-slate-500 opacity-70 cursor-not-allowed',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    helperText: 'No disponible para selección.',
  },
  sold: {
    label: 'Vendido',
    isSelectable: false,
    buttonClass: 'bg-slate-100 border-slate-300 text-slate-500 opacity-60 cursor-not-allowed',
    badgeClass: 'bg-slate-200 text-slate-700 border-slate-300',
    helperText: 'Unidad vendida.',
  },
  blocked: {
    label: 'Bloqueado',
    isSelectable: false,
    buttonClass: 'bg-rose-50 border-rose-200 text-rose-700 opacity-75 cursor-not-allowed',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    helperText: 'Bloqueado temporalmente por administración.',
  },
};

export const getInventoryStatus = (status?: string) => {
  const normalized = (status || 'available') as InventoryStatus;
  return inventoryStatusConfig[normalized] || inventoryStatusConfig.available;
};
