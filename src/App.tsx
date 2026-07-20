import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Map as MapIcon,
  Home,
  Building2,
  Lock,
  ArrowRight,
  Maximize2,
  X,
  Info,
  Layout,
  Plus,
  Upload,
  Paperclip,
  Brain,
  RefreshCw
} from 'lucide-react';
import { cn } from './lib/utils';
import { SECTORS, HOUSING_TYPES, SECTORS_DATA, type Sector, type Subsector, type Level, type Model } from './constants';
import { projectBranding } from './config/projectBranding';
import { startReservationSession, trackSelectionEvent } from './services/reservationEventService';

type Screen = 
  | 'welcome' 
  | 'housing_type' 
  | 'sector_selection' 
  | 'torre_selection'
  | 'model_selection'
  | 'level_selection' 
  | 'unit_selection' 
  | 'unit_detail'
  | 'reservation_form'
  | 'further_steps'
  | 'acompanamiento_amena'
  | 'marta_now_detail'
  | 'marta_schedule_detail'
  | 'marta_link_detail'
  | 'advisor_call_detail'
  | 'advisor_office_detail'
  | 'advisor_visit_detail'
  | 'accompaniment_summary'
  | 'official_closure'
  | 'next_steps_instructions'
  | 'whatsapp_confirmation'
  | 'office_schedule'
  | 'project_visit_schedule'
  | 'user_comments'
  | 'analysis_report'
  | 'digital_agent'
  | 'agent_call'
  | 'visit_schedule'
  | 'final_success';

type MartaContactPreference = 'talk_now' | 'schedule_call' | 'whatsapp_link' | null;
type ProjectVisitPreference = 'request_visit' | 'schedule_visit' | null;
type AccompanimentSelection = {
  route: 'marta' | 'advisor';
  label: string;
  detail?: string;
};

type PostReservationStatus = {
  instructionsAcknowledged: boolean;
  martaContactPreference: MartaContactPreference;
  whatsappReceiptConfirmed: boolean;
  salesOfficeAppointmentScheduled: boolean;
  projectVisitPreference: ProjectVisitPreference;
};

const initialPostReservationStatus: PostReservationStatus = {
  instructionsAcknowledged: false,
  martaContactPreference: null,
  whatsappReceiptConfirmed: false,
  salesOfficeAppointmentScheduled: false,
  projectVisitPreference: null,
};

const initialInterestedPerson = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dui: '',
};

