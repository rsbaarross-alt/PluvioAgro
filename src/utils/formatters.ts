/**
 * Funções utilitárias de formatação em padrão brasileiro (pt-BR)
 */

export function formatMm(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0,0 mm';
  return `${val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mm`;
}

export function formatMmValueOnly(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0,0';
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDateBr(isoDate: string): string {
  if (!isoDate) return '-';
  // Handles YYYY-MM-DD
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return isoDate;
  }
}

export function formatDateTimeBr(dateStr: string, timeStr?: string): string {
  const d = formatDateBr(dateStr);
  if (!timeStr) return d;
  return `${d} às ${timeStr}`;
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeIso(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getCurrentYearMonthIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseMmInput(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;
  // Replace comma with dot for brazilian decimal entry
  const sanitized = input.toString().replace(',', '.').trim();
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : Math.round(num * 10) / 10;
}

export const MONTH_NAMES_BR: { [key: string]: string } = {
  '01': 'Janeiro',
  '02': 'Fevereiro',
  '03': 'Março',
  '04': 'Abril',
  '05': 'Maio',
  '06': 'Junho',
  '07': 'Julho',
  '08': 'Agosto',
  '09': 'Setembro',
  '10': 'Outubro',
  '11': 'Novembro',
  '12': 'Dezembro',
};

export function formatMonthYearBr(yearMonth: string): string {
  if (!yearMonth || !yearMonth.includes('-')) return yearMonth;
  const [year, month] = yearMonth.split('-');
  const name = MONTH_NAMES_BR[month] || month;
  return `${name} de ${year}`;
}

export function isDateInRange(date: string, startDate?: string, endDate?: string): boolean {
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

/**
 * Converte dados em arquivo CSV para download
 */
export function exportToCsv(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map(val => {
        const text = String(val ?? '');
        if (text.search(/("|,|\n)/g) >= 0) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      })
      .join(';'); // Semicolon is standard for Brazilian Excel
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
