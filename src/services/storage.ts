import { Farm, MeasurementPoint, Harvest, RainRecord, User, CompanyProfile } from '../types';
import {
  DEMO_FARM,
  DEMO_HARVEST,
  DEMO_POINTS,
  DEMO_RAIN_RECORDS,
  DEMO_FARM_ID,
  DEMO_HARVEST_ID,
} from './demoData';

const DB_NAME = 'pluvioagro_db';
const DB_VERSION = 1;

// Fallback keys for localStorage
const STORAGE_KEYS = {
  FARMS: 'pluvioagro_farms',
  POINTS: 'pluvioagro_points',
  HARVESTS: 'pluvioagro_harvests',
  RECORDS: 'pluvioagro_records',
  USER: 'pluvioagro_user',
  USERS_LIST: 'pluvioagro_users_list',
  COMPANY: 'pluvioagro_company',
  AUTH: 'pluvioagro_auth_authenticated',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Initial defaults when app is first loaded
const DEFAULT_HARVEST: Harvest = {
  id: 'safra-2026-2027',
  name: 'Safra 2026/2027',
  startDate: '2026-09-01',
  endDate: '2027-08-31',
  isActive: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_FARMS: Farm[] = [
  {
    id: 'fazenda-sao-paulo',
    name: 'Fazenda São Paulo',
    location: 'Sorriso - MT',
    totalArea: 2138,
    description: 'Área total da Fazenda São Paulo: 2.138 ha',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fazenda-moitara',
    name: 'Fazenda Moitará',
    location: 'Mato Grosso',
    totalArea: 1177,
    description: 'Área total da Fazenda Moitará: 1.177 ha',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_POINTS: MeasurementPoint[] = [
  // FAZENDA SÃO PAULO (Sede + 18 talhões - Prefixo SP - Total: 2.138 ha)
  { id: 'talhao-sp-sede', farmId: 'fazenda-sao-paulo', code: 'SEDE', name: 'Sede', observation: 'Sede da Fazenda São Paulo - Pluviômetro Principal', createdAt: new Date().toISOString() },
  { id: 'talhao-sp01', farmId: 'fazenda-sao-paulo', code: 'SP01', name: 'SP01', areaHa: 122, observation: 'Área: 122 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp02', farmId: 'fazenda-sao-paulo', code: 'SP02', name: 'SP02', areaHa: 110, observation: 'Área: 110 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp03', farmId: 'fazenda-sao-paulo', code: 'SP03', name: 'SP03', areaHa: 132, observation: 'Área: 132 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp04', farmId: 'fazenda-sao-paulo', code: 'SP04', name: 'SP04', areaHa: 128, observation: 'Área: 128 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp05', farmId: 'fazenda-sao-paulo', code: 'SP05', name: 'SP05', areaHa: 141, observation: 'Área: 141 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp06', farmId: 'fazenda-sao-paulo', code: 'SP06', name: 'SP06', areaHa: 139, observation: 'Área: 139 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp07', farmId: 'fazenda-sao-paulo', code: 'SP07', name: 'SP07', areaHa: 115, observation: 'Área: 115 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp08', farmId: 'fazenda-sao-paulo', code: 'SP08', name: 'SP08', areaHa: 124, observation: 'Área: 124 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp09', farmId: 'fazenda-sao-paulo', code: 'SP09', name: 'SP09', areaHa: 115, observation: 'Área: 115 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp10', farmId: 'fazenda-sao-paulo', code: 'SP10', name: 'SP10', areaHa: 110, observation: 'Área: 110 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp11', farmId: 'fazenda-sao-paulo', code: 'SP11', name: 'SP11', areaHa: 119, observation: 'Área: 119 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp12', farmId: 'fazenda-sao-paulo', code: 'SP12', name: 'SP12', areaHa: 104, observation: 'Área: 104 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp13', farmId: 'fazenda-sao-paulo', code: 'SP13', name: 'SP13', areaHa: 115, observation: 'Área: 115 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp14', farmId: 'fazenda-sao-paulo', code: 'SP14', name: 'SP14', areaHa: 114, observation: 'Área: 114 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp15', farmId: 'fazenda-sao-paulo', code: 'SP15', name: 'SP15', areaHa: 121, observation: 'Área: 121 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp16', farmId: 'fazenda-sao-paulo', code: 'SP16', name: 'SP16', areaHa: 94, observation: 'Área: 94 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp17', farmId: 'fazenda-sao-paulo', code: 'SP17', name: 'SP17', areaHa: 111, observation: 'Área: 111 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-sp18', farmId: 'fazenda-sao-paulo', code: 'SP18', name: 'SP18', areaHa: 125, observation: 'Área: 125 ha', createdAt: new Date().toISOString() },

  // FAZENDA MOITARÁ (Sede + 9 talhões e subdivisões - Prefixo M - Total: 1.177 ha)
  { id: 'talhao-m-sede', farmId: 'fazenda-moitara', code: 'SEDE', name: 'Sede', observation: 'Sede da Fazenda Moitará - Pluviômetro Principal', createdAt: new Date().toISOString() },
  { id: 'talhao-m01', farmId: 'fazenda-moitara', code: 'M01', name: 'M01', areaHa: 149, observation: 'Área: 149 ha (M1)', createdAt: new Date().toISOString() },
  { id: 'talhao-m02', farmId: 'fazenda-moitara', code: 'M02', name: 'M02', areaHa: 140, observation: 'Área: 140 ha (M2)', createdAt: new Date().toISOString() },
  { id: 'talhao-m03', farmId: 'fazenda-moitara', code: 'M03', name: 'M03', areaHa: 184, observation: 'Área: 184 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-m04', farmId: 'fazenda-moitara', code: 'M04', name: 'M04', areaHa: 188, observation: 'Área: 188 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-m04a', farmId: 'fazenda-moitara', code: 'M4 A', name: 'M4 A', areaHa: 94, observation: 'Talhão M04 - Subdivisão A', createdAt: new Date().toISOString() },
  { id: 'talhao-m04b', farmId: 'fazenda-moitara', code: 'M4 B', name: 'M4 B', areaHa: 94, observation: 'Talhão M04 - Subdivisão B', createdAt: new Date().toISOString() },
  { id: 'talhao-m05', farmId: 'fazenda-moitara', code: 'M05', name: 'M05', areaHa: 110, observation: 'Área: 110 ha (M5)', createdAt: new Date().toISOString() },
  { id: 'talhao-m06', farmId: 'fazenda-moitara', code: 'M06', name: 'M06', areaHa: 75, observation: 'Área: 75 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-m07', farmId: 'fazenda-moitara', code: 'M07', name: 'M07', areaHa: 99.42, observation: 'Área: 99,42 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-m08', farmId: 'fazenda-moitara', code: 'M08', name: 'M08', areaHa: 101, observation: 'Área: 101 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-m09', farmId: 'fazenda-moitara', code: 'M09', name: 'M09', areaHa: 130, observation: 'Área: 130 ha', createdAt: new Date().toISOString() },
  { id: 'talhao-m08-09', farmId: 'fazenda-moitara', code: 'M8/9', name: 'M8/9', areaHa: 231, observation: 'Talhões M08 e M09 conjugados', createdAt: new Date().toISOString() },
];

const DEFAULT_USER: User = {
  id: 'user-default',
  name: 'Produtor Rural',
  email: 'produtor@fazenda.com.br',
  role: 'proprietario',
  createdAt: new Date().toISOString(),
};

const DEFAULT_COMPANY: CompanyProfile = {
  id: 'empresa-default',
  name: 'Agropecuária São Paulo',
  tradeName: 'Agropecuária São Paulo',
  document: '12.345.678/0001-90',
  phone: '(66) 3544-0000',
  email: 'contato@agrosaopaulo.agr.br',
  address: 'Rodovia BR-163, Km 740',
  city: 'Sorriso',
  state: 'MT',
  zipCode: '78890-000',
  updatedAt: new Date().toISOString(),
};

// Dados Reais Lançados: Chuvas acumuladas de 07/09 até 02/10 informadas por Jonas Gaklik
export const DEFAULT_REAL_RECORDS: RainRecord[] = [
  // FAZENDA SÃO PAULO
  {
    id: 'rec-sp-sede-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp-sede',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 35,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Sede São Paulo',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-04-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp04',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 33,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP04',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-07-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp07',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 25,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP07',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-09-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp09',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 28,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP09',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-10-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp10',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 22,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP10',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-11-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp11',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 20,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP11',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-12-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp12',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 22,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP12',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-16-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp16',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 26,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP16',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-17-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp17',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 18,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP17',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-sp-18-0210',
    farmId: 'fazenda-sao-paulo',
    pointId: 'talhao-sp18',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 30,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão SP18',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },

  // FAZENDA MOITARÁ
  {
    id: 'rec-moit-sede-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m-sede',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 16,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Sede Moitará',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-moit-01-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m01',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 24,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão M1',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-moit-02-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m02',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 20,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão M2',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-moit-04a-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m04a',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 23,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão M4 A',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-moit-04b-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m04b',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 26,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão M4 B',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-moit-05-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m05',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 25,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão M5',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rec-moit-08-09-0210',
    farmId: 'fazenda-moitara',
    pointId: 'talhao-m08-09',
    date: '2026-10-02',
    time: '07:00',
    amountMm: 28,
    observation: 'Chuva acumulada de 07/09 até 02/10 - Talhão M8/9',
    registeredBy: 'Jonas Gaklik',
    createdAt: '2026-10-02T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
];

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB indisponível'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('farms')) {
          db.createObjectStore('farms', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('points')) {
          db.createObjectStore('points', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('harvests')) {
          db.createObjectStore('harvests', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id' });
          recordStore.createIndex('farmId', 'farmId', { unique: false });
          recordStore.createIndex('date', 'date', { unique: false });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('Erro ao abrir IndexedDB, utilizando localStorage fallback', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Generic getter
  private async getAllFromStore<T extends { id: string }>(storeName: string, fallbackKey: string, initialDefault?: T[]): Promise<T[]> {
    try {
      const db = await this.initDatabase();
      return new Promise<T[]>((resolve) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => {
          const results = req.result as T[];
          if ((!results || results.length === 0) && initialDefault) {
            // Seed store
            this.seedStore(storeName, initialDefault).then(() => resolve(initialDefault));
          } else {
            resolve(results || []);
          }
        };

        req.onerror = () => {
          resolve(this.getFromLocalStorage<T[]>(fallbackKey, initialDefault || []));
        };
      });
    } catch {
      return this.getFromLocalStorage<T[]>(fallbackKey, initialDefault || []);
    }
  }

  private async seedStore<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    try {
      const db = await this.initDatabase();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      items.forEach(item => store.put(item));
    } catch {
      // Fallback
    }
  }

  private async saveToStore<T extends { id: string }>(storeName: string, fallbackKey: string, item: T): Promise<T> {
    try {
      const db = await this.initDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn(`Fallback localStorage save for ${storeName}`, err);
      const items = this.getFromLocalStorage<T[]>(fallbackKey, []);
      const index = items.findIndex(i => i.id === item.id);
      if (index >= 0) {
        items[index] = item;
      } else {
        items.push(item);
      }
      this.saveToLocalStorage(fallbackKey, items);
    }
    return item;
  }

  private async deleteFromStore(storeName: string, fallbackKey: string, id: string): Promise<boolean> {
    try {
      const db = await this.initDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const items = this.getFromLocalStorage<{ id: string }[]>(fallbackKey, []);
      const filtered = items.filter(i => i.id !== id);
      this.saveToLocalStorage(fallbackKey, filtered);
    }
    return true;
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('LocalStorage quota exceeded or unavailable', err);
    }
  }

  /* FARMS */
  async getFarms(): Promise<Farm[]> {
    let farms = await this.getAllFromStore<Farm>('farms', STORAGE_KEYS.FARMS, DEFAULT_FARMS);

    // Remove old initial placeholder 'fazenda-modelo' if present
    if (farms.some(f => f.id === 'fazenda-modelo')) {
      await this.deleteFromStore('farms', STORAGE_KEYS.FARMS, 'fazenda-modelo');
      farms = farms.filter(f => f.id !== 'fazenda-modelo');
    }

    // Ensure Fazenda São Paulo and Fazenda Moitará exist with their official data
    for (const defFarm of DEFAULT_FARMS) {
      const idx = farms.findIndex(f => f.id === defFarm.id || f.name.toLowerCase() === defFarm.name.toLowerCase());
      if (idx === -1) {
        await this.saveFarm(defFarm);
        farms.push(defFarm);
      } else {
        if (!farms[idx].totalArea && defFarm.totalArea) {
          farms[idx].totalArea = defFarm.totalArea;
          await this.saveFarm(farms[idx]);
        }
      }
    }

    return farms;
  }

  async saveFarm(farmData: Partial<Farm> & { name: string }): Promise<Farm> {
    const isNew = !farmData.id;
    const farm: Farm = {
      id: farmData.id || generateId(),
      name: farmData.name.trim(),
      location: farmData.location?.trim() || '',
      description: farmData.description?.trim() || '',
      totalArea: typeof farmData.totalArea === 'number' ? farmData.totalArea : undefined,
      createdAt: isNew ? new Date().toISOString() : (farmData.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    };
    return this.saveToStore<Farm>('farms', STORAGE_KEYS.FARMS, farm);
  }

  async deleteFarm(id: string): Promise<boolean> {
    await this.deleteFromStore('farms', STORAGE_KEYS.FARMS, id);
    // Also delete or cascade its points and records if desired, or keep them marked
    const points = await this.getPoints();
    const farmPoints = points.filter(p => p.farmId === id);
    for (const p of farmPoints) {
      await this.deletePoint(p.id);
    }
    return true;
  }

  /* MEASUREMENT POINTS */
  async getPoints(): Promise<MeasurementPoint[]> {
    let points = await this.getAllFromStore<MeasurementPoint>('points', STORAGE_KEYS.POINTS, DEFAULT_POINTS);

    // Clean up old initial mock points ('ponto-sede', 'ponto-talhao-4')
    const oldMocks = ['ponto-sede', 'ponto-talhao-4'];
    for (const oldId of oldMocks) {
      if (points.some(p => p.id === oldId)) {
        await this.deleteFromStore('points', STORAGE_KEYS.POINTS, oldId);
        points = points.filter(p => p.id !== oldId);
      }
    }

    // Ensure all 27 talhões (SP01..SP18 and M01..M09) are registered and bound to their farms
    for (const defPt of DEFAULT_POINTS) {
      const idx = points.findIndex(p => p.name === defPt.name && (p.farmId === defPt.farmId || p.id === defPt.id));
      if (idx === -1) {
        await this.savePoint(defPt);
        points.push(defPt);
      } else {
        let changed = false;
        if (points[idx].farmId !== defPt.farmId) {
          points[idx].farmId = defPt.farmId;
          changed = true;
        }
        if (points[idx].areaHa !== defPt.areaHa) {
          points[idx].areaHa = defPt.areaHa;
          changed = true;
        }
        if (points[idx].code !== defPt.code) {
          points[idx].code = defPt.code;
          changed = true;
        }
        if (changed) {
          await this.savePoint(points[idx]);
        }
      }
    }

    return points;
  }

  async savePoint(pointData: Partial<MeasurementPoint> & { name: string; farmId: string }): Promise<MeasurementPoint> {
    const isNew = !pointData.id;
    const point: MeasurementPoint = {
      id: pointData.id || generateId(),
      farmId: pointData.farmId,
      name: pointData.name.trim(),
      code: pointData.code || pointData.name.trim(),
      areaHa: typeof pointData.areaHa === 'number' ? pointData.areaHa : undefined,
      observation: pointData.observation?.trim() || '',
      createdAt: isNew ? new Date().toISOString() : (pointData.createdAt || new Date().toISOString()),
    };
    return this.saveToStore<MeasurementPoint>('points', STORAGE_KEYS.POINTS, point);
  }

  async deletePoint(id: string): Promise<boolean> {
    return this.deleteFromStore('points', STORAGE_KEYS.POINTS, id);
  }

  /* HARVESTS */
  async getHarvests(): Promise<Harvest[]> {
    return this.getAllFromStore<Harvest>('harvests', STORAGE_KEYS.HARVESTS, [DEFAULT_HARVEST]);
  }

  async saveHarvest(harvestData: Partial<Harvest> & { name: string; startDate: string; endDate: string }): Promise<Harvest> {
    const isNew = !harvestData.id;
    const harvest: Harvest = {
      id: harvestData.id || generateId(),
      name: harvestData.name.trim(),
      startDate: harvestData.startDate,
      endDate: harvestData.endDate,
      isActive: harvestData.isActive ?? true,
      createdAt: isNew ? new Date().toISOString() : (harvestData.createdAt || new Date().toISOString()),
    };

    // If active, ensure others can be updated
    if (harvest.isActive) {
      const all = await this.getHarvests();
      for (const h of all) {
        if (h.id !== harvest.id && h.isActive) {
          await this.saveToStore('harvests', STORAGE_KEYS.HARVESTS, { ...h, isActive: false });
        }
      }
    }

    return this.saveToStore<Harvest>('harvests', STORAGE_KEYS.HARVESTS, harvest);
  }

  async setActiveHarvest(harvestId: string): Promise<Harvest[]> {
    const harvests = await this.getHarvests();
    const updated: Harvest[] = [];
    for (const h of harvests) {
      const isTarget = h.id === harvestId;
      const mod = { ...h, isActive: isTarget };
      await this.saveToStore('harvests', STORAGE_KEYS.HARVESTS, mod);
      updated.push(mod);
    }
    return updated;
  }

  async deleteHarvest(id: string): Promise<boolean> {
    return this.deleteFromStore('harvests', STORAGE_KEYS.HARVESTS, id);
  }

  /* RAIN RECORDS */
  async getRecords(): Promise<RainRecord[]> {
    let records = await this.getAllFromStore<RainRecord>('records', STORAGE_KEYS.RECORDS, DEFAULT_REAL_RECORDS);

    // Ensure all 17 real records from Jonas Gaklik are registered in the store
    for (const defRec of DEFAULT_REAL_RECORDS) {
      if (!records.some(r => r.id === defRec.id)) {
        await this.saveToStore<RainRecord>('records', STORAGE_KEYS.RECORDS, defRec);
        records.push(defRec);
      }
    }

    return records.sort((a, b) => b.date.localeCompare(a.date) || (b.time || '').localeCompare(a.time || ''));
  }

  async saveRecord(recordData: Partial<RainRecord> & { farmId: string; date: string; amountMm: number }): Promise<RainRecord> {
    const isNew = !recordData.id;
    const nowIso = new Date().toISOString();
    const record: RainRecord = {
      id: recordData.id || generateId(),
      farmId: recordData.farmId,
      pointId: recordData.pointId || '',
      date: recordData.date,
      time: recordData.time || '07:00',
      amountMm: Number(recordData.amountMm),
      observation: recordData.observation?.trim() || '',
      registeredBy: recordData.registeredBy || 'Operador',
      createdAt: isNew ? nowIso : (recordData.createdAt || nowIso),
      updatedAt: nowIso,
    };
    return this.saveToStore<RainRecord>('records', STORAGE_KEYS.RECORDS, record);
  }

  async deleteRecord(id: string): Promise<boolean> {
    return this.deleteFromStore('records', STORAGE_KEYS.RECORDS, id);
  }

  /* USERS & AUTH */
  isAuthenticated(): boolean {
    return this.getFromLocalStorage<boolean>(STORAGE_KEYS.AUTH, false);
  }

  setAuthenticated(value: boolean): void {
    this.saveToLocalStorage(STORAGE_KEYS.AUTH, value);
  }

  logout(): void {
    this.saveToLocalStorage(STORAGE_KEYS.AUTH, false);
  }

  getCurrentUser(): User {
    const stored = this.getFromLocalStorage<User | null>(STORAGE_KEYS.USER, null);
    if (!stored) {
      this.saveToLocalStorage(STORAGE_KEYS.USER, DEFAULT_USER);
      return DEFAULT_USER;
    }
    return stored;
  }

  setCurrentUser(user: User): void {
    this.saveToLocalStorage(STORAGE_KEYS.USER, user);
  }

  async getUsers(): Promise<User[]> {
    return this.getAllFromStore<User>('users', STORAGE_KEYS.USERS_LIST, [DEFAULT_USER]);
  }

  async saveUser(user: User): Promise<User> {
    this.saveToLocalStorage(STORAGE_KEYS.USER, user);
    return this.saveToStore<User>('users', STORAGE_KEYS.USERS_LIST, user);
  }

  /* COMPANY / ISSUER PROFILE */
  getCompany(): CompanyProfile {
    const stored = this.getFromLocalStorage<CompanyProfile | null>(STORAGE_KEYS.COMPANY, null);
    if (!stored) {
      this.saveToLocalStorage(STORAGE_KEYS.COMPANY, DEFAULT_COMPANY);
      return DEFAULT_COMPANY;
    }
    return stored;
  }

  saveCompany(companyData: Partial<CompanyProfile>): CompanyProfile {
    const current = this.getCompany();
    const updated: CompanyProfile = {
      ...current,
      ...companyData,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage(STORAGE_KEYS.COMPANY, updated);
    return updated;
  }

  /* DEMO DATA MANAGEMENT (TEMPORARY FOR TESTING) */
  async ensureDemoDataLoaded(): Promise<void> {
    try {
      const farms = await this.getAllFromStore<Farm>('farms', STORAGE_KEYS.FARMS, []);
      if (!farms.some(f => f.id === DEMO_FARM_ID || f.name === DEMO_FARM.name)) {
        await this.saveToStore<Farm>('farms', STORAGE_KEYS.FARMS, DEMO_FARM);
      }

      const harvests = await this.getAllFromStore<Harvest>('harvests', STORAGE_KEYS.HARVESTS, []);
      if (!harvests.some(h => h.name === DEMO_HARVEST.name)) {
        await this.saveToStore<Harvest>('harvests', STORAGE_KEYS.HARVESTS, DEMO_HARVEST);
      } else {
        const h26 = harvests.find(h => h.name === DEMO_HARVEST.name);
        if (h26 && !h26.isActive) {
          await this.setActiveHarvest(h26.id);
        }
      }

      const points = await this.getAllFromStore<MeasurementPoint>('points', STORAGE_KEYS.POINTS, []);
      for (const p of DEMO_POINTS) {
        if (!points.some(existing => existing.id === p.id || (existing.farmId === DEMO_FARM_ID && existing.name === p.name))) {
          await this.saveToStore<MeasurementPoint>('points', STORAGE_KEYS.POINTS, p);
        }
      }

      const records = await this.getAllFromStore<RainRecord>('records', STORAGE_KEYS.RECORDS, []);
      for (const r of DEMO_RAIN_RECORDS) {
        if (!records.some(existing => existing.id === r.id)) {
          await this.saveToStore<RainRecord>('records', STORAGE_KEYS.RECORDS, r);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar dados de demonstração', err);
    }
  }

  async removeDemoData(): Promise<void> {
    try {
      // Remove demo records
      const records = await this.getAllFromStore<RainRecord>('records', STORAGE_KEYS.RECORDS, []);
      for (const r of records) {
        if (r.isDemo || r.farmId === DEMO_FARM_ID) {
          await this.deleteFromStore('records', STORAGE_KEYS.RECORDS, r.id);
        }
      }

      // Remove demo points
      const points = await this.getAllFromStore<MeasurementPoint>('points', STORAGE_KEYS.POINTS, []);
      for (const p of points) {
        if (p.isDemo || p.farmId === DEMO_FARM_ID) {
          await this.deleteFromStore('points', STORAGE_KEYS.POINTS, p.id);
        }
      }

      // Remove demo farm
      await this.deleteFromStore('farms', STORAGE_KEYS.FARMS, DEMO_FARM_ID);
    } catch (err) {
      console.warn('Erro ao remover dados de demonstração', err);
    }
  }

  /* FULL BACKUP / RESTORE */
  async exportBackup(): Promise<string> {
    const farms = await this.getFarms();
    const points = await this.getPoints();
    const harvests = await this.getHarvests();
    const records = await this.getRecords();
    const user = this.getCurrentUser();
    const company = this.getCompany();

    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      user,
      company,
      farms,
      points,
      harvests,
      records,
    };

    return JSON.stringify(backupData, null, 2);
  }

  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (!data.farms || !data.records) {
        throw new Error('Formato de arquivo inválido');
      }

      if (Array.isArray(data.farms)) {
        for (const f of data.farms) await this.saveToStore('farms', STORAGE_KEYS.FARMS, f);
      }
      if (Array.isArray(data.points)) {
        for (const p of data.points) await this.saveToStore('points', STORAGE_KEYS.POINTS, p);
      }
      if (Array.isArray(data.harvests)) {
        for (const h of data.harvests) await this.saveToStore('harvests', STORAGE_KEYS.HARVESTS, h);
      }
      if (Array.isArray(data.records)) {
        for (const r of data.records) await this.saveToStore('records', STORAGE_KEYS.RECORDS, r);
      }
      if (data.user) {
        this.setCurrentUser(data.user);
      }
      if (data.company) {
        this.saveCompany(data.company);
      }
      return true;
    } catch (err) {
      console.error('Falha ao importar backup', err);
      return false;
    }
  }
}

export const storage = new StorageService();
