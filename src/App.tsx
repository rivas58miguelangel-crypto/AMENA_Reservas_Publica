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

  const totalSteps = 15;

  const navigateTo = (newScreen: Screen, newStep: number) => {
    setScreen(newScreen);
    setStep(newStep);
    window.scrollTo(0, 0);
  };
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
      console.debug('[AMENA post-reservation event pending Supabase]', postReservationEvent);
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
    else if (screen === 'acompanamiento_amena') navigateTo('next_steps_instructions', 10);
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
    <div className="p-6 text-white shadow-lg" style={{ backgroundColor: projectBranding.secondaryColor }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--brand-primary)]" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--brand-primary)]" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--brand-primary)]" />
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--brand-primary)]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight leading-none uppercase" style={{ color: projectBranding.primaryColor }}>{projectBranding.projectName}</h1>
            <p className="text-[8px] font-black tracking-[0.3em] opacity-80 uppercase leading-none mt-1" style={{ color: projectBranding.primaryColor }}>{projectBranding.tagline}</p>
          </div>
        </div>
        <div className="bg-white px-6 py-2 rounded-full shadow-md">
          <span className="text-[12px] font-black text-[var(--brand-accent)] uppercase tracking-widest whitespace-nowrap">PASO {step} DE {totalSteps}</span>
        </div>
      </div>
      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full shadow-[0_0_10px_rgba(208,131,59,0.5)]" style={{ backgroundColor: projectBranding.accentColor }} 
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
        "flex items-center gap-1 text-[10px] font-black text-primary uppercase mb-4 transition-opacity",
        step === 1 && "opacity-0 pointer-events-none"
      )}
    >
      <ChevronLeft className="w-4 h-4" /> REGRESAR
    </button>
  );

  const PostReservationStepBadge = (_props?: { current?: number }) => null;

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
      className="p-8"
    >
      <BackButton />
      <h2 className="text-[28px] font-black text-primary leading-tight mb-4 tracking-tight">
        Bienvenido al visualizador digital
      </h2>
      <p className="text-secondary font-medium text-sm leading-snug mb-8">
        Conoce mejor el proyecto, revisa disponibilidad y avanza hacia una pre reserva con mayor claridad.
      </p>

      <div className="amena-card-welcome mb-8 p-8 rounded-3xl bg-[#dbe2e5]">
        <h3 className="text-4xl font-black text-primary mb-6 tracking-tight">Bienvenido a AMENA</h3>
        <p className="text-primary font-bold text-xl leading-relaxed mb-8 opacity-90">
          Antes de iniciar el recorrido, completa tus datos para personalizar tu experiencia y registrar correctamente tu interés en el proyecto.
        </p>
        <div className="space-y-5 text-base text-primary">
          {[
            { key: 'firstName', label: 'Nombres', placeholder: 'Ej. Miguel' },
            { key: 'lastName', label: 'Apellidos', placeholder: 'Ej. Rivas' },
            { key: 'email', label: 'Correo electrónico', placeholder: 'correo@ejemplo.com', type: 'email' },
            { key: 'phone', label: 'Teléfono celular con código de país', placeholder: 'Ej. +503 7000-0000', type: 'tel' },
            { key: 'dui', label: 'DUI opcional', placeholder: 'Ej. 00000000-0' },
          ].map((field) => (
            <label key={field.key} className="block border-b border-primary/20 pb-3">
              <span className="block font-black uppercase tracking-widest text-xs mb-2">{field.label}</span>
              <input
                type={field.type || 'text'}
                value={interestedPerson[field.key as keyof typeof interestedPerson]}
                onChange={(event) => setInterestedPerson((current) => ({ ...current, [field.key]: event.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/70 rounded-2xl px-4 py-3 text-primary font-bold outline-none placeholder:text-primary/40"
              />
            </label>
          ))}
        </div>
      </div>

      <div className={cn(
        "w-full p-5 rounded-2xl border mb-8 bg-white transition-all",
        acceptedTerms ? "border-primary" : "border-transparent shadow-sm"
      )}>
        <button
          onClick={() => setAcceptedTerms(!acceptedTerms)}
          className="w-full flex items-center justify-between"
        >
          <p className="text-sm font-bold text-primary text-left pr-4">
            Acepto los términos, condiciones y tratamiento de mis datos personales en AMENA.
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
          className="mt-3 text-left text-xs font-black text-primary underline underline-offset-4"
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
              <h3 className="text-2xl font-black text-primary mb-4">Condiciones de uso y tratamiento de datos</h3>
              <ul className="space-y-3 text-sm font-semibold leading-6 text-secondary">
                <li>AMENA usará los datos ingresados únicamente para personalizar el recorrido, dar seguimiento comercial y gestionar una posible reserva.</li>
                <li>El usuario acepta recibir comunicaciones relacionadas con el proyecto por WhatsApp, correo electrónico o llamada.</li>
                <li>La información podrá formar parte del expediente operacional del interesado dentro del ecosistema AMENA.</li>
                <li>AMENA se compromete a tratar los datos con confidencialidad y fines exclusivamente relacionados con el proyecto.</li>
                <li>El usuario puede solicitar actualización o eliminación de sus datos.</li>
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
        onClick={() => navigateTo('housing_type', 2)}
        className={cn(
          "amena-btn amena-btn-dark mb-4",
          !acceptedTerms && "opacity-50 grayscale"
        )}
      >
        COMENZAR RECORRIDO
      </button>

      <div className="text-center space-y-4">
        <button className="text-primary font-bold text-sm underline underline-offset-4">App ADMIN</button>
        <div className="pt-8 border-t border-primary/10">
          <p className="text-[16px] font-black text-primary/80 uppercase tracking-widest leading-tight mb-2">Automatiza Hoy IA</p>
          <p className="text-[14px] font-bold text-blue-700 lowercase">E-mail: marivas@automatizahoy.ai</p>
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
        url: './casa vs apto/Casa02.png',
        price: 'Desde $115k',
        area: '130m² - 175m²',
        description: 'Privacidad total, Jardín propio, Espacios amplios, Cochera privada, Independencia.',
        caption: 'Amena casa Aura - Fachada Principal'
      },
      {
        type: 'image',
        title: 'Vivir en Torre',
        url: './casa vs apto/Apartamento.png',
        price: 'Desde $77k',
        area: '39m² - 72m²',
        description: 'Vistas únicas, Amenidades premium, Rooftop pool, Coworking, Seguridad 24/7.',
        caption: 'Amena Apartamento Cénit - Espacios Optimizados'
      }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8"
      >
        <BackButton />
        <h2 className="text-[32px] font-black text-accent leading-none mb-4 tracking-tight uppercase">
          Tu Futuro Hogar
        </h2>
        <p className="text-secondary font-medium text-sm mb-8 leading-snug">
          Selecciona el formato de vivienda que mejor se adapte a tu estilo de vida.
        </p>

        <button 
          onClick={() => {
            setCarouselStep(0);
            setIsComparisonOpen(true);
          }}
          className="w-full flex justify-between items-center p-5 border border-accent/20 rounded-2xl bg-accent/5 mb-8 active:bg-accent/10 transition-colors"
        >
          <span className="font-bold text-primary text-sm">Visualizador Comparativo</span>
          <div className="flex items-center text-accent font-bold text-xs tracking-tight gap-1">
            Abrir Guía <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
  setSelectedType('casas');
  trackSelection('housing_type', 'casas', {
    label: 'Residencial',
    display: 'Casas'
  });
  navigateTo('sector_selection', 3);
}}
            className="group bg-white border-2 border-transparent hover:border-primary/20 rounded-[2rem] overflow-hidden text-center flex flex-col items-center shadow-lg active:scale-95 transition-all p-3"
          >
            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100">
               <img src="./casa vs apto/Casa02.png" alt="Casas" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-[13px] font-black text-primary leading-tight uppercase tracking-tight mb-0.5">Residencial</h3>
            <p className="text-[8px] font-bold text-secondary tracking-tight opacity-70 uppercase">Casas</p>
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
            className="group bg-white border-2 border-transparent hover:border-accent/20 rounded-[2rem] overflow-hidden text-center flex flex-col items-center shadow-lg active:scale-95 transition-all p-3"
          >
             <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-100">
               <img src="./casa vs apto/Apartamento.png" alt="Apartamentos" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-[13px] font-black text-accent leading-tight uppercase tracking-tight mb-0.5">Vertical</h3>
            <p className="text-[8px] font-bold text-secondary tracking-tight opacity-70 uppercase">Apartamentos</p>
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
        className="p-8"
      >
        <BackButton />
        <h2 className={`text-[32px] font-black ${accentColor} leading-none mb-4 tracking-tight uppercase`}>
          Selecciona Sector
        </h2>
        <p className="text-secondary font-medium text-sm leading-snug mb-8">
          Elige el sector en el que deseas explorar disponibilidad de {isApartments ? 'apartamentos' : 'casas'}.
        </p>

        <button 
          onClick={() => setIsSectorMapOpen(true)}
          className={`w-full flex justify-between items-center py-5 border-y ${isApartments ? 'border-accent/10' : 'border-primary/10'} mb-8 active:bg-black/5 px-2 transition-colors group`}
        >
          <span className="font-black text-primary text-lg tracking-tight">Ver sectores del proyecto</span>
          <div className={`flex items-center ${accentColor} font-black uppercase text-[10px] tracking-widest gap-2`}>
            Abrir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <div className="bg-[#f7f2eb] p-4 rounded-full border border-[#e8dfd1] mb-8">
           <p className="text-[10px] font-black text-primary uppercase text-center tracking-tight flex items-center justify-center gap-1">
             <span className="opacity-80">{isApartments ? 'APARTAMENTOS' : 'CASAS'}</span>
           </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              className={`group bg-white rounded-2xl p-6 text-left shadow-sm border-2 border-transparent ${isApartments ? 'active:border-accent' : 'active:border-primary'} hover:shadow-md transition-all flex flex-col items-start justify-center`}
            >
              <h3 className={`text-xl font-black ${accentColor} mb-1 leading-none uppercase tracking-tight`}>{sub.name}</h3>
              <p className="text-[9px] font-bold text-secondary opacity-60 leading-tight">{sub.description}</p>
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
        className="p-8"
      >
        <BackButton />
        <h2 className={`text-[32px] font-black ${accentColor} leading-none mb-4 tracking-tight uppercase`}>
          {isApartments ? 'Selecciona Torre' : 'Selecciona Manzana'}
        </h2>
        <p className="text-secondary font-medium text-sm leading-snug mb-8">
          {isApartments 
            ? 'Estas son las torres que actualmente cuentan con apartamentos disponibles dentro del sector elegido.'
            : 'Estas son las manzanas que actualmente cuentan con casas disponibles dentro del sector elegido.'
          }
        </p>

<div className="bg-[#f7f2eb] p-4 rounded-full border border-[#e8dfd1] mb-8">
  <p className="text-[10px] font-black text-primary uppercase text-center tracking-tight">
    {isApartments ? 'APARTAMENTOS' : 'CASAS'} · {selectedSector?.name}
  </p>
</div>
{!isApartments && (
  <button
    onClick={() => setIsManzanasModalOpen(true)}
    className="w-full p-4 bg-white rounded-2xl border text-primary font-black"
  >
    Ver manzanas disponibles
  </button>
)}
        {targetsToDisplay && (
          <div className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1] mb-8 shadow-sm">
            <h4 className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-6 text-center">
              {isApartments ? 'Torres' : 'Manzanas'} con disponibilidad en este sector
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
                  className={`bg-white border ${isApartments ? 'border-accent/10' : 'border-primary/10'} rounded-2xl p-6 text-left flex flex-col gap-2 shadow-sm ${isApartments ? 'active:ring-accent/20' : 'active:ring-primary/20'} transition-all group`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-black text-primary leading-none uppercase">{target.label}</div>
                    <div className="px-2 py-0.5 bg-green-500 rounded-full text-[8px] text-white font-black uppercase">Disponibles</div>
                  </div>
                  <div className="space-y-1 opacity-70">
                    <p className="text-[10px] font-black text-primary uppercase">{isApartments ? 'Cénit:' : 'Senda:'} {Math.floor(Math.random() * 5) + 1} disp.</p>
                    <p className="text-[10px] font-black text-primary uppercase">{isApartments ? 'Destello:' : 'Aura:'} {Math.floor(Math.random() * 3) + 1} disp.</p>
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
        className="p-8 pb-32"
      >
        <BackButton />
        <h2 className={`text-[32px] font-black ${accentColor} leading-tight mb-4 tracking-tight uppercase`}>
          Selecciona Modelo de {isApartments ? 'Apartamento' : 'Casa'}
        </h2>
        <p className="text-secondary font-medium text-sm leading-snug mb-8">
          Revisa el área y el valor referencial de los modelos disponibles antes de continuar.
        </p>

        <button 
          onClick={() => setIsModelGalleryOpen(true)}
          className="w-full flex justify-between items-center p-6 bg-[#f7f2eb] border border-[#e8dfd1] rounded-[2rem] mb-6 shadow-sm group active:bg-[#ede3d5] transition-colors text-left"
        >
          <span className="font-bold text-primary text-[14px] leading-tight w-3/4">Vea los detalles de cada uno de los modelos de {isApartments ? 'apartamentos' : 'casas'} disponibles</span>
          <div className={`flex items-center ${accentColor} font-black text-[12px] uppercase tracking-widest gap-2`}>
            ABRIR <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <div className="bg-[#f7f2eb] p-4 rounded-full border border-[#e8dfd1] mb-8">
           <p className="text-[10px] font-black text-primary uppercase text-center tracking-tight flex items-center justify-center gap-1">
             <span className="opacity-80 uppercase">{isApartments ? 'APARTAMENTOS' : 'CASAS'}</span> 
             <span className="opacity-30">·</span> 
             <span className={`${accentColor}`}>{selectedSector?.name || 'SECTOR 02'}</span>
             <span className="opacity-30 ml-1">·</span> 
             <span className={`${accentColor} ml-1`}>{selectedTorre?.label || (isApartments ? 'T5' : 'MZ A')}</span>
           </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                "group bg-white border-2 rounded-[2.5rem] overflow-hidden text-center flex flex-col items-center shadow-lg active:scale-95 transition-all p-3",
                selectedModel?.id === model.id ? (isApartments ? "border-accent shadow-accent/20 scale-[1.02]" : "border-primary shadow-primary/20 scale-[1.02]") : "border-transparent hover:border-black/10"
              )}
            >
              <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-4 bg-gray-100">
                <img src={model.image} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-[13px] font-black text-primary leading-tight uppercase tracking-tight mb-0.5">{model.name}</h3>
              <p className="text-[8px] font-bold text-secondary tracking-tight opacity-70 uppercase">Desde {model.price}</p>
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
          src="./lotes/casalote.png"
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
          Estás a un paso de separar tu lugar en AMENA. Revisa el resumen de tu selección.
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
            <p className="text-sm font-bold text-secondary uppercase tracking-widest opacity-80 italic">Al confirmar, enviaremos esta selección a un asesor AMENA.</p>
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
    const [email, setEmail] = useState('');
    const [blocks, setBlocks] = useState<{ title: string; text: string; attachments: string[] }[]>([
      { title: '', text: '', attachments: [] }
    ]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [commentsChoice, setCommentsChoice] = useState<'yes' | 'no' | null>(null);

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
      const mockFiles = ['documento.pdf', 'imagen_referencia.png', 'analisis.xlsx'];
      const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
      newBlocks[index].attachments = [...newBlocks[index].attachments, randomFile];
      setBlocks(newBlocks);
    };

    const buildAnalysisResult = (resultEmail: string, submittedBlocks: typeof blocks) => ({
      email: resultEmail,
      blocks: submittedBlocks,
      analysis: submittedBlocks.length > 0
        ? "Basado en tu información, existe una PROBABILIDAD ALTA (85%) de éxito en tu trámite si se siguen las recomendaciones adjuntas."
        : "No registraste comentarios adicionales en este momento. AMENA continuará el acompañamiento con la información de tu pre reserva.",
      options: [
        { title: "Opción de Financiamiento Directo", detail: "Aprovecha la tasa preferencial AMENA para clientes con tu perfil laboral." },
        { title: "Optimización de Espacios", detail: "Se recomienda el modelo con balcón extendido para mayor ventilación natural." },
        { title: "Calendario de Documentación", detail: "Entrega tu constancia salarial antes del día 15 para congelar la tasa." }
      ],
      recommendation: submittedBlocks.length > 0
        ? "SE RECOMIENDA SEGUIR EL TRÁMITE CON FIRMEZA. Tu capacidad económica y estabilidad referenciada son compatibles con los requerimientos del proyecto."
        : "Puedes continuar el proceso sin comentarios adicionales. El equipo de AMENA podrá contactarte en los pasos posteriores si necesita ampliar información."
    });

    const continueWithoutComments = () => {
      setAnalysisResult(buildAnalysisResult('', []));
      navigateTo('analysis_report', 13);
    };

    const runAnalysis = () => {
      const trimmedEmail = email.trim();
      const submittedBlocks = blocks.filter((block) => 
        block.title.trim() || block.text.trim() || block.attachments.length > 0
      );

      if (!trimmedEmail) {
        alert("Por favor completa tu email.");
        return;
      }
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisResult(buildAnalysisResult(trimmedEmail, submittedBlocks));
        navigateTo('analysis_report', 13);
      }, 3000);
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={3} />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-2 tracking-tight uppercase">
          Comentarios del Interesado
        </h2>
        <p className="text-secondary font-bold text-sm mb-8 opacity-70">
          Decide si deseas agregar información adicional antes de continuar.
        </p>

        {!commentsChoice && (
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
              <h3 className="text-[22px] font-black text-primary leading-tight mb-4">
                ¿Deseas compartir comentarios, dudas o documentos adicionales?
              </h3>
              <p className="text-[14px] font-bold text-secondary/70 leading-snug mb-6">
                Puedes continuar sin agregar información adicional o compartir detalles para enriquecer el análisis.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setCommentsChoice('yes')}
                  className="w-full py-5 rounded-2xl bg-accent text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform"
                >
                  Sí, deseo agregar comentarios
                </button>
                <button
                  onClick={() => setCommentsChoice('no')}
                  className="w-full py-5 rounded-2xl border-2 border-primary/15 text-primary font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
                >
                  No deseo agregar comentarios ahora
                </button>
              </div>
            </section>
          </div>
        )}

        {commentsChoice === 'no' && (
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm">
              <h3 className="text-[22px] font-black text-primary leading-tight mb-4">
                Continuar sin comentarios
              </h3>
              <p className="text-[14px] font-bold text-secondary/70 leading-snug">
                No se solicitará email, comentarios ni archivos en este paso. Puedes regresar o avanzar al análisis demo del flujo.
              </p>
            </section>
            <button
              onClick={handleBack}
              className="w-full py-5 rounded-2xl border-2 border-primary/15 text-primary font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
            >
              REGRESAR
            </button>
            <button
              onClick={continueWithoutComments}
              className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform"
            >
              CONTINUAR <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {commentsChoice === 'yes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border-2 border-accent/10 shadow-lg">
            <label className="block text-[11px] font-black text-primary uppercase tracking-widest mb-2 px-1">Tu E-mail para reportes</label>
            <p className="text-[12px] font-bold text-secondary/60 mb-4">
              Email obligatorio en esta opción. Comentarios y archivos opcionales.
            </p>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com" 
              className="w-full p-4 rounded-xl border border-primary/10 focus:border-accent outline-none font-bold text-lg transition-all" 
            />
          </div>

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
                    placeholder="Título del comentario (Ej: Dudas Financieras)"
                    className="w-full text-2xl font-black text-primary bg-transparent border-none outline-none placeholder:text-primary/20"
                  />
                  <div className="h-px bg-primary/10 w-16 mt-2" />
                </div>

                <textarea 
                  value={block.text}
                  onChange={(e) => updateBlock(index, 'text', e.target.value)}
                  placeholder="Describe aquí tu realidad, dudas o planteamientos..."
                  className="w-full h-32 text-lg font-bold text-secondary bg-transparent border-none outline-none resize-none placeholder:text-secondary/20"
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
                     <Upload className="w-4 h-4" /> Adjuntar archivos (PDF, ZIP, DOC...)
                   </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addBlock}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-accent/20 text-accent font-black uppercase text-xs tracking-widest hover:bg-accent/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar otro bloque de comentarios
          </button>

          <button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>Analizando Inteligencia... <RefreshCw className="w-6 h-6 animate-spin" /></>
            ) : (
              <>PROCESAR ANÁLISIS IA <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
        )}
      </motion.div>
    );
  };

  const AnalysisReportScreen = () => {
    if (!analysisResult) return <div className="p-20 text-center font-bold">Cargando reporte...</div>;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={4} />
        <h2 className="text-[32px] font-black text-primary leading-[1.1] mb-2 tracking-tight uppercase">
          Análisis de Opciones
        </h2>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-accent" />
          </div>
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">Reporte Inteligente Generado</p>
        </div>

        <div className="space-y-6">
          <section className="bg-primary text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Info className="w-32 h-32" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-70">Lectura H-Operia Intelligence</h3>
             <p className="text-xl font-black leading-tight tracking-tight mb-4">
               {analysisResult.analysis}
             </p>
             <div className="bg-white/10 p-4 rounded-2xl border border-white/10 italic text-[13px] font-bold">
               "{analysisResult.recommendation}"
             </div>
          </section>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest px-2">Opciones y Alternativas Planteadas</h4>
            {analysisResult.options.map((opt: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-accent/10 shadow-sm">
                <h5 className="text-[15px] font-black text-primary mb-1 uppercase tracking-tight">{opt.title}</h5>
                <p className="text-[13px] font-medium text-secondary/80 leading-snug">{opt.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#f7f2eb] p-6 rounded-[2rem] border border-[#e8dfd1]">
             <h4 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">Próximos Pasos de Gestión</h4>
             <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-[12px] font-bold text-primary">Sincronización automática con el CRM para seguimiento.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-[12px] font-bold text-primary">
                    {analysisResult.email ? `Copia de este reporte enviada a ${analysisResult.email}.` : 'No se registró un correo adicional en este paso.'}
                  </p>
                </div>
                {analysisResult.email && (
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <p className="text-[12px] font-bold text-primary">Se ha enviado un registro de tus comentarios y de nuestras interacciones al correo {analysisResult.email}.</p>
                  </div>
                )}
             </div>
          </div>

          <button 
            onClick={() => {
              trackPostReservationEvent('comments_analysis_completed', {
                next_required_step: 'marta_contact',
              });

              navigateTo('acompanamiento_amena', 12);
            }}
            className="w-full py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-transform mt-8"
          >
            CONFIRMAR Y FINALIZAR <ArrowRight className="w-6 h-6" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full py-6 rounded-2xl border-2 border-primary/10 text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5 transition-all"
          >
            CERRAR SESIÓN
          </button>

          <p className="text-[10px] font-bold text-secondary/50 text-center uppercase tracking-widest">
            Toda tu interacción ha sido registrada con total seguridad
          </p>
        </div>
      </motion.div>
    );
  };

  const AcompanamientoAmenaScreen = () => {
    const [showSchedule, setShowSchedule] = useState(
      martaScheduleDraftOpen.current || postReservationStatus.martaContactPreference === 'schedule_call'
    );
    const [showAccessNote, setShowAccessNote] = useState(postReservationStatus.martaContactPreference === 'whatsapp_link');
    const [scheduleConfirmed, setScheduleConfirmed] = useState(postReservationStatus.martaContactPreference === 'schedule_call');
    const [whatsappLinkConfirmed, setWhatsappLinkConfirmed] = useState(postReservationStatus.martaContactPreference === 'whatsapp_link');

    const reservationId = selectedUnit?.id ? `AMENA-${selectedUnit.id.toUpperCase()}` : 'AMENA-RESERVA-DEMO';
    const selectedMartaAction = postReservationStatus.martaContactPreference;
    const canContinueMarta = selectedMartaAction === 'talk_now' || scheduleConfirmed || whatsappLinkConfirmed;

    const chooseMartaAction = (preference: Exclude<MartaContactPreference, null>) => {
      setPostReservationStatus((current) => ({ ...current, martaContactPreference: preference }));
      trackPostReservationEvent('marta_contact_selected', {
        marta_contact_preference: preference,
        next_required_step: 'whatsapp_receipt_confirmation',
      });
    };

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={5} />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-6 tracking-tight uppercase">
          Acompañamiento Inteligente
        </h2>
        <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
          Tu reserva ha sido registrada correctamente. Elige cómo deseas hablar con Marta para continuar el acompañamiento obligatorio de tu pre reserva.
        </p>

        <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm mb-8">
          <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">Acceso privado de acompañamiento</span>
          <h3 className="text-[26px] font-black text-primary leading-none mb-4 uppercase">
            Avanza con claridad, a tu ritmo
          </h3>
          <p className="text-[15px] font-bold text-secondary/80 leading-snug mb-5">
            Marta puede atenderte por texto o voz desde el espacio privado de Acompañamiento Inteligente, preparar una llamada o generar un link privado por WhatsApp.
          </p>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-[12px] font-bold text-primary/70 leading-snug">
              Para acceder se utilizará el ID de tu reserva <span className="font-black text-primary">{reservationId}</span> y verificación de identidad antes de compartir información sensible.
            </p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Opción 01</span>
            <h3 className="text-[22px] font-black text-primary leading-tight mb-4">Hablar ahora con Marta</h3>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug mb-5">
              Ingresa inmediatamente a tu espacio privado de Acompañamiento Inteligente para conversar con Marta por texto o voz.
            </p>
            <button 
              onClick={() => {
                martaScheduleDraftOpen.current = false;
                setShowSchedule(false);
                setShowAccessNote(false);
                setScheduleConfirmed(false);
                setWhatsappLinkConfirmed(false);
                chooseMartaAction('talk_now');
                (window as any).conectarVapi?.();
              }}
              className="px-6 py-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              Hablar ahora con Marta
            </button>
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Opción 02</span>
            <h3 className="text-[22px] font-black text-primary leading-tight mb-4">Agendar llamada con Marta</h3>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug mb-5">
              Si prefieres no conversar en este momento, podrás programar un horario más cómodo para continuar tu acompañamiento posteriormente.
            </p>
            <button 
              onClick={() => {
                martaScheduleDraftOpen.current = true;
                setShowSchedule(true);
                setShowAccessNote(false);
                setScheduleConfirmed(false);
                setWhatsappLinkConfirmed(false);
                setPostReservationStatus((current) => (
                  current.martaContactPreference === null
                    ? current
                    : { ...current, martaContactPreference: null }
                ));
              }}
              className="px-6 py-4 rounded-2xl bg-accent/10 text-accent font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
            >
              Agendar llamada
            </button>
            <p className="text-[12px] font-bold text-secondary/60 leading-snug mt-4">
              Recibirás la llamada de Marta en el número y horario que prefieras.
            </p>

            {showSchedule && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4 pt-6 border-t border-primary/10">
                <h4 className="text-[13px] font-black text-primary uppercase tracking-widest">Formulario de llamada</h4>
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Día preferido</label>
                  <input type="date" className="w-full p-4 rounded-2xl border border-primary/10 outline-none font-bold text-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Hora preferida</label>
                  <input type="time" className="w-full p-4 rounded-2xl border border-primary/10 outline-none font-bold text-primary" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Número de teléfono móvil</label>
                  <input type="text" placeholder="7060-0000" className="w-full p-4 rounded-2xl border border-primary/10 outline-none font-bold text-primary" />
                </div>
                <button 
                  onClick={() => {
                    martaScheduleDraftOpen.current = true;
                    setScheduleConfirmed(true);
                    setWhatsappLinkConfirmed(false);
                    setShowAccessNote(false);
                    chooseMartaAction('schedule_call');
                  }}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest"
                >
                  Confirmar llamada
                </button>
                {scheduleConfirmed && (
                  <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="text-[13px] font-bold text-accent text-center leading-snug">
                      Tu solicitud de llamada con Marta quedó preparada. Puedes continuar al siguiente paso.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </section>

          <section className="bg-white p-7 rounded-[2rem] border border-accent/10 shadow-sm">
            <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-3 py-1 rounded-full mb-4">Opción 03</span>
            <h3 className="text-[22px] font-black text-primary leading-tight mb-4">Recibir link por WhatsApp</h3>
            <p className="text-[14px] font-bold text-secondary/80 leading-snug mb-5">
              Te enviaremos un link privado por WhatsApp para hablar con Marta más adelante o iniciar contacto posteriormente.
            </p>
            <button 
              onClick={() => {
                martaScheduleDraftOpen.current = false;
                setShowAccessNote(true);
                setShowSchedule(false);
                setScheduleConfirmed(false);
                setWhatsappLinkConfirmed(true);
                chooseMartaAction('whatsapp_link');
              }}
              className="px-6 py-4 rounded-2xl bg-accent/10 text-accent font-black uppercase text-xs tracking-widest active:scale-95 transition-transform"
            >
              Solicitar link
            </button>
          </section>

          {showAccessNote && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10">
              <p className="text-[13px] font-bold text-accent text-center leading-snug">
                Se preparó el envío del link privado por WhatsApp asociado a tu ID de reserva. Podrás hablar con Marta más adelante con verificación de identidad.
              </p>
            </motion.div>
          )}
        </div>

        <button 
          onClick={() => {
            if (!canContinueMarta) return;
            navigateTo('whatsapp_confirmation', 12);
          }}
          disabled={!canContinueMarta}
          className="w-full mt-10 py-8 rounded-[2.5rem] bg-accent text-white font-black uppercase text-lg tracking-widest shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100"
        >
          CONTINUAR <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>
    );
  };

  const WhatsAppConfirmationScreen = () => {
    const [hasReceivedWhatsApp, setHasReceivedWhatsApp] = useState(postReservationStatus.whatsappReceiptConfirmed);

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="p-8 pb-32"
      >
        <BackButton />
        <PostReservationStepBadge current={6} />
        <h2 className="text-[32px] font-black text-accent leading-[1.1] mb-4 tracking-tight uppercase">
          Confirma tu WhatsApp
        </h2>
        <p className="text-secondary font-bold text-lg leading-snug mb-8 opacity-80">
          Para continuar, confirma que recibiste el mensaje de WhatsApp con los detalles relevantes de tu reserva.
        </p>

        <section className="bg-white p-8 rounded-[2.5rem] border border-accent/10 shadow-sm mb-8">
          <span className="inline-block text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-full mb-5">Confirmación obligatoria</span>
          <p className="text-[15px] font-bold text-secondary/80 leading-snug mb-6">
            El mensaje debe incluir la referencia de tu pre reserva, la unidad seleccionada y el siguiente paso de contacto con AMENA.
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
                      Visita tentativa registrada. El equipo de AMENA confirmará disponibilidad.
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
        Recibirás la llamada en el número que registres. Si necesitas cambiar la fecha u hora después, podrás hacerlo escribiendo al WhatsApp de AMENA.
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
      <div className="mb-6">
        <button 
          onClick={() => navigateTo('welcome', 1)}
          className="flex items-center gap-1 text-[10px] font-black text-primary uppercase"
        >
          <ChevronLeft className="w-4 h-4" /> REGRESAR AL INICIO
        </button>
      </div>
      <PostReservationStepBadge current={9} />
      <h2 className="text-[40px] font-black text-accent leading-none mb-6 tracking-tight uppercase">
        Proceso finalizado correctamente
      </h2>
      <p className="text-secondary font-bold text-lg leading-snug mb-10 opacity-80">
        Tu información ha sido registrada exitosamente. Gracias por avanzar en este recorrido con AMENA.
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
            'Un miembro del equipo de AMENA continuará el acompañamiento correspondiente.',
            'Gracias por tu interés en AMENA.'
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

      <button 
        onClick={handleLogout}
        className="w-full py-6 mt-4 rounded-2xl border-2 border-primary/20 text-primary font-black uppercase text-xs tracking-widest hover:bg-primary/5 transition-all"
      >
        CERRAR SESIÓN
      </button>
    </motion.div>
  );

  return (
    <div className="pwa-container">
      <Header />
      <div className="pwa-content">
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
  imageUrl="./sectores/mapa_global.png"
  message="Visualiza la distribución general del proyecto AMENA."
/>

<ImageModal
  isOpen={isSectorMapOpen}
  onClose={() => setIsSectorMapOpen(false)}
  title="Amena - Vista Global"
  imageUrl="./sectores/mapa_global.png"
  message="Todos los espacios pertenecen a un SECTOR. Vista 3D referencial."
/>

<ImageModal
  isOpen={isManzanasModalOpen}
  onClose={() => setIsManzanasModalOpen(false)}
  title="Manzanas disponibles"
imageUrl="./manzanas/Sector01Manzanas.png"
  message="Visualiza las manzanas activas dentro del sector seleccionado."
/>

<ImageModal
  isOpen={isLotesModalOpen}
  onClose={() => setIsLotesModalOpen(false)}
  title="Lotes disponibles"
  imageUrl="./lotes/casalote.png"
  message="Visualiza los lotes disponibles dentro de la manzana seleccionada."
/>

</div>
);
};

export default App;

