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

const MOD_AMANECER: Model = {
  id: 'amanecer',
  name: 'Amanecer',
  status: 'available',
  price: '$49,900',
  area: '38.8 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './apartamentos/1.png',
  description: 'Unidad optimizada para el estilo de vida moderno. Cuenta con sala, cocina-comedor, área de lavado y cuarto principal.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200',
  gallery: [
    'https://images.unsplash.com/photo-1626014303757-646c3109315d?auto=format&fit=crop&q=80&w=800'
  ]
};

const MOD_AMANECER_OESTE: Model = {
  id: 'amanecer-oeste',
  name: 'Amanecer Oeste',
  status: 'available',
  price: '$69,300',
  area: '51 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './apartamentos/1.png',
  description: 'Sala espaciosa, Cocina-Comedor integrada, Área de Lavado dedicada, Cuarto Principal con ventanal, 1 Cuarto Jr, 1 Baño Compartido moderno.',
  planImage: 'https://images.unsplash.com/photo-1581404476143-fb31d742929f?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_AMANECER_ESTE: Model = {
  id: 'amanecer-este',
  name: 'Amanecer Este',
  status: 'available',
  price: '$69,300',
  area: '51 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './apartamentos/2.png',
  description: 'Sala espaciosa, Cocina-Comedor integrada, Área de Lavado dedicada, Cuarto Principal con ventanal, 1 Cuarto Jr, 1 Baño Compartido moderno.',
  planImage: 'https://images.unsplash.com/photo-1543333995-a78ee9e53ac5?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_BOREAL_OESTE: Model = {
  id: 'boreal-oeste',
  name: 'Boreal Oeste',
  status: 'available',
  price: '$77,275',
  area: '66 m²',
  bedrooms: '2 Hab',
  bathrooms: '1 Baño',
  image: './apartamentos/3.png',
  description: 'Sala de estar amplia, Comedor para 6 personas, Cocina equipada, Lavandería, Suite Principal con baño, 2 Cuartos Jr luminosos, Baño social.',
  planImage: 'https://images.unsplash.com/photo-1536693836173-774900130db5?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_BOREAL_ESTE: Model = {
  id: 'boreal-este',
  name: 'Boreal Este',
  status: 'available',
  price: '$77,275',
  area: '66 m²',
  bedrooms: '2 Hab',
  bathrooms: '1 Baño',
  image: './apartamentos/4.png',
  description: 'Sala de estar amplia, Comedor para 6 personas, Cocina equipada, Lavandería, Suite Principal con baño, 2 Cuartos Jr luminosos, Baño social.',
  planImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_CENIT: Model = {
  id: 'cenit',
  name: 'Cénit',
  status: 'available',
  price: '$49,900',
  area: '39 m²',
  bedrooms: '1 Hab',
  bathrooms: '1 Baño',
  image: './apartamentos/5.png',
  description: 'Sala, Cocina-Comedor, Área de Lavado, Cuarto Principal, 1 Baño',
  planImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_DESTELLO: Model = {
  id: 'destello',
  name: 'Destello',
  status: 'available',
  price: '$92,500',
  area: '72 m²',
  bedrooms: '3 Hab',
  bathrooms: '2 Baños',
  image: './apartamentos/6.png',
  description: 'Sala-Comedor de gran escala, Cocina Gourmet, Master Suite con Walk-in Closet, 2 Habitaciones Jr, 2 Baños de lujo.',
  planImage: 'https://images.unsplash.com/photo-1626014303757-646c3109315d?auto=format&fit=crop&q=80&w=1200',
  gallery: []
};

const MOD_NATURA: Model = {
  id: 'natura',
  name: 'Modelo Natura',
  status: 'available',
  price: '$149,900',
  area: '85m²',
  bedrooms: '2 Hab',
  bathrooms: '2 Baños',
  image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
  description: 'Un espacio diseñado para conectar con la naturaleza desde tu sala. Ideal para parejas jóvenes.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600121848594-d86cc4f5957d?auto=format&fit=crop&q=80&w=800',
  ]
};

const MOD_ZEN: Model = {
  id: 'zen',
  name: 'Modelo Zen',
  status: 'reserved',
  price: '$165,000',
  area: '110m²',
  bedrooms: '3 Hab',
  bathrooms: '2.5 Baños',
  image: 'https://images.unsplash.com/photo-1600607687960-4a2c4a7274b3?auto=format&fit=crop&q=80&w=1000',
  description: 'Serenidad y elegancia en cada rincón de tu nuevo hogar. Amplios ventanales y luz natural.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: [
    'https://images.unsplash.com/photo-1600607687960-4a2c4a7274b3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800',
  ]
};

