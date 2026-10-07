export type UserRole = 'proprietario' | 'gerente' | 'operador';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Farm {
  id: string;
  name: string;
  location?: string;
  description?: string;
  totalArea?: number;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementPoint {
  id: string;
  farmId: string;
  name: string;
  code?: string;
  areaHa?: number;
  observation?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Harvest {
  id: string;
  name: string; // Ex: "Safra 2026/2027"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export interface RainRecord {
  id: string;
  farmId: string;
  pointId?: string; // Optional if measured at the whole farm level or specific point
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amountMm: number; // e.g. 15.5
  observation?: string;
  registeredBy?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  farmId: string;
  pointId: string;
  harvestId: string;
  month: string; // 'all' or 'YYYY-MM'
  startDate: string;
  endDate: string;
}

export interface FarmSummary {
  farmId: string;
  farmName: string;
  totalMm: number;
  rainyDays: number;
  lastRain?: {
    date: string;
    amountMm: number;
    pointName?: string;
  };
  pointCount: number;
}

export interface CompanyProfile {
  id: string;
  name: string; // Razão Social / Nome da Empresa Agrícola
  tradeName?: string; // Nome Fantasia
  document?: string; // CPF ou CNPJ
  phone?: string; // Telefone / WhatsApp
  email?: string; // E-mail de Contato
  address?: string; // Endereço / Logradouro
  city?: string; // Cidade
  state?: string; // Estado / UF
  zipCode?: string; // CEP
  logoUrl?: string; // Imagem em base64 Data URL ou URL externa
  updatedAt?: string;
}