const App: React.FC = () => {
  const [reservationSessionId, setReservationSessionId] = useState<string | null>(null);
  const hasStartedReservationSession = React.useRef(false);
  const martaScheduleDraftOpen = React.useRef(false);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', projectBranding.primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', projectBranding.secondaryColor);
    document.documentElement.style.setProperty('--brand-accent', projectBranding.accentColor);
  }, []);

  React.useEffect(() => {
    const existingSessionId = sessionStorage.getItem('amena_reservation_session_id');

    if (existingSessionId) {
      setReservationSessionId(existingSessionId);
      return;
    }

    if (hasStartedReservationSession.current) {
      return;
    }

    hasStartedReservationSession.current = true;

    async function createInitialReservationSession() {
      const result = await startReservationSession({
        source: 'amena_public_reservation_app',
        deviceType: 'desktop',
        landingPath: window.location.pathname,
      });

      if (result.ok && result.data?.id) {
        sessionStorage.setItem('amena_reservation_session_id', result.data.id);
        setReservationSessionId(result.data.id);
      }
    }

    createInitialReservationSession();
  }, []);

  const [step, setStep] = useState(1);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [interestedPerson, setInterestedPerson] = useState(initialInterestedPerson);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<Subsector | null>(null);
  const [selectedTorre, setSelectedTorre] = useState<{ id: string; label: string } | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{ id: string; label: string } | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isMasterPlanOpen, setIsMasterPlanOpen] = useState(false);
  const [isSectorMapOpen, setIsSectorMapOpen] = useState(false);
  const [isManzanasModalOpen, setIsManzanasModalOpen] = useState(false);
  const [isLotesModalOpen, setIsLotesModalOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [isModelGalleryOpen, setIsModelGalleryOpen] = useState(false);
  const [inspectingModel, setInspectingModel] = useState<Model | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [postReservationStatus, setPostReservationStatus] = useState<PostReservationStatus>(initialPostReservationStatus);
  const [accompanimentSelections, setAccompanimentSelections] = useState<AccompanimentSelection[]>([]);

  const totalSteps = 15;
  const isApartments = selectedType === 'apartamentos';
  const reservationId = selectedUnit?.id ? `DN-${selectedUnit.id.toUpperCase()}` : 'DN-RESERVA-DEMO';
  const reservationSummaryItems = [
    { label: 'Proyecto', value: projectBranding.projectName },
    { label: isApartments ? 'Torre' : 'Manzana', value: selectedTorre?.label },
    ...(isApartments ? [{ label: 'Nivel', value: selectedLevel?.name }] : []),
    { label: 'Modelo', value: selectedModel?.name },
    { label: isApartments ? 'Unidad' : 'Lote', value: selectedUnit?.label },
    { label: 'Reservation ID', value: reservationId },
  ].filter((item) => Boolean(item.value));

  const navigateTo = (newScreen: Screen, newStep: number) => {
    setScreen(newScreen);
    setStep(newStep);
    window.scrollTo(0, 0);
  };

  const registerAccompanimentSelection = (selection: AccompanimentSelection) => {
    setAccompanimentSelections((current) => [
      ...current.filter((item) => item.label !== selection.label),
      selection,
    ]);
  };

  const formatScheduleDetail = (schedule?: { date: string; time: string }) => (
    schedule?.date && schedule?.time
      ? `Preferencia recibida: ${schedule.date} a las ${schedule.time}.`
      : 'Preferencia recibida para seguimiento posterior.'
  );
  const trackSelection = (
  step:
    | "housing_type"
    | "sector"
    | "tower_or_block"
    | "model"
    | "level"
    | "unit_or_lot"
    | "unit_detail"
    | "confirmation"
    | "post_reservation_cta",
  value: string,
  metadata?: Record<string, any>
) => {
  trackSelectionEvent({
    sessionId: reservationSessionId,
    step,
    value,
    metadata,
  });
};

  const trackPostReservationEvent = (eventName: string, metadata?: Record<string, any>) => {
    const postReservationEvent = {
      event_name: eventName,
      property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
      sector: selectedSector?.id,
      tower_or_block: selectedTorre?.id,
      level: selectedLevel?.id,
      model: selectedModel?.id,
      unit_or_lot: selectedUnit?.id,
      selection_type: selectedType === 'apartamentos' ? 'unidad' : 'lote',
      metadata: metadata ?? {},
    };

    if (import.meta.env.DEV) {
      console.debug('[Ruta 2 post-reservation event pending Supabase]', postReservationEvent);
    }
  };

  const handleLogout = () => {
    // Reset all states
    setStep(1);
    setScreen('welcome');
    setAcceptedTerms(false);
    setIsTermsModalOpen(false);
    setInterestedPerson(initialInterestedPerson);
    setSelectedType(null);
    setSelectedSector(null);
    setSelectedTorre(null);
    setSelectedLevel(null);
    setSelectedModel(null);
    setSelectedUnit(null);
    setAnalysisResult(null);
    setPostReservationStatus(initialPostReservationStatus);
    setAccompanimentSelections([]);
    martaScheduleDraftOpen.current = false;
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (screen === 'housing_type') navigateTo('welcome', 1);
    else if (screen === 'sector_selection') navigateTo('housing_type', 2);
    else if (screen === 'torre_selection') navigateTo('sector_selection', 3);
    else if (screen === 'model_selection') navigateTo('torre_selection', 4);
    else if (screen === 'level_selection') navigateTo('model_selection', 5);
    else if (screen === 'unit_selection') {
      if (selectedType === 'apartamentos') navigateTo('level_selection', 6);
      else navigateTo('model_selection', 5);
    }
    else if (screen === 'unit_detail') navigateTo('unit_selection', 7);
    else if (screen === 'reservation_form') navigateTo('unit_detail', 8);
    else if (screen === 'further_steps') navigateTo('reservation_form', 9);
    else if (screen === 'next_steps_instructions') navigateTo('reservation_form', 9);
    else if (screen === 'acompanamiento_amena') navigateTo('analysis_report', 13);
    else if (screen === 'marta_now_detail') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'marta_schedule_detail') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'marta_link_detail') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'advisor_call_detail') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'advisor_office_detail') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'advisor_visit_detail') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'accompaniment_summary') navigateTo('acompanamiento_amena', 12);
    else if (screen === 'official_closure') navigateTo('accompaniment_summary', 13);
    else if (screen === 'whatsapp_confirmation') navigateTo('acompanamiento_amena', 11);
    else if (screen === 'office_schedule') navigateTo('whatsapp_confirmation', 12);
    else if (screen === 'project_visit_schedule') navigateTo('office_schedule', 13);
    else if (screen === 'user_comments') navigateTo('next_steps_instructions', 10);
    else if (screen === 'analysis_report') navigateTo('user_comments', 12);
    else if (screen === 'digital_agent') navigateTo('further_steps', 10);
    else if (screen === 'agent_call') navigateTo('further_steps', 10);
    else if (screen === 'visit_schedule') navigateTo('further_steps', 10);
    else if (screen === 'final_success') navigateTo('project_visit_schedule', 14);
  };

  // --- Components ---

  const Header = () => (
    <div className="hoperia-header">
      <div className="hoperia-header__top">
        <div className="hoperia-brand-lockup">
          <div className="hoperia-brand-mark">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="hoperia-brand-copy">
            <p className="hoperia-suite-label">Suite H - OperIA</p>
            <p className="hoperia-context-label">{projectBranding.companyName}</p>
            <h1 className="hoperia-project-title">{projectBranding.projectName}</h1>
            <p className="hoperia-context-tagline">{projectBranding.tagline}</p>
          </div>
        </div>
        <div className="hoperia-progress-badge">
          <span>PASO {step} DE {totalSteps}</span>
        </div>
      </div>
      <div className="hoperia-progress-track">
        <motion.div 
          className="hoperia-progress-value"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  const BackButton = () => (
    <button 
      onClick={handleBack}
      className={cn(
        "hoperia-back-button",
        step === 1 && "opacity-0 pointer-events-none"
      )}
    >
      <ChevronLeft className="w-4 h-4" /> REGRESAR
    </button>
  );

  const PostReservationStepBadge = (_props?: { current?: number }) => null;

  const ReservationContinuityBadge = () => (
    <section className="mb-6 rounded-2xl border border-accent/10 bg-white/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-accent">Reserva activa</p>
          <p className="text-[15px] font-black uppercase tracking-tight text-primary">{reservationId}</p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-tight text-primary/70">
          {reservationSummaryItems.map((item) => (
            <span key={item.label}>
              <span className="opacity-50">{item.label}:</span> {item.value}
            </span>
          ))}
        </div>
      </div>
    </section>
  );

  const ImageModal = ({ isOpen, onClose, title, imageUrl, message }: { isOpen: boolean, onClose: () => void, title: string, imageUrl?: string, message?: string }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[180] bg-black/90 backdrop-blur-md flex flex-col p-6"
        >
          <div className="relative z-[190] flex justify-between items-center mb-8">
            <h3 className="text-white text-xl font-black uppercase tracking-widest">{title}</h3>
            <button 
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center overflow-hidden">
             {imageUrl ? (
               <motion.img 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 src={imageUrl} 
                 alt={title} 
                 className="max-w-full max-h-full object-contain rounded-2xl"
               />
             ) : (
               <div className="text-white font-bold">Imagen no disponible</div>
             )}
          </div>
          {message && (
            <div className="mt-8 text-center bg-white/10 p-6 rounded-3xl">
              <p className="text-white font-bold text-sm leading-relaxed">
                {message}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ModelGalleryModal = ({ isOpen, onClose, models }: { isOpen: boolean, onClose: () => void, models: Model[] }) => {
    const [currentModelIndex, setCurrentModelIndex] = useState(0);
    const [hasReviewedAllModels, setHasReviewedAllModels] = useState(false);

    React.useEffect(() => {
      if (isOpen) {
        setCurrentModelIndex(0);
        setHasReviewedAllModels(false);
      }
    }, [isOpen]);

    const model = models[currentModelIndex];

    if (!model) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-0"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="relative w-full max-w-[480px] h-full sm:h-[95vh] bg-[#f2f2eb] shadow-2xl sm:rounded-[4rem] overflow-hidden flex flex-col"
            >
              {/* Top Bar Indicators */}
              <div className="absolute top-4 left-0 right-0 px-8 flex gap-1 z-20">
                {models.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 flex-grow rounded-full transition-colors", 
                      currentModelIndex === i ? "bg-accent" : i < currentModelIndex ? "bg-accent/40" : "bg-primary/10"
                    )} 
                  />
                ))}
              </div>

              <div className="absolute top-8 right-8 z-[190]">
                <button onClick={onClose} aria-label="Cerrar galería de modelos" className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-primary shadow-lg hover:bg-white transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="overflow-y-auto flex-grow no-scrollbar pt-16 px-8 pb-32">
                <div className="mb-6">
                  <span className="text-accent text-[32px] font-black leading-none block mb-1">{model.price}</span>
                  <h3 className="text-[40px] font-black text-primary uppercase tracking-tighter leading-none mb-4">
                    {model.name}
                  </h3>
                   <div className="inline-block px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {model.area} • {model.bedrooms} • {model.bathrooms}
                  </div>
                </div>

                <div className="flex-grow flex flex-col">
                  {/* Official Image Container */}
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-black/5 mb-8">
                    <div className="relative aspect-[1.3] w-full rounded-2xl overflow-hidden bg-white">
                       <img 
                         src={model.image} 
                         alt={model.name} 
                         className="w-full h-full object-cover" 
                       />
                    </div>
                  </div>

                  {/* Features Container */}
                  <div className="bg-[#f7f2f1] p-8 rounded-[2.5rem] border border-black/5 shadow-sm mb-6">
                     <h4 className="text-[11px] font-black text-primary/40 uppercase tracking-widest mb-6">Características Clave</h4>
                     <div className="space-y-4">
                        {model.description?.split(',').map((f, i) => (
                          <div key={i} className="flex items-center gap-4">
                             <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                             <span className="text-[18px] font-bold text-primary/90 tracking-tight leading-tight">{f.trim()}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 left-8 right-8 z-30">
                <button 
                  onClick={() => {
                    if (currentModelIndex < models.length - 1) {
                      setCurrentModelIndex(currentModelIndex + 1);
                      setHasReviewedAllModels(false);
                    } else {
                      setHasReviewedAllModels(true);
                    }
                  }}
                  className="w-full py-8 rounded-[2rem] bg-accent text-white font-black uppercase text-xl tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
                >
                  {currentModelIndex < models.length - 1 ? 'SIGUIENTE' : 'YA REVISÉ TODOS'} <ArrowRight className="w-6 h-6" />
                </button>
                {hasReviewedAllModels && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-2xl bg-white border border-accent/20 shadow-lg"
                  >
                    <p className="text-[13px] font-black text-primary text-center leading-snug">
                      Ya revisaste todos los modelos. Cierra la galería y elige tu modelo preferido.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const ModelDetailModal = ({ isOpen, onClose, model, onSelect }: { isOpen: boolean, onClose: () => void, model: Model | null, onSelect: (m: Model) => void }) => {
    if (!model) return null;
    
    // Split description into list items if it contains commas
    const features = model.description ? model.description.split(',').map(f => f.trim()) : [];

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="relative w-full max-w-[500px] h-[92vh] bg-[#f2f2eb] shadow-2xl rounded-[4rem] overflow-hidden flex flex-col mx-4 sm:mx-0"
            >
              <div className="absolute top-6 right-6 z-[190]">
                <button onClick={onClose} aria-label="Cerrar detalle de modelo" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-lg hover:bg-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto flex-grow flex flex-col p-8">
                <div className="mb-6">
                  <span className="text-accent text-3xl font-black">{model.price}</span>
                  <h3 className="text-4xl font-black text-primary uppercase tracking-tight mt-2">{model.name}</h3>
                  <div className="mt-2">
                    <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                      ÁREA DE CONSTRUCCIÓN: {model.area}
                    </span>
                  </div>
                </div>

                {/* Foto del modelo ANTES de la lista de textos */}
                <div className="relative aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-black/5 mb-8 group">
                   <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-4 mb-10">
                   {features.map((feature, i) => (
                     <div key={i} className="flex items-center gap-5">
                        <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                        <span className="text-[20px] font-black text-primary opacity-90 tracking-tight leading-tight">{feature}</span>
                     </div>
                   ))}
                </div>

                <button 
                  onClick={() => {
                    onSelect(model);
                    onClose();
                  }}
                  className="w-full py-6 rounded-[2rem] bg-accent text-white font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                  SELECCIONAR ESTE MODELO <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // --- Screens ---

  const WelcomeScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="hoperia-screen"
    >
      <BackButton />
      <h2 className="hoperia-screen-title">
        Experiencia demo H - OperIA
      </h2>
      <p className="hoperia-kicker">
        Centro Demo · Datos simulados
      </p>
      <p className="hoperia-screen-copy">
        Recorre una experiencia de reservas generica para mostrar como H - OperIA organiza contexto, decisiones y seguimiento comercial.
      </p>

      <div className="hoperia-primary-card amena-card-welcome">
        <p className="hoperia-card-eyebrow">Empresa Demo presenta</p>
        <h3 className="hoperia-feature-title">Proyecto de Empresa Demo</h3>
        <p className="hoperia-feature-copy">
          Antes de iniciar el recorrido, completa datos ficticios para personalizar la demostracion y simular correctamente tu interes en el proyecto.
        </p>
        <div className="hoperia-form-stack">
          {[
            { key: 'firstName', label: 'Nombres', placeholder: 'Ej. Miguel' },
            { key: 'lastName', label: 'Apellidos', placeholder: 'Ej. Rivas' },
            { key: 'email', label: 'Correo electrónico', placeholder: 'correo@ejemplo.com', type: 'email' },
            { key: 'phone', label: 'Teléfono celular con código de país', placeholder: 'Ej. +503 7000-0000', type: 'tel' },
            { key: 'dui', label: 'DUI opcional', placeholder: 'Ej. 00000000-0' },
          ].map((field) => (
            <label key={field.key} className="hoperia-field">
              <span>{field.label}</span>
              <input
                type={field.type || 'text'}
                defaultValue={interestedPerson[field.key as keyof typeof interestedPerson]}
                onBlur={(event) => setInterestedPerson((current) => ({ ...current, [field.key]: event.target.value }))}
                placeholder={field.placeholder}
                className="hoperia-input"
              />
            </label>
          ))}
        </div>
      </div>

      <div className={cn(
        "hoperia-support-card",
        acceptedTerms ? "hoperia-support-card--active" : ""
      )}>
        <button
          onClick={() => setAcceptedTerms(!acceptedTerms)}
          className="hoperia-check-row"
        >
          <p>
            Comprendo que esta experiencia es una demostración con datos simulados.
          </p>
          <div className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
            acceptedTerms ? "bg-primary border-primary" : "border-slate-300"
          )}>
            {acceptedTerms && <Check className="w-4 h-4 text-white" />}
          </div>
        </button>
        <button
          type="button"
          onClick={() => setIsTermsModalOpen(true)}
          className="hoperia-link-button"
        >
          Ver condiciones de uso y tratamiento de datos
        </button>
      </div>

      <AnimatePresence>
        {isTermsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-primary mb-4">Condiciones de uso del escenario demo</h3>
              <ul className="space-y-3 text-sm font-semibold leading-6 text-secondary">
                <li>Esta experiencia corresponde a un escenario demostrativo con datos simulados.</li>
                <li>No constituye una reserva real ni una oferta comercial vinculante.</li>
                <li>No implica tratamiento comercial definitivo por parte de una entidad inmobiliaria real.</li>
                <li>Para la demostración deben utilizarse datos ficticios y evitar información personal sensible.</li>
                <li>Las comunicaciones, precios y disponibilidades mostradas son únicamente referenciales.</li>
              </ul>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-black uppercase tracking-widest text-white"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        disabled={!acceptedTerms}
onClick={(event) => {
  const form = event.currentTarget.closest('div');
  const inputs = form?.querySelectorAll('input') || [];
  const firstName = (inputs[0] as HTMLInputElement)?.value.trim();
  const lastName = (inputs[1] as HTMLInputElement)?.value.trim();
  const email = (inputs[2] as HTMLInputElement)?.value.trim();
  const phone = (inputs[3] as HTMLInputElement)?.value.trim();

  if (!firstName || !lastName || !email || !phone) {
    alert('Por favor completa nombres, apellidos, correo electrónico y teléfono antes de continuar.');
    return;
  }

  setInterestedPerson((current) => ({
    ...current,
    firstName,
    lastName,
    email,
    phone,
  }));

  navigateTo('housing_type', 2);
}}
        className={cn(
          "amena-btn amena-btn-dark hoperia-primary-action",
          !acceptedTerms && "opacity-50 grayscale"
        )}
      >
        COMENZAR RECORRIDO
      </button>

      <div className="hoperia-footer-note">
        <button>Centro Demo H - OperIA</button>
        <div>
          <p>Suite H - OperIA</p>
          <p>Experiencia comercial demostrativa</p>
        </div>
      </div>
    </motion.div>
  );

  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const HousingTypeScreen = () => {
    const [carouselStep, setCarouselStep] = useState(0);
    const comparisonSlides = [
      {
        type: 'image',
        title: 'Vivir en Casa',
        url: './demo/casa-exterior.png',
        price: 'Desde $119k',
        area: '126m² - 182m²',
        description: 'Jardín propio, espacios familiares, cochera y distribución independiente.',
        caption: 'Proyecto Demo · Casa Olivo'
      },
      {
        type: 'image',
        title: 'Vivir en Torre',
        url: './demo/apartamento-exterior.png',
        price: 'Desde $58k',
        area: '42m² - 76m²',
        description: 'Distribuciones funcionales, áreas compartidas y opciones para distintos estilos de vida.',
        caption: 'Proyecto Demo · Apartamento Prisma'
      }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="hoperia-screen"
      >
        <BackButton />
        <h2 className="hoperia-screen-title">
          Camino de reserva demo
        </h2>
        <p className="hoperia-screen-copy">
          Selecciona el formato de vivienda para mostrar como el recorrido ordena alternativas comerciales.
        </p>

        <button 
          onClick={() => {
            setCarouselStep(0);
            setIsComparisonOpen(true);
          }}
          className="hoperia-secondary-action"
        >
          <span>Visualizador Comparativo</span>
          <div>
            Abrir Guía <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <div className="hoperia-choice-grid">
          <button
            onClick={() => {
  setSelectedType('casas');
  trackSelection('housing_type', 'casas', {
    label: 'Residencial',
    display: 'Casas'
  });
  navigateTo('sector_selection', 3);
}}
            className="hoperia-choice-card group"
          >
            <div className="hoperia-choice-media">
               <img src="./demo/casa-exterior.png" alt="Casas" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3>Residencial</h3>
            <p>Casas</p>
          </button>

          <button
            onClick={() => {
              setSelectedType('apartamentos');
              trackSelection('housing_type', 'apartamentos', {
                label: 'Vertical',
                display: 'Apartamentos'
              });
              navigateTo('sector_selection', 3);
            }}
            className="hoperia-choice-card group"
          >
             <div className="hoperia-choice-media">
               <img src="./demo/apartamento-exterior.png" alt="Apartamentos" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3>Vertical</h3>
            <p>Apartamentos</p>
          </button>
        </div>

        <AnimatePresence>
          {isComparisonOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-0"
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsComparisonOpen(false)} />
              <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="relative w-full max-w-[480px] h-full sm:h-[95vh] bg-[#f2f2eb] shadow-2xl sm:rounded-[4rem] overflow-hidden flex flex-col"
              >
                {/* Top Bar Indicators */}
                <div className="absolute top-4 left-0 right-0 px-8 flex gap-1 z-20">
                  {comparisonSlides.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1.5 flex-grow rounded-full transition-colors", 
                        carouselStep === i ? "bg-accent" : i < carouselStep ? "bg-accent/40" : "bg-primary/10"
                      )} 
                    />
                  ))}
                </div>

                <div className="absolute top-8 right-8 z-20">
                  <button onClick={() => setIsComparisonOpen(false)} className="w-12 h-12 rounded-full flex items-center justify-center text-primary/30 hover:bg-black/5 transition-colors">
                    <X className="w-8 h-8" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-grow no-scrollbar pt-16 px-8 pb-32">
                  <div className="mb-6">
                    <span className="text-accent text-3xl font-black">{comparisonSlides[carouselStep].price}</span>
                    <h3 className="text-4xl font-black text-primary uppercase tracking-tight mt-2">
                      {comparisonSlides[carouselStep].title}
                    </h3>
                    <div className="mt-2">
                      <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                        ÁREA APROX: {comparisonSlides[carouselStep].area}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col">
                    <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-black/5 mb-8">
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-white">
                         <img 
                           src={comparisonSlides[carouselStep].url} 
                           alt="" 
                           className="w-full h-full object-cover" 
                         />
                      </div>
                    </div>

                    <div className="space-y-4 mb-10">
                       {comparisonSlides[carouselStep].description?.split(',').map((f, i) => (
                         <div key={i} className="flex items-center gap-5">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                            <span className="text-[20px] font-black text-primary opacity-90 tracking-tight leading-tight">{f.trim()}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-8 right-8 z-30">
                  <button 
                    onClick={() => {
                      if (carouselStep < 1) {
                        setCarouselStep(carouselStep + 1);
                      } else {
                        setIsComparisonOpen(false);
                      }
                    }}
                    className="w-full py-8 rounded-[2rem] bg-accent text-white font-black uppercase text-xl tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
                  >
                    {carouselStep < 1 ? 'SIGUIENTE' : 'ENTENDIDO'} <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const SectorSelectionScreen = () => {
    const data = selectedType ? SECTORS_DATA[selectedType] : null;
    const isApartments = selectedType === 'apartamentos';
    const accentColor = isApartments ? 'text-accent' : 'text-primary';

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="hoperia-screen"
      >
        <BackButton />
        <h2 className="hoperia-screen-title">
          Selecciona Sector
        </h2>
        <p className="hoperia-screen-copy">
          Elige el sector en el que deseas explorar disponibilidad de {isApartments ? 'apartamentos' : 'casas'}.
        </p>

        <button 
          onClick={() => setIsSectorMapOpen(true)}
          className="hoperia-secondary-action group"
        >
          <span>Ver sectores del proyecto</span>
          <div>
            Abrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <div className="hoperia-context-chip">
           <p>
             <span className="opacity-80">{isApartments ? 'APARTAMENTOS' : 'CASAS'}</span>
           </p>
        </div>

        <div className="hoperia-choice-grid">
          {SECTORS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                const sectorData = data?.subsectors.find(s => s.id === sub.id) || data?.subsectors[0];
                if (sectorData) {
                  setSelectedSector(sectorData);
                  trackSelection('sector', sectorData.id, {
                    label: sectorData.name,
                    display: sectorData.name,
                    description: sectorData.description,
                    property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa'
                  });
                }
                navigateTo('torre_selection', 4);
              }}
              className="hoperia-choice-card hoperia-choice-card--compact group"
            >
              <h3>{sub.name}</h3>
              <p>{sub.description}</p>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const TorreSelectionScreen = () => {
    const visualTargets = selectedSector?.visualTargets;
    const isApartments = selectedType === 'apartamentos';
    const accentColor = isApartments ? 'text-accent' : 'text-primary';

    const houseManzanas = [
      { id: 'mz_a', label: 'MZ A' },
      { id: 'mz_b', label: 'MZ B' },
      { id: 'mz_c', label: 'MZ C' },
      { id: 'mz_d', label: 'MZ D' }
    ];

    const targetsToDisplay = isApartments ? visualTargets : houseManzanas;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="hoperia-screen"
      >
        <BackButton />
        <h2 className="hoperia-screen-title">
          {isApartments ? 'Selecciona Torre' : 'Selecciona Manzana'}
        </h2>
        <p className="hoperia-screen-copy">
          {isApartments 
            ? 'Estas son las torres que actualmente cuentan con apartamentos disponibles dentro del sector elegido.'
            : 'Estas son las manzanas que actualmente cuentan con casas disponibles dentro del sector elegido.'
          }
        </p>

<div className="hoperia-context-chip">
  <p>
    {isApartments ? 'APARTAMENTOS' : 'CASAS'} · {selectedSector?.name}
  </p>
</div>
{!isApartments && (
  <button
    onClick={() => setIsManzanasModalOpen(true)}
    className="hoperia-secondary-action hoperia-secondary-action--solo"
  >
    Ver manzanas disponibles
  </button>
)}
        {targetsToDisplay && (
          <div className="hoperia-primary-card">
            <h4 className="hoperia-card-section-title">
              {isApartments ? 'Torres' : 'Manzanas'} con disponibilidad en este sector
            </h4>
            <div className="hoperia-choice-grid">
              {targetsToDisplay.map((target) => (
                <button
                  key={target.id}
                  onClick={() => {
                    setSelectedTorre(target as any);
                    trackSelection(isApartments ? 'tower_or_block' : 'tower_or_block', target.id, {
                      label: target.label,
                      display: target.label,
                      property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                      sector: selectedSector?.id,
                      selection_type: isApartments ? 'torre' : 'manzana'
                    });
                    navigateTo('model_selection', 5);
                  }}
                  className="hoperia-choice-card hoperia-choice-card--compact hoperia-choice-card--status group"
                >
                  <div className="hoperia-choice-card__row">
                    <div>{target.label}</div>
                    <span>Disponibles</span>
                  </div>
                  <div className="hoperia-card-meta-stack">
                    <p>{isApartments ? 'Prisma:' : 'Olivo:'} {Math.floor(Math.random() * 5) + 1} disp.</p>
                    <p>{isApartments ? 'Horizonte:' : 'Cedro:'} {Math.floor(Math.random() * 3) + 1} disp.</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const ModelSelectionScreen = () => {
    const isApartments = selectedType === 'apartamentos';
    const accentColor = isApartments ? 'text-accent' : 'text-primary';

    // Current Torre Models
    const currentSectorData = selectedSector || SECTORS_DATA['apartamentos'].subsectors[0];
    const models = currentSectorData?.levels[0].models || [];

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="hoperia-screen hoperia-screen--with-footer"
      >
        <BackButton />
        <h2 className="hoperia-screen-title">
          Selecciona Modelo de {isApartments ? 'Apartamento' : 'Casa'}
        </h2>
        <p className="hoperia-screen-copy">
          Revisa el área y el valor referencial de los modelos disponibles antes de continuar.
        </p>

        <button 
          onClick={() => setIsModelGalleryOpen(true)}
          className="hoperia-secondary-action group"
        >
          <span>Vea los detalles de cada uno de los modelos de {isApartments ? 'apartamentos' : 'casas'} disponibles</span>
          <div>
            ABRIR <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <div className="hoperia-context-chip">
           <p>
             <span className="opacity-80 uppercase">{isApartments ? 'APARTAMENTOS' : 'CASAS'}</span> 
             <span className="opacity-30">·</span> 
             <span>{selectedSector?.name || 'SECTOR 02'}</span>
             <span className="opacity-30 ml-1">·</span> 
             <span>{selectedTorre?.label || (isApartments ? 'T5' : 'MZ A')}</span>
           </p>
        </div>

        <div className="hoperia-choice-grid">
          {models.length > 0 ? models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model);
                trackSelection('model', model.id, {
                  label: model.name,
                  display: model.name,
                  property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                  sector: selectedSector?.id,
                  tower_or_block: selectedTorre?.id,
                  selection_type: 'modelo',
                  price: model.price,
                  area: model.area
                });
                if (isApartments) navigateTo('level_selection', 6);
                else navigateTo('unit_selection', 7);
              }}
              className={cn(
                "hoperia-choice-card hoperia-choice-card--model group",
                selectedModel?.id === model.id && "hoperia-choice-card--selected"
              )}
            >
              <div className="hoperia-choice-media">
                <img src={model.image} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3>{model.name}</h3>
              <p>Desde {model.price}</p>
            </button>
          )) : (
            <div className="col-span-2 py-20 text-center text-primary/40 font-bold italic">
              Cargando modelos disponibles...
            </div>
          )}
        </div>

        <ModelGalleryModal
          isOpen={isModelGalleryOpen}
          onClose={() => setIsModelGalleryOpen(false)}
          models={models}
        />
      </motion.div>
    );
  };

  const LevelSelectionScreen = () => {
    const levels = selectedSector?.levels || [];

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8"
      >
        <BackButton />
        <h2 className="text-[32px] font-black text-accent leading-none mb-4 tracking-tight uppercase">
          {selectedType === 'apartamentos' ? 'Selecciona Nivel' : 'Selecciona Manzana'}
        </h2>
        <p className="text-secondary font-medium text-sm leading-snug mb-8">
          Mostramos únicamente {selectedType === 'apartamentos' ? 'niveles con apartamentos' : 'manzanas con casas'} disponibles o pre reservados para el modelo seleccionado.
        </p>



        <div className="bg-[#f7f2eb] p-4 rounded-full border border-[#e8dfd1] mb-8">
           <div className="flex flex-col gap-1">
             <p className="text-[10px] font-black text-primary uppercase text-center tracking-tight flex items-center justify-center gap-1">
               <span className="opacity-80">{selectedType === 'apartamentos' ? 'APARTAMENTOS' : 'CASAS'}</span> 
               <span className="opacity-30">·</span> 
               <span className="text-accent">{selectedSector?.name}</span>
               <span className="opacity-30 ml-1">·</span> 
               <span className="text-accent ml-1">{selectedTorre?.label}</span>
             </p>
             <p className="text-[10px] font-black text-primary uppercase text-center tracking-tight flex items-center justify-center gap-1">
               <span className="text-accent">{selectedModel?.name}</span>
             </p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => {
                setSelectedLevel(level);
                trackSelection('level', level.id, {
                  label: level.name,
                  display: level.name,
                  property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                  sector: selectedSector?.id,
                  tower_or_block: selectedTorre?.id,
                  model: selectedModel?.id,
                  selection_type: 'nivel'
                });
                navigateTo('unit_selection', 7);
              }}
              className="bg-white border-2 border-transparent hover:border-accent/10 rounded-[2rem] p-6 text-center flex flex-col items-center gap-2 shadow-sm active:ring-4 active:ring-accent/10 transition-all group"
            >
              <h3 className="text-lg font-black text-accent leading-none uppercase tracking-tighter select-none">{level.name}</h3>
              <p className="text-[9px] font-bold text-secondary tracking-tight opacity-70">
                {selectedType === 'apartamentos' ? 'Apartamentos' : 'Casas'} disponibles en este {selectedType === 'apartamentos' ? 'nivel' : 'manzana'}
              </p>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };
const UnitSelectionScreen = () => {
  const isApartments = selectedType === 'apartamentos';
  const accentColor = isApartments ? 'text-accent' : 'text-primary';

  const visualTargets = [
    { id: '101', label: isApartments ? '101' : 'L-01' },
    { id: '102', label: isApartments ? '102' : 'L-02' },
    { id: '103', label: isApartments ? '103' : 'L-03' },
    { id: '104', label: isApartments ? '104' : 'L-04' },
    { id: '201', label: isApartments ? '201' : 'L-05' },
    { id: '202', label: isApartments ? '202' : 'L-06' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      <BackButton />

      <h2 className={`text-[32px] font-black ${accentColor} leading-none mb-4 tracking-tight uppercase`}>
        {isApartments ? 'Escoge tu Apartamento' : 'Escoge tu Lote'}
      </h2>

      <p className="text-secondary font-medium text-sm leading-snug mb-8">
        {isApartments
          ? `${selectedLevel?.name || 'Torre T5'} • ${selectedSector?.name}. Selecciona una unidad disponible.`
          : `${selectedTorre?.label || 'Manzana A'} • ${selectedSector?.name}. Selecciona un lote disponible marcado en el plano.`
        }
      </p>

      <div className="bg-[#f7f2eb] p-4 rounded-full border border-[#e8dfd1] mb-8">
        <p className="text-[10px] font-black text-primary uppercase text-center tracking-tight flex items-center justify-center gap-1">
          <span className="opacity-80 uppercase">{isApartments ? 'APARTAMENTOS' : 'CASAS'}</span>
          <span className="opacity-30">·</span>
          <span className={accentColor}>{selectedSector?.name}</span>
          <span className="opacity-30 ml-1">·</span>
          <span className={`${accentColor} ml-1`}>{selectedTorre?.label}</span>
          {!isApartments && <span className="opacity-30 ml-1">·</span>}
          {!isApartments && <span className={`${accentColor} ml-1`}>{selectedModel?.name}</span>}
          {isApartments && <span className="opacity-30 ml-1">·</span>}
          {isApartments && <span className={`${accentColor} ml-1`}>{selectedLevel?.name}</span>}
        </p>
      </div>

{!isApartments && (
  <div>
    <button
      onClick={() => setIsLotesModalOpen(true)}
      className="w-full p-4 bg-white rounded-2xl border text-primary font-black mb-6"
    >
      Ver lotes disponibles
    </button>

    <div className="bg-white p-4 rounded-[3rem] border-2 border-black/5 shadow-inner mb-8">
      <div className="aspect-square bg-slate-100 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center">

        <img
          src="./demo/plano-lotes.png"
          alt="Plano Lotes"
          className="w-full h-full object-cover rounded-[2rem]"
          referrerPolicy="no-referrer"
        />

      </div>
    </div>
  </div>
)}
      <div className="grid grid-cols-2 gap-4">
        {visualTargets.map((target) => (
          <button
            key={target.id}
            onClick={() => {
              setSelectedUnit(target);
              trackSelection('unit_or_lot', target.id, {
                label: target.label,
                display: target.label,
                property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                sector: selectedSector?.id,
                tower_or_block: selectedTorre?.id,
                level: selectedLevel?.id,
                model: selectedModel?.id,
                selection_type: isApartments ? 'unidad' : 'lote'
              });
              navigateTo('unit_detail', 8);
            }}
            className={`bg-white border-2 ${isApartments ? 'border-accent/10' : 'border-primary/10'} rounded-[2.5rem] p-10 text-center flex flex-col items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${isApartments ? 'hover:border-accent' : 'hover:border-primary'} group`}
          >
            <span className="text-[10px] font-black text-primary/40 tracking-widest uppercase">
              {isApartments ? 'UNIDAD' : 'LOTE'}
            </span>
            <h3 className={`text-4xl font-black ${accentColor} leading-none uppercase tracking-tighter group-hover:scale-110 transition-transform`}>
              {target.label}
            </h3>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
  const UnitDetailScreen = () => {
    const isApartments = selectedType === 'apartamentos';
    const accentColor = isApartments ? 'text-accent' : 'text-primary';
    const accentBg = isApartments ? 'bg-accent' : 'bg-primary';
    const [isPreReserveOpen, setIsPreReserveOpen] = useState(false);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        className="p-0 flex flex-col min-h-screen bg-surface"
      >
        <div className="bg-white px-8 py-6 border-b border-black/5 flex flex-col items-center">
          <div className="w-full flex justify-start">
            <BackButton />
          </div>
          <h1 className={`text-sm font-black ${accentColor} uppercase tracking-[0.2em] text-center`}>
            Resumen {isApartments ? 'Apartamento' : 'Casa'} a Reservar
          </h1>
        </div>

        <div className="relative h-[40vh]">
          <img src={selectedModel?.image} alt={selectedModel?.name} className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6">
            <button onClick={handleBack} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute bottom-6 right-6">
             <button 
               onClick={() => setIsPlanModalOpen(true)}
               className={`w-12 h-12 rounded-full ${accentBg} text-white flex items-center justify-center shadow-xl border-4 border-white/20 active:scale-95 transition-transform`}
             >
               <Maximize2 className="w-6 h-6" />
             </button>
          </div>
        </div>

        <div className="p-8 -mt-10 bg-surface rounded-[4rem] relative z-10 flex-grow shadow-t-xl overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">
               {selectedSector?.name}
            </span>
            <span className={`px-3 py-1 ${isApartments ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'} text-[9px] font-black uppercase tracking-widest rounded-full`}>
               {isApartments ? 'Unidad' : 'Lote'} {selectedUnit?.label}
            </span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">
               {isApartments ? selectedLevel?.name : selectedTorre?.label}
            </span>
          </div>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-[32px] font-black text-primary leading-tight tracking-tight uppercase">{selectedModel?.name}</h2>
            <div className={`text-2xl font-black ${accentColor}`}>{selectedModel?.price}</div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className={`p-4 bg-white/50 border ${isApartments ? 'border-accent/10' : 'border-primary/10'} rounded-2xl text-center`}>
              <p className="text-[8px] font-black text-secondary uppercase tracking-widest mb-1 opacity-60">Área</p>
              <p className="text-sm font-black text-primary">{selectedModel?.area}</p>
            </div>
            <div className={`p-4 bg-white/50 border ${isApartments ? 'border-accent/10' : 'border-primary/10'} rounded-2xl text-center`}>
              <p className="text-[8px] font-black text-secondary uppercase tracking-widest mb-1 opacity-60">Cuartos</p>
              <p className="text-sm font-black text-primary">{selectedModel?.bedrooms}</p>
            </div>
            <div className={`p-4 bg-white/50 border ${isApartments ? 'border-accent/10' : 'border-primary/10'} rounded-2xl text-center`}>
              <p className="text-[8px] font-black text-secondary uppercase tracking-widest mb-1 opacity-60">Baños</p>
              <p className="text-sm font-black text-primary">{selectedModel?.bathrooms}</p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            {selectedModel?.description?.split(',').map((f, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className={`w-2.5 h-2.5 rounded-full ${accentBg} shrink-0`} />
                <span className="text-[20px] font-black text-primary opacity-90 tracking-tight leading-tight">{f.trim()}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              trackSelection('unit_detail', selectedUnit?.id ?? 'sin_unidad', {
                label: selectedUnit?.label,
                display: selectedUnit?.label,
                property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                sector: selectedSector?.id,
                tower_or_block: selectedTorre?.id,
                level: selectedLevel?.id,
                model: selectedModel?.id,
                selection_type: isApartments ? 'unidad' : 'lote',
                action: 'iniciar_pre_reserva'
              });
              navigateTo('reservation_form', 9);
            }}
            className="w-full py-5 rounded-2xl bg-black text-white font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            INICIAR PRE-RESERVA <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <ImageModal 
          isOpen={isPlanModalOpen} 
          onClose={() => setIsPlanModalOpen(false)}
          title="Planta Arquitectónica"
          imageUrl={selectedModel?.planImage}
          message="Visualización técnica del modelo seleccionado."
        />
      </motion.div>
    );
  };

  const ReservationFormScreen = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const isApartments = selectedType === 'apartamentos';
    const accentColor = isApartments ? 'text-accent' : 'text-primary';
    const accentBg = isApartments ? 'bg-accent' : 'bg-primary';

    if (isSuccess) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <div className={`w-24 h-24 rounded-full ${accentBg} flex items-center justify-center text-white mb-8 shadow-2xl`}>
            <Check className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-primary mb-4 uppercase tracking-tight">Intención Registrada</h2>
          <p className="text-secondary font-medium text-sm leading-relaxed mb-8">
            Miguel, hemos recibido tu interés en el <strong>{selectedModel?.name} ({isApartments ? 'Unidad' : 'Lote'} {selectedUnit?.label})</strong>. Un asesor te contactará en breve para formalizar el proceso.
          </p>
          <button 
            onClick={() => navigateTo('welcome', 1)}
            className="amena-btn amena-btn-dark"
          >
            VOLVER AL INICIO
          </button>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8"
      >
        <BackButton />
        <PostReservationStepBadge current={1} />
        <h2 className={`text-[32px] font-black ${accentColor} leading-none mb-4 tracking-tight uppercase`}>
          Confirma tu Interés
        </h2>
        <p className="text-secondary font-medium text-sm leading-snug mb-8">
          Estás a un paso de completar tu selección demo en Proyecto de Empresa Demo. Revisa el resumen.
        </p>

        <div className="bg-[#f7f2eb] p-10 rounded-[2.5rem] border border-[#e8dfd1] mb-10 shadow-md">
           <div className="flex flex-col gap-5">
             <p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
               <span className="text-[11px] opacity-60 uppercase">Tipo:</span> <span className="text-lg font-black">{isApartments ? 'APARTAMENTOS' : 'CASAS'}</span>
             </p>

        <p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
              <span className="text-[11px] opacity-60 uppercase">Sector:</span>
              <span className="text-lg font-black">{selectedSector?.name}</span>
            </p>
          
     
        {isApartments ? (
               <>
                 <p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
                   <span className="text-[11px] opacity-60 uppercase">Torre:</span> <span className="text-lg font-black">{selectedTorre?.label}</span>
                 </p>
                 <p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
                   <span className="text-[11px] opacity-60 uppercase">Nivel:</span> <span className="text-lg font-black">{selectedLevel?.name}</span>
                 </p>
               </>
             ) : (
               <p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
                 <span className="text-[11px] opacity-60 uppercase">Manzana:</span> <span className="text-lg font-black">{selectedTorre?.label}</span>
               </p>
             )}
<p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
  <span className="text-[11px] opacity-60 uppercase">Modelo:</span>
  <span className="text-lg font-black">{selectedModel?.name}</span>
</p>

<p className="text-[14px] font-black text-primary uppercase tracking-widest flex justify-between items-center">
  <span className="text-[11px] opacity-60 uppercase">Lote:</span>
  <span className="text-lg font-black">{selectedUnit?.label}</span>
</p>             

<div className="h-px bg-primary/20 w-full my-4" />
             <div className="flex justify-between items-center">
               <span className="text-sm font-black text-secondary uppercase opacity-60">Monto Estimado</span>
               <span className={`text-3xl font-black ${accentColor}`}>{selectedModel?.price}</span>
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-sm font-bold text-secondary uppercase tracking-widest opacity-80 italic">Al confirmar, registraremos esta selección dentro del escenario demostrativo.</p>
          </div>
          <button 
            onClick={() => {
              trackSelection('confirmation', selectedUnit?.id ?? 'sin_unidad', {
                label: selectedUnit?.label,
                display: selectedUnit?.label,
                property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                sector: selectedSector?.id,
                tower_or_block: selectedTorre?.id,
                level: selectedLevel?.id,
                model: selectedModel?.id,
                selection_type: isApartments ? 'unidad' : 'lote',
                action: 'confirmar_seleccion'
              });
              setPostReservationStatus(initialPostReservationStatus);
              navigateTo('next_steps_instructions', 10);
            }}
            className={`w-full py-8 rounded-[2rem] ${accentBg} text-white font-black uppercase text-xl tracking-widest shadow-2xl active:scale-95 transition-transform`}
          >
            CONFIRMAR SELECCIÓN
          </button>
        </div>
      </motion.div>
    );
  };

  const FurtherStepsScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-32"
    >
      <BackButton />
      <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-6 tracking-tight uppercase">
        Tu siguiente paso con H-Operia
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-10 opacity-80">
        Ya registramos tu pre reserva. Ahora elige cómo deseas continuar para recibir atención y acompañamiento.
      </p>

      <div className="space-y-4">
        {[
          { id: 'next_steps_instructions', step: 11, label: 'Instrucciones: Próximos Pasos. Revisa los documentos, análisis financiero y compromisos necesarios para avanzar con pasos firmes en tu pre reserva.' },
          { id: 'user_comments', step: 12, label: 'Comentarios del Interesado. Comparte tus dudas, situaciones específicas o archivos para recibir un análisis inteligente y seguimiento personalizado.' },
          { id: 'acompanamiento_amena', step: 14, label: 'Acompañamiento Inteligente. Accede a un espacio privado para conversar con Marta por texto o voz, agendar un momento cómodo o recibir acceso flexible por correo electrónico.' },
          { id: 'visit_schedule', step: 16, label: 'Agenda una cita para visitar el proyecto de construcción o para ser atendido en nuestras oficinas de ventas en el momento disponible que mejor te convenga.' }
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => {
              trackSelection('post_reservation_cta', item.id, {
                label: item.label,
                display: item.label,
                property_type: selectedType === 'apartamentos' ? 'apartamento' : 'casa',
                sector: selectedSector?.id,
                tower_or_block: selectedTorre?.id,
                level: selectedLevel?.id,
                model: selectedModel?.id,
                unit_or_lot: selectedUnit?.id,
                selection_type: selectedType === 'apartamentos' ? 'unidad' : 'lote',
                target_screen: item.id,
                target_step: item.step
              });
              navigateTo(item.id as Screen, item.step);
            }}
            className="w-full p-8 bg-white border-[4px] border-accent hover:border-accent shadow-xl rounded-3xl text-left active:scale-[0.98] transition-all group"
          >
            <p className="text-[18px] font-black text-primary leading-tight tracking-tight group-hover:text-accent transition-colors">
              {item.label}
            </p>
          </button>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className="w-full py-6 mt-12 rounded-2xl border-2 border-primary/20 text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5 transition-all"
      >
        CERRAR SESIÓN
      </button>
    </motion.div>
  );

  const NextStepsInstructionsScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-32"
    >
      <BackButton />
      <PostReservationStepBadge current={2} />
      <ReservationContinuityBadge />
      <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
        Instrucciones post-reserva
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
        Antes de continuar, revisa estas indicaciones para mantener tu pre reserva ordenada y avanzar con pasos firmes.
      </p>
      
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-[2rem] border border-accent/10 shadow-sm">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Interacciones generales / comunicación
          </h3>
          <ul className="space-y-3">
            <li className="text-[13px] font-bold text-primary/75 flex gap-2 leading-snug">
              <Check className="w-4 h-4 text-accent shrink-0" /> Es vital tu compromiso en la atención de llamadas, WhatsApp y correos electrónicos para mantener la fluidez del proceso.
            </li>
            <li className="text-[13px] font-bold text-primary/75 flex gap-2 leading-snug">
              <Check className="w-4 h-4 text-accent shrink-0" /> Solicitaremos referencias de instituciones financieras, comercios, laborales y personales para completar tu perfil.
            </li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2rem] border border-accent/10 shadow-sm">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Documentos
          </h3>
          <p className="text-[14px] font-medium text-secondary leading-snug mb-3">
            Preparación de la documentación legal y personal requerida para formalizar tu proceso de pre reserva.
          </p>
          <p className="text-[13px] font-bold text-primary/70 flex gap-2 leading-snug">
            <Check className="w-4 h-4 text-accent shrink-0" /> Gestión de documentos y calendario de entrega.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2rem] border border-accent/10 shadow-sm">
          <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Pagos y gestiones
          </h3>
          <div className="space-y-3">
            <p className="text-[14px] font-medium text-secondary leading-snug italic">
              Análisis profundo de tu realidad financiera para avanzar con pasos firmes.
            </p>
            <ul className="space-y-2">
              <li className="text-[13px] font-bold text-primary/70 flex gap-2 leading-snug">
                <Check className="w-4 h-4 text-accent shrink-0" /> Planificación de desembolsos económicos.
              </li>
              <li className="text-[13px] font-bold text-primary/70 flex gap-2 leading-snug">
                <Check className="w-4 h-4 text-accent shrink-0" /> Evaluación detallada de condiciones crediticias y proyecciones de inversión.
              </li>
              <li className="text-[13px] font-bold text-primary/70 flex gap-2 leading-snug">
                <Check className="w-4 h-4 text-accent shrink-0" /> Tiempo concedido para realizar todas las gestiones solicitadas.
              </li>
            </ul>
            <div className="p-3 bg-accent/5 rounded-xl border border-accent/10">
              <p className="text-[11px] font-bold text-accent italic">
                * Las extensiones de este período son excepcionales y se evaluarán según las circunstancias documentadas.
              </p>
            </div>
          </div>
        </section>
      </div>

      <button
        onClick={() => {
          setPostReservationStatus((current) => ({ ...current, instructionsAcknowledged: true }));
          trackPostReservationEvent('post_reservation_instructions_completed', {
            next_required_step: 'user_comments',
          });
          navigateTo('user_comments', 11);
        }}
        className="w-full mt-10 py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
      >
        CONTINUAR <ArrowRight className="w-6 h-6" />
      </button>
    </motion.div>
  );

  const UserCommentsScreen = () => {
    const [blocks, setBlocks] = useState<{ title: string; text: string; attachments: string[] }[]>([
      { title: '', text: '', attachments: [] }
    ]);
    const [isRefining, setIsRefining] = useState(false);
    const [commentsChoice, setCommentsChoice] = useState<'yes' | null>(null);

    const addBlock = () => {
      setBlocks([...blocks, { title: '', text: '', attachments: [] }]);
    };

    const updateBlock = (index: number, field: 'title' | 'text', value: string) => {
      const newBlocks = [...blocks];
      newBlocks[index][field] = value;
      setBlocks(newBlocks);
    };

    const handleFileUpload = (index: number) => {
      const newBlocks = [...blocks];
      const mockFiles = ['documento.pdf', 'imagen_referencia.png', 'referencia.xlsx'];
      const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      newBlocks[index].attachments = [...newBlocks[index].attachments, randomFile];
      setBlocks(newBlocks);
    };

    const buildRefinementResult = (submittedBlocks: typeof blocks) => {
      const rawText = submittedBlocks
        .map((block) => `${block.title} ${block.text}`.trim())
        .filter(Boolean)
        .join(' ');
      const normalizedText = rawText.toLowerCase();
      const mentionsParking = /garage|garaje|pickup|pick up|carro|vehiculo|vehículo|parqueo|estacionar|ampliar|ampliacion|ampliación|maniobrar|techo|sombra/.test(normalizedText);
      const hasComments = submittedBlocks.length > 0;

      const parkingRecommendations = [
        'Podrías aclarar si necesitas espacio adicional solo para estacionar o también para maniobrar con el pickup cargado.',
        'Puedes preguntar si existe alguna alternativa de sombra, techo o protección para el área de parqueo.',
        'Conviene indicar si el segundo vehículo requiere acceso diario o solo espacio ocasional.',
        'Puedes pedir que el asesor confirme qué ampliaciones son técnicamente posibles y cuáles requieren revisión del proyecto.',
      ];

      const generalRecommendations = [
        'Puedes separar tu comentario entre lo que necesitas confirmar, lo que te preocupa y lo que deseas solicitar.',
        'Conviene indicar qué punto es más urgente para que el asesor lo revise primero.',
        'Puedes reformular cualquier expectativa como pregunta para revisión humana, evitando asumir aprobación automática.',
        'Si hay documentos o referencias, puedes mencionar qué parte quieres que el equipo tome en cuenta.',
      ];

      const observations = hasComments
        ? mentionsParking ? parkingRecommendations : generalRecommendations
        : ['No agregaste comentarios en este paso. Puedes continuar al mapa de Acompañamiento Inteligente.'];

      const prompts = mentionsParking
        ? [
            '¿El pickup necesita entrar cargado todos los días o solo en ocasiones específicas?',
            '¿La prioridad es ampliar espacio, mejorar maniobra o proteger los vehículos?',
            '¿Quieres que el asesor revise alternativas permitidas antes de confirmar una expectativa?',
          ]
        : [
            '¿Qué punto necesitas que el asesor revise primero?',
            '¿Qué información te falta para sentirte más tranquilo?',
            '¿Hay alguna expectativa que convenga convertir en pregunta para revisión humana?',
          ];

      const draft = mentionsParking
        ? 'Necesito revisar si existe alguna alternativa para ampliar o adaptar el área de parqueo. Tenemos un pickup grande que a veces permanece cargado y también un carro pequeño. Me gustaría saber si hay opciones para estacionar y maniobrar mejor, si puede considerarse sombra o protección, y qué ampliaciones serían técnicamente posibles o requerirían revisión del proyecto.'
        : rawText
          ? `Quisiera que el asesor revise estos puntos: ${rawText}`
          : '';

      return {
        blocks: submittedBlocks,
        summary: hasComments
          ? 'Marta preparó sugerencias para que tus comentarios lleguen más claros al asesor.'
          : 'Puedes continuar con la información registrada durante tu reserva.',
        observations,
        prompts,
        draft,
        advisorNotes: [
          'El asesor humano revisará la versión final dentro del expediente único.',
          'H-OperIA Intelligence puede apoyar la organización de señales, prioridades y contexto.',
          'Ninguna sugerencia implica aprobación, promesa, negociación o compromiso del proyecto.',
        ],
      };
    };

    const continueWithoutComments = () => {
      setAnalysisResult(null);
      trackPostReservationEvent('comments_skipped', {
        next_required_step: 'accompaniment_map',
      });
      navigateTo('acompanamiento_amena', 12);
    };

    const runRefinement = () => {
      const submittedBlocks = blocks.filter((block) =>
        block.title.trim() || block.text.trim() || block.attachments.length > 0
      );

      setIsRefining(true);
      setTimeout(() => {
        setIsRefining(false);
        setAnalysisResult(buildRefinementResult(submittedBlocks));
        trackPostReservationEvent('comments_refinement_completed', {
          comments_blocks: submittedBlocks.length,
          next_required_step: 'accompaniment_map',
        });
        navigateTo('analysis_report', 13);
      }, 900);
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={3} />
        <ReservationContinuityBadge />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-2 tracking-tight uppercase">
          Comentarios del interesado
        </h2>
        <p className="text-secondary font-bold text-sm mb-8 opacity-80 leading-snug">
          Puedes agregar dudas, situaciones o documentos para preparar mejor tu expediente. No pediremos correo ni datos adicionales aquí.
        </p>

        {!commentsChoice && (
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
              <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Antes de comentar</span>
              <h3 className="text-[22px] font-black text-primary leading-tight mb-4">
                Marta te ayuda a ordenar, no a aprobar
              </h3>
              <div className="space-y-3 mb-6">
                <p className="text-[14px] font-bold text-secondary/85 leading-snug">
                  Marta no vende, no negocia, no promete, no concede solicitudes y no asume compromisos. Tampoco sustituye al asesor humano.
                </p>
                <p className="text-[14px] font-bold text-secondary/85 leading-snug">
                  Su función es ayudarte a convertir ideas, dudas e intereses en preguntas y requerimientos más claros para tu expediente único.
                </p>
                <p className="text-[14px] font-bold text-secondary/85 leading-snug">
                  El asesor humano y el equipo comercial revisarán después la información. H-OperIA Intelligence puede apoyar internamente organizando señales, prioridades y contexto.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 mb-6">
                <p className="text-[13px] font-black text-accent leading-snug">
                  Si planteas una expectativa que el proyecto no puede confirmar, Marta ayudará a reformularla como pregunta o requerimiento para revisión humana.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setCommentsChoice('yes')}
                  className="w-full py-5 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform"
                >
                  Sí, deseo agregar comentarios
                </button>
                <button
                  onClick={continueWithoutComments}
                  className="w-full py-5 rounded-2xl border-2 border-primary/15 text-primary font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
                >
                  No deseo agregar comentarios ahora
                </button>
              </div>
            </section>
          </div>
        )}

        {commentsChoice === 'yes' && (
          <div className="space-y-6">
            <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
              <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Refinamiento inteligente</span>
              <h3 className="text-[22px] font-black text-primary leading-tight mb-3">
                Cuéntanos qué quieres ordenar mejor
              </h3>
              <p className="text-[14px] font-bold text-secondary/80 leading-snug">
                Escribe dudas, intereses, necesidades o situaciones que quieras dejar mejor preparadas para el seguimiento humano.
              </p>
            </section>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={index} className="bg-white p-8 rounded-[2.5rem] border border-accent/5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full">Bloque {index + 1}</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={block.title}
                      onChange={(e) => updateBlock(index, 'title', e.target.value)}
                      placeholder="Tema del comentario"
                      className="w-full text-2xl font-black text-primary bg-transparent border-none outline-none placeholder:text-primary/25"
                    />
                    <div className="h-px bg-primary/10 w-16 mt-2" />
                  </div>

                  <textarea
                    value={block.text}
                    onChange={(e) => updateBlock(index, 'text', e.target.value)}
                    placeholder="Escribe tus dudas, intereses, necesidades o situaciones que quisieras que el equipo tenga presentes..."
                    className="w-full h-32 text-base font-bold text-secondary bg-transparent border-none outline-none resize-none placeholder:text-secondary/35 leading-snug"
                  />

                  <div className="pt-4 border-t border-primary/5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {block.attachments.map((file, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                          <Paperclip className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-bold text-primary">{file}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleFileUpload(index)}
                      className="flex items-center gap-2 text-accent font-black text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity"
                    >
                      <Upload className="w-4 h-4" /> Adjuntar referencia
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addBlock}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-accent/20 text-accent font-black uppercase text-xs tracking-widest hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar otro comentario
            </button>

            <button
              onClick={runRefinement}
              disabled={isRefining}
              className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
            >
              {isRefining ? (
                <>Ordenando información... <RefreshCw className="w-6 h-6 animate-spin" /></>
              ) : (
                <>MEJORAR MIS COMENTARIOS <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const AnalysisReportScreen = () => {
    const [finalComments, setFinalComments] = useState(() => analysisResult?.draft ?? '');
    const [finalCommentsSubmitted, setFinalCommentsSubmitted] = useState(false);

    if (!analysisResult) {
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 pb-32">
          <BackButton />
          <PostReservationStepBadge current={4} />
          <ReservationContinuityBadge />
          <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
            <h2 className="text-[28px] font-black text-accent leading-tight mb-4 uppercase">No hay refinamiento pendiente</h2>
            <p className="text-[15px] font-bold text-secondary/80 leading-snug mb-6">
              Puedes regresar a comentarios o continuar directamente al mapa de Acompañamiento Inteligente.
            </p>
            <div className="space-y-3">
              <button onClick={() => navigateTo('user_comments', 11)} className="w-full py-5 rounded-2xl border-2 border-primary/15 text-primary font-black uppercase text-xs tracking-widest active:scale-95 transition-transform">
                Volver a comentarios
              </button>
              <button onClick={() => navigateTo('acompanamiento_amena', 12)} className="w-full py-5 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform">
                Continuar a Acompañamiento Inteligente
              </button>
            </div>
          </section>
        </motion.div>
      );
    }

    const submitFinalComments = () => {
      setFinalCommentsSubmitted(true);
      trackPostReservationEvent('comments_final_version_submitted', {
        final_comments_present: Boolean(finalComments.trim()),
        next_required_step: 'accompaniment_map',
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={4} />
        <ReservationContinuityBadge />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-3 tracking-tight uppercase">
          Ordenemos mejor tus comentarios
        </h2>
        <p className="text-secondary font-bold text-base leading-snug mb-8 opacity-85">
          Marta te ayuda a mejorar lo que quieres pedir o aclarar antes de continuar.
        </p>

        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">Refinamiento práctico</span>
            <h3 className="text-[22px] font-black text-primary leading-tight mb-4">Observaciones útiles</h3>
            <p className="text-[15px] font-bold text-secondary leading-snug mb-5">
              {analysisResult.summary}
            </p>
            <div className="space-y-3">
              {analysisResult.observations.map((point: string) => (
                <div key={point} className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[13px] font-black text-primary leading-snug">{point}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">Preguntas que pueden aclararse</span>
            <div className="space-y-3">
              {analysisResult.prompts.map((item: string) => (
                <p key={item} className="text-[14px] font-bold text-secondary leading-snug flex gap-3">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {item}
                </p>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">Redacta tu versión final</span>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug mb-5">
              Ajusta el texto para que el asesor reciba tus comentarios de forma clara. Marta ayuda a ordenar, no a aprobar ni prometer viabilidad.
            </p>
            <textarea
              value={finalComments}
              onChange={(event) => {
                setFinalComments(event.target.value);
                setFinalCommentsSubmitted(false);
              }}
              className="w-full min-h-[180px] p-5 rounded-2xl border-2 border-primary/10 focus:border-accent outline-none text-[15px] font-bold text-secondary leading-snug resize-none"
              placeholder="Escribe aquí la versión final de tus comentarios..."
            />
            <button
              onClick={submitFinalComments}
              disabled={!finalComments.trim()}
              className="w-full mt-5 py-5 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
            >
              Enviar comentarios finales al expediente
            </button>
            {finalCommentsSubmitted && (
              <div className="mt-5 p-4 rounded-2xl bg-accent/5 border border-accent/10">
                <p className="text-[13px] font-black text-accent text-center leading-snug">
                  Recibimos tus comentarios finales. Quedarán incorporados a tu expediente para que el asesor y el equipo comercial puedan revisarlos antes del seguimiento.
                </p>
              </div>
            )}
          </section>

          <section className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1]">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">Puntos útiles para el asesor</h4>
            <div className="space-y-2">
              {analysisResult.advisorNotes.map((item: string) => (
                <p key={item} className="text-[13px] font-bold text-primary/80 leading-snug">{item}</p>
              ))}
            </div>
          </section>

          {finalCommentsSubmitted && (
            <button
              onClick={() => {
                trackPostReservationEvent('comments_refinement_confirmed', {
                  next_required_step: 'accompaniment_map',
                });
                navigateTo('acompanamiento_amena', 12);
              }}
              className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform mt-8"
            >
              CONTINUAR A ACOMPAÑAMIENTO INTELIGENTE <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </motion.div>
    );
  };
  const AcompanamientoAmenaScreen = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={5} />
        <ReservationContinuityBadge />

        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
          Acompañamiento Inteligente
        </h2>
        <p className="text-secondary font-black text-[22px] leading-tight mb-3">
          ¿Cómo prefieres continuar tu proceso?
        </p>
        <p className="text-[14px] font-bold text-secondary/70 leading-snug mb-8">
          Puedes elegir una o varias opciones. Siempre podrás regresar a este mapa para continuar por otra vía.
        </p>

        <div className="space-y-6">
          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Ruta digital asistida</span>
            <h3 className="text-[24px] font-black text-primary leading-none mb-3 uppercase">Continuar con Marta</h3>
            <p className="text-[14px] font-bold text-secondary/75 leading-snug mb-5">
              Marta es nuestra asistente virtual basada en inteligencia artificial. Es un único agente multicanal: texto, voz y futuro espacio web privado alimentan el mismo expediente.
            </p>
            <div className="space-y-3">
              <button onClick={() => navigateTo('marta_now_detail', 12)} className="w-full p-5 rounded-2xl bg-primary text-white text-left font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform">
                Conversar ahora con Marta
              </button>
              <button onClick={() => navigateTo('marta_schedule_detail', 12)} className="w-full p-5 rounded-2xl bg-accent/10 text-accent text-left font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform">
                Agendar una llamada con Marta
              </button>
              <button onClick={() => navigateTo('marta_link_detail', 12)} className="w-full p-5 rounded-2xl bg-accent/10 text-accent text-left font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform">
                Solicitar enlace para conversar con Marta después
              </button>
              <p className="text-[12px] font-bold text-secondary/65 leading-snug px-1">
                El enlace permanente al futuro espacio web de Marta formará parte del WhatsApp consolidado al finalizar el recorrido de acompañamiento.
              </p>
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Ruta con equipo humano</span>
            <h3 className="text-[24px] font-black text-primary leading-none mb-3 uppercase">Continuar con un asesor</h3>
            <p className="text-[14px] font-bold text-secondary/75 leading-snug mb-5">
              Si prefieres atención humana, puedes continuar con el equipo comercial. Estas opciones preparan el siguiente contacto sin redirigirte automáticamente a oficina de ventas.
            </p>
            <div className="space-y-3">
              <button onClick={() => navigateTo('advisor_call_detail', 12)} className="w-full p-5 rounded-2xl bg-accent/10 text-accent text-left font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform">
                Solicitar llamada con un asesor
              </button>
              <button onClick={() => navigateTo('advisor_office_detail', 12)} className="w-full p-5 rounded-2xl bg-accent/10 text-accent text-left font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform">
                Agendar visita a oficinas de ventas
              </button>
              <button onClick={() => navigateTo('advisor_visit_detail', 12)} className="w-full p-5 rounded-2xl bg-accent/10 text-accent text-left font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform">
                Agendar visita acompañada al proyecto
              </button>
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Continuidad del proceso</span>
            <p className="text-[13px] font-bold text-secondary/75 leading-snug">
No habrá WhatsApp parciales. Mantendremos un solo expediente y el mensaje consolidado llegará al final del recorrido, con resumen, próximos pasos y enlace permanente a Marta.
            </p>
          </section>
        </div>

        <button
          onClick={() => navigateTo('accompaniment_summary', 13)}
          className="w-full py-6 mt-8 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
        >
          Revisar resumen de acompañamiento
        </button>
      </motion.div>
    );
  };

  type AccompanimentDetailConfig = {
    eyebrow: string;
    title: string;
    body: string;
    actionLabel: string;
    onAction: (schedule?: { date: string; time: string }) => void;
    mode?: 'instant' | 'calendar';
    highlights?: string[];
    note?: string;
    confirmationMessage?: string;
  };

  const AccompanimentDetailScreen = ({ config }: { config: AccompanimentDetailConfig }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
    const requiresCalendar = config.mode === 'calendar';
    const canConfirmCalendar = !requiresCalendar || (scheduleDate && scheduleTime);

    const handlePrimaryAction = () => {
      if (requiresCalendar && !showCalendar) {
        setShowCalendar(true);
        setConfirmationMessage(null);
        return;
      }

      if (!canConfirmCalendar) return;

      config.onAction(requiresCalendar ? { date: scheduleDate, time: scheduleTime } : undefined);
      setConfirmationMessage(config.confirmationMessage ?? 'Recibimos tu preferencia para seguimiento posterior.');
    };

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 pb-32">
        <BackButton />
        <PostReservationStepBadge current={5} />
        <ReservationContinuityBadge />

        <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm mb-6">
          <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">{config.eyebrow}</span>
          <h2 className="text-[30px] font-black text-accent leading-[1.05] mb-5 tracking-tight uppercase">{config.title}</h2>
          <p className="text-[15px] font-bold text-secondary leading-snug mb-5">{config.body}</p>

          {config.highlights && (
            <div className="space-y-3 mb-6">
              {config.highlights.map((highlight) => (
                <div key={highlight} className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[13px] font-black text-primary leading-snug">{highlight}</p>
                </div>
              ))}
            </div>
          )}

          {config.note && (
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 mb-6">
              <p className="text-[12px] font-black text-accent leading-snug">{config.note}</p>
            </div>
          )}

          {showCalendar && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-6 pt-5 border-t border-primary/10">
              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Día preferido</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-primary/10 focus:border-accent outline-none font-bold text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Hora preferida</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(event) => setScheduleTime(event.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-primary/10 focus:border-accent outline-none font-bold text-primary"
                />
              </div>
            </motion.div>
          )}

          <button
            onClick={handlePrimaryAction}
            disabled={showCalendar && !canConfirmCalendar}
            className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
          >
            {showCalendar ? 'Confirmar preferencia' : config.actionLabel}
          </button>

          {confirmationMessage && (
            <div className="mt-5 p-4 rounded-2xl bg-accent/5 border border-accent/10">
              <p className="text-[13px] font-black text-accent text-center leading-snug">{confirmationMessage}</p>
            </div>
          )}
        </section>

        <button onClick={() => navigateTo('acompanamiento_amena', 12)} className="w-full py-5 rounded-2xl border-2 border-primary/15 text-primary font-black uppercase text-xs tracking-widest active:scale-95 transition-transform">
          Volver al mapa
        </button>
      </motion.div>
    );
  };

  const MartaNowDetailScreen = () => (
    <AccompanimentDetailScreen
      config={{
        eyebrow: 'Marta · texto o voz',
        title: 'Conversar ahora con Marta',
        body: 'Marta te ayuda a ordenar lo importante antes del seguimiento humano.',
        highlights: [
          'Recoge tus dudas, intereses y requerimientos.',
          'Todo se incorpora al expediente único del cliente.',
          'El asesor asignado y el equipo comercial podrán retomarlo después, sin que repitas información.',
        ],
        note: 'Marta no vende, no negocia, no promete resultados y no asume compromisos.',
        actionLabel: 'Iniciar conversación con Marta',
        onAction: () => {
          martaScheduleDraftOpen.current = false;
          setPostReservationStatus((current) => ({ ...current, martaContactPreference: 'talk_now' }));
          trackPostReservationEvent('marta_contact_selected', {
            marta_contact_preference: 'talk_now',
            next_required_step: 'accompaniment_map',
          });
          registerAccompanimentSelection({
            route: 'marta',
            label: 'Conversar ahora con Marta',
            detail: 'Preferencia registrada para conversación inmediata con Marta.',
          });
          (window as any).conectarVapi?.();
        },
      }}
    />
  );

  const MartaScheduleDetailScreen = () => (
    <AccompanimentDetailScreen
      config={{
        eyebrow: 'Marta · llamada programada',
        title: 'Agendar una llamada con Marta',
        body: 'Elige un día y hora preferidos para continuar con Marta por llamada.',
        note: 'Usaremos los datos registrados durante tu reserva. No pediremos correo, teléfono ni WhatsApp nuevamente.',
        actionLabel: 'Agendar llamada',
        mode: 'calendar',
        confirmationMessage: 'Recibimos tu preferencia de día y hora. La usaremos para seguimiento posterior dentro del mismo expediente.',
        onAction: (schedule) => {
          martaScheduleDraftOpen.current = true;
          registerAccompanimentSelection({
            route: 'marta',
            label: 'Agendar una llamada con Marta',
            detail: formatScheduleDetail(schedule),
          });
          setPostReservationStatus((current) => ({ ...current, martaContactPreference: 'schedule_call' }));
          trackPostReservationEvent('marta_contact_selected', {
            marta_contact_preference: 'schedule_call',
            next_required_step: 'accompaniment_map',
          });
        },
      }}
    />
  );

  const MartaLinkDetailScreen = () => (
    <AccompanimentDetailScreen
      config={{
        eyebrow: 'Marta · enlace permanente',
        title: 'Solicitar enlace para después',
        body: 'El enlace te permitirá retomar posteriormente tu espacio privado con Marta.',
        note: 'No es una confirmación parcial de WhatsApp. El recorrido mantiene un solo expediente y el mensaje consolidado llegará al final.',
        actionLabel: 'Enviar enlace a mi WhatsApp',
        confirmationMessage: 'Recibimos la solicitud del enlace. Se integrará al WhatsApp consolidado del recorrido.',
        onAction: () => {
          registerAccompanimentSelection({
            route: 'marta',
            label: 'Solicitar enlace para conversar con Marta después',
            detail: 'El enlace permanente a Marta se integrará al mensaje final del recorrido.',
          });
          setPostReservationStatus((current) => ({ ...current, martaContactPreference: 'whatsapp_link' }));
          trackPostReservationEvent('marta_contact_selected', {
            marta_contact_preference: 'whatsapp_link',
            next_required_step: 'accompaniment_map',
          });
        },
      }}
    />
  );

  const AdvisorCallDetailScreen = () => (
    <AccompanimentDetailScreen
      config={{
        eyebrow: 'Asesor · llamada',
        title: 'Solicitar llamada con un asesor',
        body: 'Elige el día y hora en que prefieres recibir una llamada del asesor.',
        note: 'Después llegará el WhatsApp consolidado del recorrido con resumen y próximos pasos.',
        actionLabel: 'Solicitar llamada',
        mode: 'calendar',
        confirmationMessage: 'Recibimos tu preferencia de día y hora. La trasladaremos a un asesor para que pueda contactarte posteriormente.',
        onAction: (schedule) => {
          registerAccompanimentSelection({
            route: 'advisor',
            label: 'Solicitar llamada con un asesor',
            detail: formatScheduleDetail(schedule),
          });
          trackPostReservationEvent('human_advisor_option_selected', {
            advisor_contact_preference: 'advisor_call',
            next_required_step: 'accompaniment_map',
          });
        },
      }}
    />
  );

  const AdvisorOfficeDetailScreen = () => (
    <AccompanimentDetailScreen
      config={{
        eyebrow: 'Asesor · oficinas de ventas',
        title: 'Agendar visita a oficinas de ventas',
        body: 'Elige un día y hora preferidos para visitar las oficinas de ventas.',
        note: 'La preferencia será trasladada al equipo comercial. No abriremos una ruta automática fuera del mapa.',
        actionLabel: 'Agendar visita',
        mode: 'calendar',
        confirmationMessage: 'Recibimos tu preferencia de visita. La trasladaremos al equipo comercial para seguimiento posterior.',
        onAction: (schedule) => {
          registerAccompanimentSelection({
            route: 'advisor',
            label: 'Agendar visita a oficinas de ventas',
            detail: formatScheduleDetail(schedule),
          });
          trackPostReservationEvent('human_advisor_option_selected', {
            advisor_contact_preference: 'sales_office_visit',
            next_required_step: 'accompaniment_map',
          });
        },
      }}
    />
  );

  const AdvisorVisitDetailScreen = () => (
    <AccompanimentDetailScreen
      config={{
        eyebrow: 'Asesor · visita al proyecto',
        title: 'Agendar visita acompañada al proyecto',
        body: 'Elige un día y hora preferidos para conocer el proyecto con acompañamiento del equipo.',
        note: 'La preferencia será trasladada al equipo comercial. El expediente se mantiene unido para seguimiento humano.',
        actionLabel: 'Agendar visita',
        mode: 'calendar',
        confirmationMessage: 'Recibimos tu preferencia de visita acompañada. La trasladaremos al equipo comercial para seguimiento posterior.',
        onAction: (schedule) => {
          registerAccompanimentSelection({
            route: 'advisor',
            label: 'Agendar visita acompañada al proyecto',
            detail: formatScheduleDetail(schedule),
          });
          trackPostReservationEvent('human_advisor_option_selected', {
            advisor_contact_preference: 'project_visit',
            next_required_step: 'accompaniment_map',
          });
        },
      }}
    />
  );

  const AccompanimentSummaryScreen = () => {
    const martaSelections = accompanimentSelections.filter((item) => item.route === 'marta');
    const advisorSelections = accompanimentSelections.filter((item) => item.route === 'advisor');
    const finalComments = analysisResult?.finalComments || analysisResult?.draft || 'No se agregaron comentarios finales en esta etapa.';
    const refinedRequirements = analysisResult?.observations?.length
      ? analysisResult.observations
      : ['El expediente conserva la información registrada durante la reserva y las preferencias elegidas en el mapa.'];

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 pb-32">
        <BackButton />
        <PostReservationStepBadge current={6} />
        <ReservationContinuityBadge />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">Resumen de tu acompañamiento</h2>
        <p className="text-secondary font-bold text-base leading-snug mb-8 opacity-85">
          Revisa cómo quedó preparado tu expediente antes del cierre del recorrido.
        </p>

        <div className="space-y-6">
          <section className="bg-[#f7f2eb] p-7 rounded-[2rem] border border-[#e8dfd1] shadow-sm">
            <span className="inline-block text-[10px] font-black text-primary uppercase tracking-widest bg-white/70 px-3 py-1 rounded-full mb-4">Reserva activa</span>
            <div className="space-y-3">
              {reservationSummaryItems.map((item) => (
                <p key={item.label} className="text-[14px] font-black text-primary uppercase tracking-tight flex flex-wrap gap-x-2">
                  <span className="opacity-60">{item.label}:</span> {item.value}
                </p>
              ))}
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Expediente preparado</span>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug mb-4">
              El expediente mantiene un solo hilo con tu reserva, comentarios, preferencias de acompañamiento y próximos puntos de seguimiento.
            </p>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-[13px] font-black text-primary leading-snug">Comentarios finales: {finalComments}</p>
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Solicitudes y requerimientos refinados</span>
            <div className="space-y-3">
              {refinedRequirements.map((item: string) => (
                <p key={item} className="text-[13px] font-bold text-secondary leading-snug flex gap-3">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {item}
                </p>
              ))}
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Opciones elegidas con Marta</span>
            <div className="space-y-3">
              {(martaSelections.length ? martaSelections : [{ label: 'Sin opción de Marta confirmada todavía.', detail: 'Puedes volver al mapa si deseas elegir una ruta con Marta.' }]).map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[13px] font-black text-primary leading-snug">{item.label}</p>
                  {item.detail && <p className="text-[12px] font-bold text-secondary/70 leading-snug mt-1">{item.detail}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Opciones elegidas con asesor</span>
            <div className="space-y-3">
              {(advisorSelections.length ? advisorSelections : [{ label: 'Sin opción de asesor confirmada todavía.', detail: 'Puedes volver al mapa si deseas solicitar acompañamiento humano específico.' }]).map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[13px] font-black text-primary leading-snug">{item.label}</p>
                  {item.detail && <p className="text-[12px] font-bold text-secondary/70 leading-snug mt-1">{item.detail}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">El mensaje que recibirás</span>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug">
              Recibirás un único mensaje con el resumen de tu reserva, los comentarios incorporados al expediente, tus preferencias de acompañamiento, próximos pasos y el enlace permanente a Marta.
            </p>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">¿Qué ocurrirá a partir de ahora?</span>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug">
              Tu expediente quedó preparado para revisión humana. Un asesor revisará la información y, cuando la integración correspondiente esté disponible, recibirás un único mensaje con el resumen del recorrido y los próximos pasos.
            </p>
          </section>
        </div>

        <button
          onClick={() => navigateTo('official_closure', 14)}
          className="w-full py-6 mt-8 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
        >
          Confirmar resumen y continuar al cierre
        </button>
      </motion.div>
    );
  };

  const OfficialClosureScreen = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }} className="p-8 pb-32">
      <PostReservationStepBadge current={7} />
      <ReservationContinuityBadge />
      <h2 className="text-[40px] font-black text-accent leading-none mb-6 tracking-tight uppercase">Tu expediente está listo</h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-85">
        Gracias por completar este recorrido. Dejamos preparado un expediente único para que el asesor humano y el equipo comercial puedan darle seguimiento con más contexto.
      </p>

      <div className="space-y-6">
        <section className="bg-white p-8 rounded-[2rem] border border-accent/10 shadow-sm">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-4">Seguimiento humano</h3>
          <p className="text-[14px] font-bold text-secondary/80 leading-snug">
            El asesor revisará tu reserva, tus comentarios finales, las preferencias registradas y los requerimientos refinados antes del siguiente contacto.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-accent/10 shadow-sm">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-4">Apoyo interno de H-OperIA Intelligence</h3>
          <p className="text-[14px] font-bold text-secondary/80 leading-snug">
            H-OperIA Intelligence puede apoyar internamente la organización de señales, prioridades y contexto. La decisión y el seguimiento corresponden al equipo humano.
          </p>
        </section>

        <section className="bg-[#f7f2eb] p-8 rounded-[2rem] border border-[#e8dfd1] shadow-sm">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-4">Mensaje final</h3>
          <p className="text-[14px] font-bold text-primary/80 leading-snug mb-3">
            En esta versión, el frontend deja preparado el cierre del recorrido sin ejecutar un envío real de WhatsApp.
          </p>
          <p className="text-[14px] font-bold text-primary/80 leading-snug">
            Cuando la integración correspondiente esté activa, se enviará automáticamente un único mensaje con el resumen, próximos pasos y enlace permanente a Marta.
          </p>
        </section>

        <section className="bg-white p-8 rounded-[2rem] border border-accent/10 shadow-sm">
          <h3 className="text-xl font-black text-primary uppercase tracking-tight mb-4">Marta seguirá disponible</h3>
          <p className="text-[14px] font-bold text-secondary/80 leading-snug">
            Marta es un único agente multicanal. El enlace permanente formará parte del mensaje final para que puedas retomar tu espacio privado sin cambiar el expediente.
          </p>
        </section>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-6 mt-10 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
      >
        Finalizar recorrido
      </button>
    </motion.div>
  );

  const WhatsAppConfirmationScreen = () => {
    const [hasReceivedWhatsApp, setHasReceivedWhatsApp] = useState(postReservationStatus.whatsappReceiptConfirmed);

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={6} />
      <ReservationContinuityBadge />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
          Confirma tu WhatsApp
        </h2>
        <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
          Para continuar, confirma que recibiste el mensaje de WhatsApp con los detalles relevantes de tu reserva.
        </p>

        <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm mb-8">
          <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">Confirmación obligatoria</span>
          <p className="text-[15px] font-bold text-secondary/80 leading-snug mb-6">
            El mensaje demo debe incluir la referencia, la unidad seleccionada y el siguiente paso ilustrativo.
          </p>
          <label className="flex items-start gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReceivedWhatsApp}
              onChange={(event) => setHasReceivedWhatsApp(event.target.checked)}
              className="mt-1 w-5 h-5 accent-[var(--brand-accent)]"
            />
            <span className="text-[13px] font-black text-primary leading-snug">
              Confirmo que recibí el WhatsApp con los detalles relevantes de mi reserva.
            </span>
          </label>
        </section>

        <button 
          onClick={() => {
            if (!hasReceivedWhatsApp) return;
            setPostReservationStatus((current) => ({ ...current, whatsappReceiptConfirmed: true }));
            trackPostReservationEvent('whatsapp_receipt_confirmed', {
              next_required_step: 'sales_office_appointment',
            });
            navigateTo('office_schedule', 13);
          }}
          disabled={!hasReceivedWhatsApp}
          className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          CONFIRMAR <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>
    );
  };

  const OfficeScheduleScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-32"
    >
      <BackButton />
      <PostReservationStepBadge current={7} />
      <ReservationContinuityBadge />
      <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
        Agenda cita en oficina de ventas
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
        Esta cita servirá para conocernos, validar información, firmar documentos y recibir orientación sobre los siguientes pasos.
      </p>

      <div className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1] mb-8">
        <p className="text-[13px] font-black text-primary uppercase tracking-tight leading-tight">
          Pre reserva registrada · {selectedType === 'apartamentos' ? 'Apartamento' : 'Casa'} {selectedUnit?.label || (selectedType === 'apartamentos' ? 'Apt 21' : 'L-01')} · {selectedType === 'apartamentos' ? 'Torre' : 'Manzana'} {selectedTorre?.label || (selectedType === 'apartamentos' ? 'T5' : 'MZ A')}
        </p>
      </div>

      <div className="space-y-6 mb-12 text-left">
        <div>
          <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-2 px-1">Fecha deseada</label>
          <input type="date" className="w-full p-5 rounded-2xl border-2 border-accent/10 focus:border-accent outline-none font-bold text-lg transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-2 px-1">Hora deseada</label>
          <input type="time" className="w-full p-5 rounded-2xl border-2 border-accent/10 focus:border-accent outline-none font-bold text-lg transition-all" />
        </div>
      </div>

      <button 
        onClick={() => {
          setPostReservationStatus((current) => ({ ...current, salesOfficeAppointmentScheduled: true }));
          trackPostReservationEvent('sales_office_appointment_scheduled', {
            appointment_location: 'sales_office',
            next_required_step: 'project_visit',
          });
          navigateTo('project_visit_schedule', 14);
        }}
        className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
      >
        AGENDAR <ArrowRight className="w-6 h-6" />
      </button>
    </motion.div>
  );

  const ProjectVisitScheduleScreen = () => {
    const [showVisitSchedule, setShowVisitSchedule] = useState(false);
    const [confirmedProjectVisitPreference, setConfirmedProjectVisitPreference] = useState<ProjectVisitPreference>(
      postReservationStatus.projectVisitPreference === 'schedule_visit' ? 'schedule_visit' : null
    );

    const completeProjectVisitStep = (preference: Exclude<ProjectVisitPreference, null>) => {
      setConfirmedProjectVisitPreference(preference);
      setPostReservationStatus((current) => ({ ...current, projectVisitPreference: preference }));
      trackPostReservationEvent('project_visit_step_completed', {
        project_visit_preference: preference,
        next_required_step: 'post_reservation_complete',
      });
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={8} />
      <ReservationContinuityBadge />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
          Visita al proyecto
        </h2>
        <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
          Agenda una fecha tentativa para conocer el proyecto con acompañamiento del equipo comercial.
        </p>

        <div className="space-y-6">
          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Opción principal</span>
            <h3 className="text-[22px] font-black text-primary leading-tight mb-4">Agendar visita</h3>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug mb-5">
              Elige una fecha tentativa para conocer el proyecto con acompañamiento del equipo comercial.
            </p>
            <button 
              onClick={() => setShowVisitSchedule(!showVisitSchedule)}
              className="px-6 py-4 rounded-2xl bg-accent/10 text-accent font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
            >
              Agendar
            </button>

            {showVisitSchedule && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 pt-6 border-t border-primary/10">
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Fecha deseada</label>
                  <input type="date" className="w-full p-4 rounded-2xl border border-primary/10 outline-none font-bold text-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Hora deseada</label>
                  <input type="time" className="w-full p-4 rounded-2xl border border-primary/10 outline-none font-bold text-primary" />
                </div>
                <button 
                  onClick={() => completeProjectVisitStep('schedule_visit')}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest"
                >
                  Confirmar visita
                </button>
                {confirmedProjectVisitPreference === 'schedule_visit' && (
                  <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="text-[13px] font-bold text-accent text-center leading-snug">
                      Visita tentativa registrada dentro del escenario demo. La disponibilidad no es vinculante.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </section>
        </div>

        {confirmedProjectVisitPreference && (
          <button
            onClick={() => navigateTo('final_success', 15)}
            className="w-full mt-10 py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
          >
            CONTINUAR AL CIERRE FINAL <ArrowRight className="w-6 h-6" />
          </button>
        )}
      </motion.div>
    );
  };

  const DigitalAgentScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-32"
    >
      <BackButton />
      <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
        Conversa con nuestro agente digital
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
        Por texto o voz, podrás aclarar cualquier duda, de cualquier índole que sea.
      </p>

      <div className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1] mb-6">
        <p className="text-[13px] font-black text-primary uppercase tracking-tight leading-tight">
          Pre reserva registrada · {selectedType === 'apartamentos' ? 'Apartamento' : 'Casa'} {selectedUnit?.label || (selectedType === 'apartamentos' ? 'Apt 21' : 'L-01')} · {selectedType === 'apartamentos' ? 'Torre' : 'Manzana'} {selectedTorre?.label || (selectedType === 'apartamentos' ? 'T5' : 'MZ A')}
        </p>
      </div>

      <div className="bg-white/60 p-6 rounded-[2rem] border border-accent/10 mb-8 shadow-sm">
        <p className="text-[14px] font-bold text-secondary leading-snug">
          Ya registramos tu pre reserva. Ahora puedes iniciar una conversación por texto o voz para aclarar cualquier duda y seguir avanzando dentro de esta misma página.
        </p>
      </div>

      <div className="bg-accent/5 p-6 rounded-[2rem] border border-accent/20 mb-10">
        <h3 className="text-[16px] font-black text-accent uppercase tracking-wider mb-3 underline decoration-double">Instrucciones:</h3>
        <ol className="text-[14px] font-black text-secondary/80 space-y-3 list-decimal pl-5">
          <li>Haz clic en el botón <span className="text-accent underline">"INICIAR CONVERSACIÓN"</span> de abajo.</li>
          <li>Aparecerá un <span className="text-accent">icono de teléfono</span> en la parte <span className="text-accent">inferior central</span> de tu pantalla.</li>
          <li>Haz clic en ese <span className="text-accent">icono de teléfono</span> para comenzar a hablar con nuestra asistente.</li>
          <li>Es posible que tu navegador te pida <span className="text-accent">permiso para usar el micrófono</span>; favor autorízalo para que podamos escucharte.</li>
        </ol>
      </div>

      <button 
        onClick={() => (window as any).conectarVapi()}
        className="w-full py-10 rounded-[3rem] bg-[#D4AF37] text-white font-black uppercase text-2xl tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
      >
        Iniciar conversación
      </button>
    </motion.div>
  );

  const AgentCallScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-32"
    >
      <BackButton />
      <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
        Agenda recibir una llamada de nuestro agente digital
      </h2>
      <p className="text-secondary font-bold text-xl leading-snug mb-8 opacity-90">
        A tu teléfono móvil en el día y hora de tu preferencia, para que converses sobre cualquier tema relacionado a tu interés de realizar una reserva, ya sea, acerca de la arquitectura del proyecto o de tu unidad habitacional, o de las amenidades, o de los documentos que tienes que entregar o de tu situación económica, etc. Cualquier tema en el que necesites respuestas concretas.
      </p>

      <div className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1] mb-8">
        <p className="text-[18px] font-black text-primary uppercase tracking-tight leading-tight">
          Pre reserva registrada · {selectedType === 'apartamentos' ? 'Apartamento' : 'Casa'} {selectedUnit?.label || (selectedType === 'apartamentos' ? 'Apt 21' : 'L-01')} · {selectedType === 'apartamentos' ? 'Torre' : 'Manzana'} {selectedTorre?.label || (selectedType === 'apartamentos' ? 'T5' : 'MZ A')}
        </p>
      </div>

      <div className="space-y-8 mb-12">
        <div>
          <label className="block text-[16px] font-black text-primary uppercase tracking-widest mb-4 px-1">Número de teléfono móvil</label>
          <input type="text" placeholder="7060-0000" className="w-full p-6 rounded-3xl border-2 border-accent/20 focus:border-accent outline-none font-black text-2xl transition-all shadow-sm" />
        </div>
        <div>
          <label className="block text-[16px] font-black text-primary uppercase tracking-widest mb-4 px-1">Fecha deseada</label>
          <input type="date" className="w-full p-6 rounded-3xl border-2 border-accent/20 focus:border-accent outline-none font-black text-2xl transition-all shadow-sm" />
        </div>
        <div>
          <label className="block text-[16px] font-black text-primary uppercase tracking-widest mb-4 px-1">Hora deseada</label>
          <input type="time" className="w-full p-6 rounded-3xl border-2 border-accent/20 focus:border-accent outline-none font-black text-2xl transition-all shadow-sm" />
        </div>
      </div>

      <p className="text-[12px] font-bold text-secondary/70 leading-tight mb-8 px-1 italic">
        En una operación real recibirías la llamada en el número registrado. Esta demostración no confirma comunicaciones ni citas reales.
      </p>

      <button 
        onClick={() => {
              trackPostReservationEvent('comments_analysis_completed', {
                next_required_step: 'marta_contact',
              });

              navigateTo('acompanamiento_amena', 12);
            }}
        className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
      >
        CONFIRMAR LLAMADA
      </button>
    </motion.div>
  );

  const VisitScheduleScreen = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-32"
    >
      <BackButton />
      <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
        Agenda tu cita presencial
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
        Visita el proyecto o nuestras oficinas de ventas.
      </p>

      <div className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1] mb-8">
        <p className="text-[13px] font-black text-primary uppercase tracking-tight leading-tight">
          Pre reserva registrada · {selectedType === 'apartamentos' ? 'Apartamento' : 'Casa'} {selectedUnit?.label || (selectedType === 'apartamentos' ? 'Apt 21' : 'L-01')} · {selectedType === 'apartamentos' ? 'Torre' : 'Manzana'} {selectedTorre?.label || (selectedType === 'apartamentos' ? 'T5' : 'MZ A')}
        </p>
      </div>

      <div className="space-y-6 mb-12 text-left">
        <div>
          <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-2 px-1">Lugar de la cita</label>
          <select className="w-full p-5 rounded-2xl border-2 border-accent/10 focus:border-accent outline-none font-bold text-lg transition-all appearance-none bg-white">
            <option>Proyecto de construcción</option>
            <option>Oficinas de ventas</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-2 px-1">Fecha deseada</label>
          <input type="date" className="w-full p-5 rounded-2xl border-2 border-accent/10 focus:border-accent outline-none font-bold text-lg transition-all" />
        </div>
        <div>
          <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-2 px-1">Hora deseada</label>
          <input type="time" className="w-full p-5 rounded-2xl border-2 border-accent/10 focus:border-accent outline-none font-bold text-lg transition-all" />
        </div>
      </div>

      <button 
        onClick={() => {
          setPostReservationStatus((current) => ({ ...current, projectVisitPreference: 'schedule_visit' }));
          trackPostReservationEvent('project_visit_step_completed', {
            project_visit_preference: 'schedule_visit',
            next_required_step: 'post_reservation_complete',
          });
          navigateTo('final_success', 15);
        }}
        className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
      >
        CONFIRMAR CITA
      </button>
    </motion.div>
  );

  const FinalSuccessScreen = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="p-8 pb-32"
    >
      <PostReservationStepBadge current={9} />
      <ReservationContinuityBadge />
      <h2 className="text-[40px] font-black text-accent leading-none mb-6 tracking-tight uppercase">
        Proceso finalizado correctamente
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-10 opacity-80">
        La información demo fue registrada correctamente. Gracias por recorrer Proyecto de Empresa Demo.
      </p>

      <div className="bg-[#f7f2eb] p-8 rounded-[2rem] border border-[#e8dfd1] mb-8 shadow-sm space-y-4">
        <p className="text-[14px] font-black text-primary uppercase tracking-tight flex flex-wrap gap-x-2">
          <span className="opacity-60">Tipo:</span> {selectedType === 'apartamentos' ? 'Apartamentos' : 'Casas'} 
          <span className="opacity-20 mx-1">·</span>
          <span className="opacity-60">Sector:</span> {selectedSector?.name || '04'}
          <span className="opacity-20 mx-1">·</span>
          <span className="opacity-60">Torre:</span> {selectedTorre?.label || 'T42'}
        </p>
        <p className="text-[14px] font-black text-primary uppercase tracking-tight flex flex-wrap gap-x-2">
          <span className="opacity-60">Modelo:</span> {selectedModel?.name}
          <span className="opacity-20 mx-1">·</span>
          <span className="opacity-60">Nivel:</span> {selectedLevel?.name || '01'}
          <span className="opacity-20 mx-1">·</span>
          <span className="opacity-60">Unidad:</span> {selectedUnit?.label || 'Apt 21'}
        </p>
        <p className="text-[14px] font-black text-primary uppercase tracking-tight flex flex-wrap gap-x-2">
           <span className="opacity-60">Acción:</span> Flujo post-reserva completado
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-accent/10 shadow-sm">
        <h4 className="text-xl font-black text-accent uppercase tracking-tight mb-4">Resumen final</h4>
        <ul className="space-y-3">
          {[
            'La pre reserva ha quedado registrada en el sistema.',
            'La acción comercial seleccionada ha sido registrada correctamente.',
            'El escenario muestra cómo un equipo comercial podría continuar el acompañamiento.',
            'Gracias por explorar Empresa Demo · Proyecto de Empresa Demo.'
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-[13px] font-bold text-primary/80 leading-tight">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={() => navigateTo('next_steps_instructions', 10)}
        className="w-full py-6 mt-12 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
      >
        REVISAR PASOS FINALES
      </button>

      <button 
        onClick={() => navigateTo('acompanamiento_amena', 12)}
        className="w-full py-6 mt-4 rounded-2xl bg-white border-2 border-accent/20 text-accent font-black uppercase text-xs tracking-widest shadow-sm active:scale-95 transition-transform"
      >
        CONTACTAR A MARTA
      </button>

      <button 
        onClick={() => navigateTo('welcome', 1)}
        className="w-full py-6 mt-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
      >
        VOLVER AL INICIO
      </button>
    </motion.div>
  );

  return (
    <div className="pwa-container">
      <Header />
      <div className="pwa-content hoperia-continuity-flow">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && <WelcomeScreen key="welcome" />}
          {screen === 'housing_type' && <HousingTypeScreen key="type" />}
          {screen === 'sector_selection' && <SectorSelectionScreen key="sector" />}
          {screen === 'torre_selection' && <TorreSelectionScreen key="torre" />}
          {screen === 'model_selection' && <ModelSelectionScreen key="model" />}
          {screen === 'level_selection' && <LevelSelectionScreen key="level" />}
          {screen === 'unit_selection' && <UnitSelectionScreen key="units" />}
          {screen === 'unit_detail' && <UnitDetailScreen key="detail" />}
          {screen === 'reservation_form' && <ReservationFormScreen key="reservation" />}
          {screen === 'further_steps' && <FurtherStepsScreen key="further" />}
          {screen === 'acompanamiento_amena' && <AcompanamientoAmenaScreen key="acompanamiento" />}
          {screen === 'marta_now_detail' && <MartaNowDetailScreen key="marta-now" />}
          {screen === 'marta_schedule_detail' && <MartaScheduleDetailScreen key="marta-schedule" />}
          {screen === 'marta_link_detail' && <MartaLinkDetailScreen key="marta-link" />}
          {screen === 'advisor_call_detail' && <AdvisorCallDetailScreen key="advisor-call" />}
          {screen === 'advisor_office_detail' && <AdvisorOfficeDetailScreen key="advisor-office" />}
          {screen === 'advisor_visit_detail' && <AdvisorVisitDetailScreen key="advisor-visit" />}
          {screen === 'accompaniment_summary' && <AccompanimentSummaryScreen key="accompaniment-summary" />}
          {screen === 'official_closure' && <OfficialClosureScreen key="official-closure" />}
          {screen === 'next_steps_instructions' && <NextStepsInstructionsScreen key="instructions" />}
          {screen === 'whatsapp_confirmation' && <WhatsAppConfirmationScreen key="whatsapp" />}
          {screen === 'office_schedule' && <OfficeScheduleScreen key="office" />}
          {screen === 'project_visit_schedule' && <ProjectVisitScheduleScreen key="project-visit" />}
          {screen === 'user_comments' && <UserCommentsScreen key="comments" />}
          {screen === 'analysis_report' && <AnalysisReportScreen key="report" />}
          {screen === 'digital_agent' && <DigitalAgentScreen key="agent" />}
          {screen === 'agent_call' && <AgentCallScreen key="call" />}
          {screen === 'visit_schedule' && <VisitScheduleScreen key="visit" />}
          {screen === 'final_success' && <FinalSuccessScreen key="final" />}
 </AnimatePresence>
 </div>

{/* Shared Modals */}
<ImageModal
  isOpen={isMasterPlanOpen}
  onClose={() => setIsMasterPlanOpen(false)}
  title="Master Plan Maestro"
  imageUrl="./demo/vista-global.png"
  message="Visualiza la distribución referencial de Proyecto de Empresa Demo."
/>

<ImageModal
  isOpen={isSectorMapOpen}
  onClose={() => setIsSectorMapOpen(false)}
  title="Proyecto de Empresa Demo · Vista Global"
  imageUrl="./demo/vista-global.png"
  message="Todos los espacios pertenecen a un SECTOR. Vista 3D referencial."
/>

<ImageModal
  isOpen={isManzanasModalOpen}
  onClose={() => setIsManzanasModalOpen(false)}
  title="Manzanas disponibles"
imageUrl="./demo/plano-manzanas.png"
  message="Visualiza las manzanas activas dentro del sector seleccionado."
/>

<ImageModal
  isOpen={isLotesModalOpen}
  onClose={() => setIsLotesModalOpen(false)}
  title="Lotes disponibles"
  imageUrl="./demo/plano-lotes.png"
  message="Visualiza los lotes disponibles dentro de la manzana seleccionada."
/>

</div>
);
};

export default App;