const MOD_AURA: Model = {
  id: 'aura',
  name: 'Casa Aura',
  status: 'available',
  price: '$125,000',
  area: '145 m²',
  bedrooms: '3 Hab',
  bathrooms: '2.5 Baños',
  image: './casas/7.png',
  description: 'Sala espaciosa, Cocina con isla, Comedor, Área de Lavado, Cuarto Principal con baño, 2 Cuartos Jr, Jardín posterior.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

const MOD_BRISA: Model = {
  id: 'brisa',
  name: 'Casa Brisa',
  status: 'available',
  price: '$135,000',
  area: '160 m²',
  bedrooms: '3 Hab',
  bathrooms: '2.5 Baños',
  image: './casas/8.png',
  description: 'Diseño abierto, Sala-Comedor integrados, Cocina moderna, 3 Habitaciones amplias, Terraza techada, Patio amplio.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

const MOD_BRUMA: Model = {
  id: 'bruma',
  name: 'Casa Bruma',
  status: 'available',
  price: '$115,000',
  area: '130 m²',
  bedrooms: '3 Hab',
  bathrooms: '2 Baños',
  image: './casas/9.png',
  description: 'Eficiencia y confort, Sala acogedora, Comedor funcional, Cocina equipada, 3 Habitaciones, Área de lavado exterior.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

const MOD_CALMA: Model = {
  id: 'calma',
  name: 'Casa Calma',
  status: 'available',
  price: '$145,000',
  area: '175 m²',
  bedrooms: '4 Hab',
  bathrooms: '3 Baños',
  image: './casas/10.png',
  description: 'Espacios generosos para toda la familia, Sala familiar adicional, 4 Habitaciones, Cochera techada, Jardín perimetral.',
  planImage: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1000',
  gallery: []
};

export const SECTORS_DATA: Record<string, Sector & { masterPlanImage: string; sectorMapImage: string }> = {
  apartamentos: {
    id: 'apartamentos',
    name: 'Sector Departamentos',
    description: 'Torres con vistas únicas.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
    masterPlanImage: './sectores/mapa_global.png',
    sectorMapImage: './sectores/mapa_global.png',
    subsectors: [
      {
        id: 'sector01',
        name: 'Sector 01',
        description: 'Vistas al Volcán',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
        visualSelectionImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1500',
        visualTargets: [
          { id: 'T1', label: 'T1', x: 25, y: 45 },
          { id: 'T2', label: 'T2', x: 50, y: 45 },
          { id: 'T3', label: 'T3', x: 75, y: 45 },
        ],
        levels: [
          { id: 'piso01', name: 'Nivel 01', models: [MOD_CENIT, MOD_AMANECER_OESTE, MOD_AMANECER_ESTE, MOD_BOREAL_OESTE, MOD_BOREAL_ESTE, MOD_DESTELLO], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', unitTargets: [{ id: '101', label: '101', x: 20, y: 50 }, { id: '102', label: '102', x: 40, y: 50 }, { id: '103', label: '103', x: 60, y: 50 }, { id: '104', label: '104', x: 80, y: 50 }] },
          { id: 'piso02', name: 'Nivel 02', models: [MOD_CENIT, MOD_AMANECER_OESTE, MOD_AMANECER_ESTE, MOD_BOREAL_OESTE, MOD_BOREAL_ESTE, MOD_DESTELLO], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', unitTargets: [{ id: '201', label: '201', x: 30, y: 50 }, { id: '202', label: '202', x: 70, y: 50 }] },
          { id: 'piso03', name: 'Nivel 03', models: [MOD_CENIT, MOD_AMANECER_OESTE, MOD_AMANECER_ESTE, MOD_BOREAL_OESTE, MOD_BOREAL_ESTE, MOD_DESTELLO], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000' },
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
          { id: 'piso01', name: 'Nivel 01', models: [MOD_CENIT, MOD_AMANECER_OESTE, MOD_AMANECER_ESTE, MOD_BOREAL_OESTE, MOD_BOREAL_ESTE, MOD_DESTELLO], visualImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000', unitTargets: [{ id: '101', label: '101', x: 50, y: 50 }] },
        ]
      }
    ]
  },
  casas: {
    id: 'casas',
    name: 'Sector Casas',
    description: 'Residencias con jardín.',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1000',
    masterPlanImage: './sectores/mapa_global.png',
    sectorMapImage: './sectores/mapa_global.png',
    subsectors: [
      {
        id: 'etapa1',
        name: 'Sector 01',
        description: 'Villas del Sendero',
        image: './casas/7.png',
        levels: [
          { id: 'manzana1', name: 'Manzana 01', models: [MOD_AURA, MOD_BRISA, MOD_BRUMA, MOD_CALMA] },
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
    image: './casavsapto/Casa02.png',
    pros: ['Jardín privado para mascotas', 'Mayor Independencia acústica', 'Personalización de fachada'],
    cons: ['Mantenimiento exterior propio', 'Inversión inicial mayor'],
    features: ['Cochera para 3 vehículos', 'Área de servicio completa', 'Club privado exclusivo']
  },
  { 
    id: 'apartamentos', 
    name: 'Vertical (Apartamentos)', 
    description: 'Estilo de vida dinámico y seguro.',
    image: './casavsapto/Apartamento.png',
    pros: ['Vistas impresionantes', 'Mantenimiento simplificado', 'Acceso a Amenidades Premium'],
    cons: ['Áreas externas compartidas', 'Regulaciones de convivencia'],
    features: ['Piscina infinita en Rooftop', 'Coworking space', 'Seguridad de alta tecnología']
  },
];
