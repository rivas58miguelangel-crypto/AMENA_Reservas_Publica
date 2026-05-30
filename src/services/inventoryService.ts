import { SECTORS_DATA } from '../constants';

export type InventoryQuery = {
  propertyType?: string | null;
  sectorId?: string | null;
  towerId?: string | null;
  levelId?: string | null;
  modelId?: string | null;
};

// CIRUGÍA 01: servicio puente.
// Hoy devuelve datos locales para no romper la demo.
// En la siguiente cirugía este punto se conectará a una Edge Function segura:
// GET /available-inventory?propertyType=&sectorId=&towerId=&levelId=&modelId=
export async function getAvailableInventory(_query: InventoryQuery = {}) {
  return SECTORS_DATA;
}
