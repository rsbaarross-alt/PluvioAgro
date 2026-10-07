import React, { useState, useMemo } from 'react';
import { Farm, Harvest, MeasurementPoint, RainRecord, CompanyProfile } from '../types';
import { exportToCsv, formatDateBr, formatMm, isDateInRange, MONTH_NAMES_BR } from '../utils/formatters';
import { storage } from '../services/storage';
import { downloadPdfReport } from '../utils/pdfGenerator';
import { CustomSelect } from './CustomSelect';
import {
  FileSpreadsheet,
  Download,
  FileText,
  BarChart2,
  Calendar,
  Building2,
  MapPin,
} from 'lucide-react';

interface Props {
  farms: Farm[];
  points: MeasurementPoint[];
  harvests: Harvest[];
  records: RainRecord[];
  activeHarvest?: Harvest;
  company?: CompanyProfile;
}

type ReportGrouping = 'day' | 'month' | 'harvest' | 'farm' | 'point';

interface AggregatedRow {
  id: string;
  title: string;
  subtitle?: string;
  totalMm: number;
  count: number;
  maxMm: number;
  percentageOfTotal: number;
}

export const ReportsView: React.FC<Props> = ({
  farms,
  points,
  harvests,
  records,
  activeHarvest,
  company: companyProp,
}) => {
  const [grouping, setGrouping] = useState<ReportGrouping>('month');
  const [selectedHarvestId, setSelectedHarvestId] = useState<string>(activeHarvest?.id || 'all');
  const [selectedFarmId, setSelectedFarmId] = useState<string>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const company = companyProp || storage.getCompany();

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedFarmId !== 'all' && r.farmId !== selectedFarmId) return false;
      if (selectedHarvestId !== 'all') {
        const h = harvests.find(item => item.id === selectedHarvestId);
        if (h && !isDateInRange(r.date, h.startDate, h.endDate)) return false;
      }
      return true;
    });
  }, [records, selectedFarmId, selectedHarvestId, harvests]);

  const grandTotalMm = Math.round(filteredRecords.reduce((sum, r) => sum + r.amountMm, 0) * 10) / 10;
  const rainyDaysTotal = new Set(filteredRecords.filter(r => r.amountMm > 0).map(r => r.date)).size;
  const averageMm = rainyDaysTotal > 0 ? Math.round((grandTotalMm / rainyDaysTotal) * 10) / 10 : 0;

  const reportRows: AggregatedRow[] = useMemo(() => {
    const map = new Map<string, { title: string; subtitle?: string; totalMm: number; count: number; maxMm: number }>();

    if (grouping === 'day') {
      filteredRecords.forEach(r => {
        const key = r.date;
        const current = map.get(key) || {
          title: formatDateBr(r.date),
          subtitle: `${new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}`,
          totalMm: 0,
          count: 0,
          maxMm: 0,
        };
        current.totalMm += r.amountMm;
        current.count += 1;
        current.maxMm = Math.max(current.maxMm, r.amountMm);
        map.set(key, current);
      });
    } else if (grouping === 'month') {
      filteredRecords.forEach(r => {
        const key = r.date.slice(0, 7);
        const [year, month] = key.split('-');
        const monthName = MONTH_NAMES_BR[month] || month;
        const current = map.get(key) || {
          title: `${monthName} de ${year}`,
          subtitle: `Mês ${month}/${year}`,
          totalMm: 0,
          count: 0,
          maxMm: 0,
        };
        current.totalMm += r.amountMm;
        current.count += 1;
        current.maxMm = Math.max(current.maxMm, r.amountMm);
        map.set(key, current);
      });
    } else if (grouping === 'harvest') {
      harvests.forEach(h => {
        const harvestRecs = (selectedFarmId !== 'all' ? records.filter(r => r.farmId === selectedFarmId) : records)
          .filter(r => isDateInRange(r.date, h.startDate, h.endDate));
        const total = harvestRecs.reduce((sum, r) => sum + r.amountMm, 0);
        const max = harvestRecs.reduce((m, r) => Math.max(m, r.amountMm), 0);
        map.set(h.id, {
          title: h.name,
          subtitle: `${formatDateBr(h.startDate)} a ${formatDateBr(h.endDate)}`,
          totalMm: total,
          count: harvestRecs.length,
          maxMm: max,
        });
      });
    } else if (grouping === 'farm') {
      farms.forEach(f => {
        const farmRecs = filteredRecords.filter(r => r.farmId === f.id);
        const total = farmRecs.reduce((sum, r) => sum + r.amountMm, 0);
        const max = farmRecs.reduce((m, r) => Math.max(m, r.amountMm), 0);
        map.set(f.id, {
          title: f.name,
          subtitle: f.location || 'Sem localização',
          totalMm: total,
          count: farmRecs.length,
          maxMm: max,
        });
      });
    } else if (grouping === 'point') {
      points.forEach(p => {
        if (selectedFarmId !== 'all' && p.farmId !== selectedFarmId) return;
        const farm = farms.find(f => f.id === p.farmId);
        const pointRecs = filteredRecords.filter(r => r.pointId === p.id);
        const total = pointRecs.reduce((sum, r) => sum + r.amountMm, 0);
        const max = pointRecs.reduce((m, r) => Math.max(m, r.amountMm), 0);
        map.set(p.id, {
          title: p.name,
          subtitle: `${farm?.name || 'Fazenda'}${p.areaHa ? ` • ${p.areaHa.toLocaleString('pt-BR')} ha` : ''}`,
          totalMm: total,
          count: pointRecs.length,
          maxMm: max,
        });
      });
    }

    const entries = Array.from(map.entries()).map(([id, data]) => ({
      id,
      title: data.title,
      subtitle: data.subtitle,
      totalMm: Math.round(data.totalMm * 10) / 10,
      count: data.count,
      maxMm: Math.round(data.maxMm * 10) / 10,
      percentageOfTotal: grandTotalMm > 0 ? (data.totalMm / grandTotalMm) * 100 : 0,
    }));

    if (grouping === 'day' || grouping === 'month') {
      return entries.sort((a, b) => b.id.localeCompare(a.id));
    }
    return entries.sort((a, b) => b.totalMm - a.totalMm);
  }, [grouping, filteredRecords, grandTotalMm, harvests, farms, points, records, selectedFarmId]);

  const maxRowMm = Math.max(...reportRows.map(r => r.totalMm), 1);

  // Labels for display & export
  const selectedFarmName = selectedFarmId === 'all'
    ? 'Todas as Fazendas'
    : (farms.find(f => f.id === selectedFarmId)?.name || 'Fazenda');

  const selectedHarvestObj = harvests.find(h => h.id === selectedHarvestId);
  const selectedHarvestName = selectedHarvestId === 'all'
    ? 'Todas as Safras (Histórico Geral)'
    : (selectedHarvestObj?.name || 'Safra Atual');

  const periodText = selectedHarvestObj
    ? `${formatDateBr(selectedHarvestObj.startDate)} a ${formatDateBr(selectedHarvestObj.endDate)}`
    : 'Todo o histórico cadastrado';

  const groupingLabel = {
    day: 'Por Dia',
    month: 'Por Mês',
    harvest: 'Por Safra',
    farm: 'Por Fazenda',
    point: 'Por Talhão',
  }[grouping];

  const reportTitle = {
    day: 'Relatório Diário de Precipitação Pluviométrica',
    month: 'Relatório Mensal Consolidado de Chuvas',
    harvest: 'Relatório Pluviométrico por Safra Agrícola',
    farm: 'Relatório Comparativo de Chuva por Fazenda',
    point: 'Relatório de Índices por Talhão e Ponto',
  }[grouping];

  // Sorted detailed records for PDF generation
  const detailedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
    });
  }, [filteredRecords]);

  const handleExportCsv = () => {
    const titles = {
      day: 'Relatorio_Chuva_Por_Dia',
      month: 'Relatorio_Chuva_Por_Mes',
      harvest: 'Relatorio_Chuva_Por_Safra',
      farm: 'Relatorio_Chuva_Por_Fazenda',
      point: 'Relatorio_Chuva_Por_Talhao',
    };

    const header = ['Identificação', 'Subtítulo', 'Total Acumulado (mm)', 'Quantidade de Lançamentos', 'Maior Chuva (mm)', '% do Total'];
    const rows: (string | number)[][] = [header];

    reportRows.forEach(row => {
      rows.push([
        row.title,
        row.subtitle || '',
        row.totalMm.toString().replace('.', ','),
        row.count,
        row.maxMm.toString().replace('.', ','),
        `${Math.round(row.percentageOfTotal)}%`,
      ]);
    });

    exportToCsv(`${titles[grouping]}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadPdfReport({
        company,
        title: reportTitle,
        farmName: selectedFarmName,
        harvestName: selectedHarvestName,
        periodText,
        groupingLabel,
        grandTotalMm,
        rainyDaysTotal,
        recordsCount: filteredRecords.length,
        averageMm,
        reportRows,
        detailedRecords: detailedRecords.map(rec => {
          const farm = farms.find(f => f.id === rec.farmId)?.name || 'Fazenda';
          const p = points.find(pt => pt.id === rec.pointId);
          const point = p ? `${p.name}${p.areaHa ? ` (${p.areaHa.toLocaleString('pt-BR')} ha)` : ''}` : 'Pluviômetro Geral';
          return {
            date: formatDateBr(rec.date),
            time: rec.time || '07:00',
            farmName: farm,
            pointName: point,
            amountMm: rec.amountMm,
            observation: rec.observation,
          };
        }),
      });
    } catch (error) {
      console.error('Erro ao gerar relatório em PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#143D2B] dark:text-emerald-400" />
            <span>Relatórios Consolidados</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Análise e download direto do relatório profissional em formato PDF
          </p>
        </div>

        {/* Action Buttons: Gerar PDF (Main) & Exportar CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={reportRows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            title="Exportar dados em formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {/* GERAR PDF: Directly compiles the official document and triggers download */}
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Gerar e baixar o relatório oficial em PDF diretamente"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Gerar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls Box */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 space-y-3 shadow-xs transition-colors">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Agrupar Acumulado Por:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {[
              { key: 'day', label: 'Por Dia', icon: Calendar },
              { key: 'month', label: 'Por Mês', icon: Calendar },
              { key: 'harvest', label: 'Por Safra', icon: BarChart2 },
              { key: 'farm', label: 'Por Fazenda', icon: Building2 },
              { key: 'point', label: 'Por Talhão', icon: MapPin },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setGrouping(key as ReportGrouping)}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-md border text-xs font-medium transition-colors ${
                  grouping === key
                    ? 'bg-[#143D2B] text-white border-[#143D2B] font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scope Filters */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <CustomSelect
              label="Fazenda"
              fullWidth
              value={selectedFarmId}
              onChange={setSelectedFarmId}
              options={[
                { value: 'all', label: 'Todas as Fazendas' },
                ...farms.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          </div>

          <div>
            <CustomSelect
              label="Safra / Período"
              fullWidth
              value={selectedHarvestId}
              onChange={setSelectedHarvestId}
              options={[
                { value: 'all', label: 'Todas as Safras (Histórico Completo)' },
                ...harvests.map((h) => ({
                  value: h.id,
                  label: h.name,
                  sublabel: h.isActive ? '(Ativa)' : undefined,
                })),
              ]}
            />
          </div>
        </div>

        {/* Summary Info */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-md border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Volume Total:</span>{' '}
            <strong className="text-slate-900 dark:text-white font-bold text-sm">
              <span className="text-[#143D2B] dark:text-emerald-400">{formatMm(grandTotalMm)}</span>
            </strong>
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            <span>Dias com chuva: </span>
            <strong className="text-slate-900 dark:text-white font-medium">{rainyDaysTotal}</strong>
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            <span>Registros analisados: </span>
            <strong className="text-slate-900 dark:text-white font-medium">{filteredRecords.length}</strong>
          </div>
        </div>
      </div>

      {/* On-screen Table */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {reportRows.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Nenhum dado pluviométrico encontrado para esta visualização.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Item / Período</th>
                  <th className="py-2.5 px-3.5">Acumulado</th>
                  <th className="py-2.5 px-3.5 hidden sm:table-cell">Lançamentos</th>
                  <th className="py-2.5 px-3.5 hidden md:table-cell">Pico Diário</th>
                  <th className="py-2.5 px-3.5 w-1/3">Proporção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {reportRows.map(row => {
                  const widthPercent = maxRowMm > 0 ? (row.totalMm / maxRowMm) * 100 : 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {row.title}
                        </div>
                        {row.subtitle && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {row.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {formatMm(row.totalMm)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                        {row.count} {row.count === 1 ? 'leitura' : 'leituras'}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300 hidden md:table-cell">
                        {row.maxMm > 0 ? formatMm(row.maxMm) : '-'}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xs h-2 overflow-hidden">
                            <div
                              className="bg-[#143D2B] dark:bg-emerald-600 h-2 rounded-xs transition-all duration-200"
                              style={{ width: `${Math.max(widthPercent, row.totalMm > 0 ? 3 : 0)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium w-8 text-right shrink-0">
                            {Math.round(row.percentageOfTotal)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
