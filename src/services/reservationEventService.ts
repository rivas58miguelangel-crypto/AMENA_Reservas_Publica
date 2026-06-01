import { supabase } from "./supabaseClient";

type SafeResult<T = any> = {
  ok: boolean;
  data?: T | null;
  error?: string | null;
};

function logDevError(context: string, error: any) {
  if (import.meta.env.DEV) {
    console.warn(`[AMENA Supabase] ${context}`, {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      raw: error,
    });
  }
}

async function safeInsert<T = any>(
  table: string,
  payload: Record<string, any>
): Promise<SafeResult<T>> {
  try {
    if (!supabase) {
      return {
        ok: false,
        data: null,
        error: "Supabase client not configured",
      };
    }

    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();

    if (error) {
      logDevError(`Insert failed: ${table}`, error);
      return { ok: false, data: null, error: error.message };
    }

    return { ok: true, data };
  } catch (error) {
    logDevError(`Unexpected insert error: ${table}`, error);
    return { ok: false, data: null, error: "Unexpected error" };
  }
}

export async function startReservationSession(payload: {
  source?: string;
  deviceType?: string;
  landingPath?: string;
}) {
  return safeInsert("reservation_app_sessions", {
    source: payload.source ?? "demo_public_app",
    device_type: payload.deviceType ?? "desktop",
    user_agent: navigator.userAgent,
    landing_path: payload.landingPath ?? window.location.pathname,
    status: "started",
    created_at: new Date().toISOString(),
  });
}

export async function trackSelectionEvent(payload: {
  sessionId?: string | null;
  step:
    | "housing_type"
    | "sector"
    | "tower_or_block"
    | "model"
    | "level"
    | "unit_or_lot"
    | "unit_detail";
  value: string;
  metadata?: Record<string, any>;
}) {
  return safeInsert("reservation_selection_events", {
    session_id: payload.sessionId ?? null,
    step_name:
  payload.step === "housing_type"
    ? "tipo_propiedad"
    : payload.step === "tower_or_block"
      ? "torre"
      : payload.step === "unit_or_lot"
        ? "unidad"
        : payload.step === "unit_detail"
          ? "confirmacion"
          : payload.step,
    selected_value: payload.value,
    selected_label:
      payload.metadata?.display ??
      payload.metadata?.label ??
      payload.value,
    property_type:
  payload.step === "housing_type"
    ? (payload.value === "casas" ? "casa" : "apartamento")
    : payload.metadata?.property_type ?? null,
    raw_payload: {
      step: payload.step,
      value: payload.value,
      metadata: payload.metadata ?? {},
    },
    created_at: new Date().toISOString(),
  });
}

export async function logTechnicalEvidence(payload: {
  eventType: string;
  status: "success" | "warning" | "error";
  source: string;
  payload?: Record<string, any>;
}) {
  return safeInsert("technical_evidence_logs", {
    event_type: payload.eventType,
    status: payload.status,
    source: payload.source,
    payload: payload.payload ?? {},
    created_at: new Date().toISOString(),
  });
}