export interface Model {
  id: string;
  name: string;
  status: 'available' | 'pre_reserved' | 'reserved' | 'sold' | 'blocked';
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  image: string;
  description?: string;
  planImage: string;
  gallery: string[];
}

export interface VisualTarget {
  id: string;
  label: string;
  x: number; // percentage
  y: number; // percentage
}

export interface Level {
  id: string;
  name: string;
  models: Model[];
  visualImage?: string;
  unitTargets?: VisualTarget[];
}

export interface Subsector {
  id: string;
  name: string;
  description: string;
  image: string;
  visualSelectionImage?: string;
  visualTargets?: VisualTarget[];
  levels: Level[];
}

export interface Sector {
  id: string;
  name: string;
  description: string;
  image: string;
  subsectors: Subsector[];
}

const MOD_LUMEN: Model = {
  id: 'lumen',
  name: 'Lumen',
  status: 'available',
  price: '$58,900',
  area: '42 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './demo/apartamento-plano.png',
  description: 'Apartamento compacto con sala integrada, cocina funcional, área de lavado y dormitorio principal.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200',
  gallery: [
    'https://images.unsplash.com/photo-1626014303757-646c3109315d?auto=format&fit=crop&q=80&w=800'
  ]
};

const MOD_LUMEN_OESTE: Model = {
  id: 'lumen-oeste',
  name: 'Lumen Oeste',
  status: 'available',
  price: '$72,500',
  area: '55 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './demo/apartamento-plano.png',
  description: 'Sala-comedor integrada, cocina abierta, área de lavado y dos dormitorios con iluminación natural.',
  planImage: 'https://images.unsplash.com/photo-1581404476143-fb31d742929f?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_LUMEN_ESTE: Model = {
  id: 'lumen-este',
  name: 'Lumen Este',
  status: 'available',
  price: '$73,900',
  area: '56 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './demo/apartamento-plano.png',
  description: 'Distribución abierta con sala-comedor, cocina funcional, área de lavado y dos dormitorios.',
  planImage: 'https://images.unsplash.com/photo-1543333995-a78ee9e53ac5?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_NEXO_OESTE: Model = {
  id: 'nexo-oeste',
  name: 'Nexo Oeste',
  status: 'available',
  price: '$81,900',
  area: '68 m²',
  bedrooms: '2 Hab',
  bathrooms: '1 Baño',
  image: './demo/apartamento-plano.png',
  description: 'Sala-comedor amplia, cocina equipada, lavandería y dormitorios flexibles para vida familiar.',
  planImage: 'https://images.unsplash.com/photo-1536693836173-774900130db5?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_NEXO_ESTE: Model = {
  id: 'nexo-este',
  name: 'Nexo Este',
  status: 'available',
  price: '$83,500',
  area: '69 m²',
  bedrooms: '2 Hab',
  bathrooms: '1 Baño',
  image: './demo/apartamento-plano.png',
  description: 'Sala-comedor conectada, cocina práctica, lavandería y espacios adaptables para familia o estudio.',
  planImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_PRISMA: Model = {
  id: 'prisma',
  name: 'Prisma',
  status: 'available',
  price: '$59,800',
  area: '43 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './demo/apartamento-plano.png',
  description: 'Sala-comedor, cocina compacta, área de lavado, dormitorio principal y baño.',
  planImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_HORIZONTE: Model = {
  id: 'horizonte',
  name: 'Horizonte',
  status: 'available',
  price: '$104,500',
  area: '76 m²',
  bedrooms: '3 Hab',
  bathrooms: '2 Baños',
  image: './demo/apartamento-plano.png',
  description: 'Sala-comedor amplia, cocina abierta, dormitorio principal y dos habitaciones complementarias.',
  planImage: 'https://images.unsplash.com/photo-1626014303757-646c3109315d?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_TERRA: Model = {
  id: 'terra',
  name: 'Modelo Terra',
  status: 'available',
  price: '$128,500',
  area: '138 m²',
  bedrooms: '2 Hab',
  bathrooms: '2 Baños',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
  description: 'Casa funcional con áreas sociales conectadas, jardín posterior y espacios flexibles.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600121848594-d86cc4f5957d?auto=format&fit=crop&q=80&w=800',
  ]
};

const MOD_SERENO: Model = {
  id: 'sereno',
  name: 'Modelo Sereno',
  status: 'reserved',
  price: '$142,000',
  area: '155 m²',
  bedrooms: '3 Hab',
  bathrooms: '2.5 Baños',
  image: 'https://images.unsplash.com/photo-1600607687960-4a2c4a7274b3?auto=format&fit=crop&q=80&w=1000',
  description: 'Casa familiar con ventanales amplios, área social abierta y ambientes de uso flexible.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: [
    'https://images.unsplash.com/photo-1600607687960-4a2c4a7274b3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800',
  ]
};

