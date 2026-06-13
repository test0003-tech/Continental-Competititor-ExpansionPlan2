export interface Dealer {
  brand: string;
  brandKey: string;
  color: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  lat: number;
  lng: number;
  type: string;
  email?: string;
  website?: string;
  network?: string;
  custGroup?: string;
}

export interface BrandStats {
  brand: string;
  brandKey: string;
  color: string;
  count: number;
  states: number;
  cities: number;
}

export interface StateStats {
  state: string;
  total: number;
  continental: number;
  competitors: number;
  brands: Record<string, number>;
}

// India competitor brands
export const BRAND_CONFIG: Record<string, { color: string; label: string; priority: number }> = {
  continental: { color: '#FFD700', label: 'Continental', priority: 0 },
  bridgestone: { color: '#E74C3C', label: 'Bridgestone', priority: 1 },
  mrf: { color: '#E91E63', label: 'MRF', priority: 2 },
  apollo: { color: '#F39C12', label: 'Apollo', priority: 3 },
  goodyear: { color: '#00BCD4', label: 'Goodyear', priority: 4 },
  ceat: { color: '#27AE60', label: 'CEAT', priority: 5 },
  jktyre: { color: '#8E44AD', label: 'JK Tyre', priority: 6 },
  michelin: { color: '#FF9800', label: 'Michelin', priority: 7 },
  yokohama: { color: '#3498DB', label: 'Yokohama', priority: 8 },
};

// Continental sub-brands worldwide
export const CONTINENTAL_SUB_BRANDS: Record<string, { color: string; label: string; priority: number }> = {
  continental: { color: '#FFD700', label: 'Continental', priority: 0 },
  uniroyal: { color: '#4FC3F7', label: 'Uniroyal', priority: 1 },
  generaltire: { color: '#FF7043', label: 'General Tire', priority: 2 },
  semperit: { color: '#AB47BC', label: 'Semperit', priority: 3 },
  barum: { color: '#66BB6A', label: 'Barum', priority: 4 },
  matador: { color: '#EF5350', label: 'Matador', priority: 5 },
  gislaved: { color: '#5C6BC0', label: 'Gislaved', priority: 6 },
  viking: { color: '#26A69A', label: 'Viking', priority: 7 },
  euzkadi: { color: '#FFA726', label: 'Euzkadi', priority: 8 },
  mabor: { color: '#8D6E63', label: 'Mabor', priority: 9 },
  hoosierracingtire: { color: '#EC407A', label: 'Hoosier Racing', priority: 10 },
};