const MOD_OLIVO: Model = {
  id: 'olivo',
  name: 'Casa Olivo',
  status: 'available',
  price: '$128,500',
  area: '138 m²',
  bedrooms: '3 Hab',
  bathrooms: '2.5 Baños',
  image: './demo/casa-plano.png',
  description: 'Sala-comedor integrada, cocina con isla, tres dormitorios, área de lavado y jardín posterior.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

const MOD_CEDRO: Model = {
  id: 'cedro',
  name: 'Casa Cedro',
  status: 'available',
  price: '$142,000',
  area: '155 m²',
  bedrooms: '3 Hab',
  bathrooms: '2.5 Baños',
  image: './demo/casa-plano.png',
  description: 'Diseño abierto con cocina moderna, tres dormitorios, terraza cubierta y patio familiar.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

const MOD_ROBLE: Model = {
  id: 'roble',
  name: 'Casa Roble',
  status: 'available',
  price: '$119,500',
  area: '126 m²',
  bedrooms: '3 Hab',
  bathrooms: '2 Baños',
  image: './demo/casa-plano.png',
  description: 'Distribución eficiente con sala acogedora, cocina equipada, tres dormitorios y área de servicio.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

const MOD_JACARANDA: Model = {
  id: 'jacaranda',
  name: 'Casa Jacaranda',
  status: 'available',
  price: '$156,000',
  area: '182 m²',
  bedrooms: '4 Hab',
  bathrooms: '3 Baños',
  image: './demo/casa-plano.png',
  description: 'Espacios amplios, sala familiar adicional, cuatro dormitorios, cochera cubierta y jardín.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

export const SECTORS_DATA: Record<string, Sector & { masterPlanImage: string; sectorMapImage: string }> = {
  apartamentos: {
    id: 'apartamentos',
    name: 'Sector Departamentos',
    description: 'Torres con vistas únicas.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    masterPlanImage: './demo/vista-global.png',
    sectorMapImage: './demo/vista-global.png',
    subsectors: [
      {
        id: 'sector01',
        name: 'Sector 01',
        description: 'Entorno urbano y áreas verdes',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
        visualSelectionImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1500',
        visualTargets: [
          { id: 'T1', label: 'T1', x: 25, y: 45 },
          { id: 'T2', label: 'T2', x: 50, y: 45 },
          { id: 'T3', label: 'T3', x: 75, y: 45 },
        ],
        levels: [
          { id: 'piso01', name: 'Nivel 01', models: [MOD_PRISMA, MOD_LUMEN_OESTE, MOD_LUMEN_ESTE, MOD_NEXO_OESTE, MOD_NEXO_ESTE, MOD_HORIZONTE], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', unitTargets: [{ id: '101', label: '101', x: 20, y: 50 }, { id: '102', label: '102', x: 40, y: 50 }, { id: '103', label: '103', x: 60, y: 50 }, { id: '104', label: '104', x: 80, y: 50 }] },
          { id: 'piso02', name: 'Nivel 02', models: [MOD_PRISMA, MOD_LUMEN_OESTE, MOD_LUMEN_ESTE, MOD_NEXO_OESTE, MOD_NEXO_ESTE, MOD_HORIZONTE], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', unitTargets: [{ id: '201', label: '201', x: 30, y: 50 }, { id: '202', label: '202', x: 70, y: 50 }] },
          { id: 'piso03', name: 'Nivel 03', models: [MOD_PRISMA, MOD_LUMEN_OESTE, MOD_LUMEN_ESTE, MOD_NEXO_OESTE, MOD_NEXO_ESTE, MOD_HORIZONTE], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000' },
        ]
      },
      {
        id: 'sector02',
        name: 'Sector 02',
        description: 'Cerca de Centros de Negocio',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
        visualSelectionImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1500',
        visualTargets: [
          { id: 'T4', label: 'T4', x: 30, y: 50 },
          { id: 'T5', label: 'T5', x: 70, y: 50 },
        ],
        levels: [
          { id: 'piso01', name: 'Nivel 01', models: [MOD_PRISMA, MOD_LUMEN_OESTE, MOD_LUMEN_ESTE, MOD_NEXO_OESTE, MOD_NEXO_ESTE, MOD_HORIZONTE], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', unitTargets: [{ id: '101', label: '101', x: 50, y: 50 }] },
        ]
      }
    ]
  },
  casas: {
    id: 'casas',
    name: 'Sector Casas',
    description: 'Residencias con jardín.',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1000',
    masterPlanImage: './demo/vista-global.png',
    sectorMapImage: './demo/vista-global.png',
    subsectors: [
      {
        id: 'etapa1',
        name: 'Sector 01',
        description: 'Jardines del Norte',
        image: './demo/casa-exterior.png',
        levels: [
          { id: 'manzana1', name: 'Manzana 01', models: [MOD_OLIVO, MOD_CEDRO, MOD_ROBLE, MOD_JACARANDA] },
        ]
      }
    ]
  }
};

export const SECTORS: Sector[] = [
  { id: 'sector01', name: 'Sector 01', description: 'Alta demanda', image: '', subsectors: [] },
  { id: 'sector02', name: 'Sector 02', description: 'Cerca de amenidades', image: '', subsectors: [] },
  { id: 'sector03', name: 'Sector 03', description: 'Mejor vista', image: '', subsectors: [] },
  { id: 'sector04', name: 'Sector 04', description: 'Acceso rápido', image: '', subsectors: [] },
  { id: 'sector05', name: 'Sector 05', description: 'Ambiente familiar', image: '', subsectors: [] },
  { id: 'sector06', name: 'Sector 06', description: 'Opciones premium', image: '', subsectors: [] },
];

export const HOUSING_TYPES = [
  { 
    id: 'casas', 
    name: 'Residencial (Casas)', 
    description: 'Privacidad y espacio para crecer.',
    image: './demo/casa-exterior.png',
    pros: ['Jardín privado para mascotas', 'Mayor Independencia acústica', 'Personalización de fachada'],
    cons: ['Mantenimiento exterior propio', 'Inversión inicial mayor'],
    features: ['Cochera para 3 vehículos', 'Área de servicio completa', 'Club privado exclusivo']
  },
  { 
    id: 'apartamentos', 
    name: 'Vertical (Apartamentos)', 
    description: 'Estilo de vida dinámico y seguro.',
    image: './demo/apartamento-exterior.png',
    pros: ['Vistas impresionantes', 'Mantenimiento simplificado', 'Acceso a Amenidades Premium'],
    cons: ['Áreas externas compartidas', 'Regulaciones de convivencia'],
    features: ['Piscina infinita en Rooftop', 'Coworking space', 'Seguridad de alta tecnología']
  },
];
