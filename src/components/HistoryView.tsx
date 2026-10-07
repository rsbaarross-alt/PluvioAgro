import React, { useState, useMemo } from 'react';
import { Farm, Harvest, MeasurementPoint, RainRecord } from '../types';
import { exportToCsv, formatDateBr, formatMm, isDateInRange, MONTH_NAMES_BR } from '../utils/formatters';
import { CustomSelect } from './CustomSelect';
import { History, Filter, Download, Edit2, Trash2, RotateCcw, Droplets } from 'lucide-react';

interface Props {
  farms: Farm[];
  points: MeasurementPoint[];
  harvests: Harvest[];
  records: RainRecord[];
  initialFarmId?: string;
  onEditRecord: (record: RainRecord) => void;
  onDeleteRecord: (recordId: string) => Promise<void>;
  onOpenNewRainModal: (farmId?: string) => void;
}

export const HistoryView: React.FC<Props> = ({
  farms,
  points,
  harvests,
  records,
  initialFarmId = 'all',
  onEditRecord,
  onDeleteRecord,
  onOpenNewRainModal,
}) => {
  const [farmFilter, setFarmFilter] = useState<string>(initialFarmId);
  const [pointFilter, setPointFilter] = useState<string>('all');
  const [harvestFilter, setHarvestFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleHarvestChange = (hId: string) => {
    setHarvestFilter(hId);
    if (hId !== 'all') {
      const h = harvests.find(item => item.id === hId);
      if (h) {
        setStartDate(h.startDate);
        setEndDate(h.endDate);
        setMonthFilter('all');
      }
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setFarmFilter('all');
    setPointFilter('all');
    setHarvestFilter('all');
    setMonthFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        if (farmFilter !== 'all' && record.farmId !== farmFilter) return false;
        if (pointFilter !== 'all' && record.pointId !== pointFilter) return false;
        if (monthFilter !== 'all' && !record.date.startsWith(monthFilter)) return false;
        if (!isDateInRange(record.date, startDate || undefined, endDate || undefined)) return false;
        return true;
      })
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }, [records, farmFilter, pointFilter, monthFilter, startDate, endDate]);

  const totalFilteredMm = Math.round(filteredRecords.reduce((sum, r) => sum + r.amountMm, 0) * 10) / 10;
  const rainyDaysCount = new Set(filteredRecords.filter(r => r.amountMm > 0).map(r => r.date)).size;
  const avgPerRainyDay = rainyDaysCount > 0 ? Math.round((totalFilteredMm / rainyDaysCount) * 10) / 10 : 0;

  const availablePoints = farmFilter === 'all'
    ? points
    : points.filter(p => p.farmId === farmFilter);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    records.forEach(r => {
      if (r.date && r.date.length >= 7) {
        monthsSet.add(r.date.slice(0, 7));
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [records]);

  const handleExportCsv = () => {
    const rows: (string | number)[][] = [
      ['Data', 'Horário', 'Fazenda', 'Talhão / Ponto', 'Precipitação (mm)', 'Observação', 'Registrado Por']
    ];

    filteredRecords.forEach(r => {
      const f = farms.find(farm => farm.id === r.farmId)?.name || 'Fazenda';
      const p = points.find(point => point.id === r.pointId)?.name || 'Pluviômetro Geral';
      rows.push([
        formatDateBr(r.date),
        r.time,
        f,
        p,
        r.amountMm.toString().replace('.', ','),
        r.observation || '',
        r.registeredBy || '',
      ]);
    });

    exportToCsv(`historico_chuvas_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  const handleDelete = async (record: RainRecord) => {
    if (window.confirm(`Excluir lançamento de ${formatMm(record.amountMm)} do dia ${formatDateBr(record.date)}?`)) {
      await onDeleteRecord(record.id);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-[#143D2B] dark:text-emerald-400" />
            <span>Histórico de Registros</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consulta detalhada e filtros de medições pluviométricas
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCsv}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Planilha</span>
          </button>
          <button
            onClick={() => onOpenNewRainModal(farmFilter !== 'all' ? farmFilter : undefined)}
            className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Filter Box */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 space-y-3 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-[#143D2B] dark:text-emerald-400" />
            <span>Filtros de Pesquisa</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Redefinir</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Fazenda */}
          <div>
            <CustomSelect
              label="Fazenda"
              fullWidth
              value={farmFilter}
              onChange={(val) => {
                setFarmFilter(val);
                setPointFilter('all');
              }}
              options={[
                { value: 'all', label: 'Todas as Fazendas' },
                ...farms.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          </div>

          {/* Talhão / Ponto */}
          <div>
            <CustomSelect
              label="Talhão / Ponto"
              fullWidth
              value={pointFilter}
              onChange={setPointFilter}
              options={[
                { value: 'all', label: 'Todos os Pontos' },
                ...availablePoints.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: p.areaHa ? `${p.areaHa.toLocaleString('pt-BR')} ha` : undefined,
                })),
              ]}
            />
          </div>

          {/* Safra */}
          <div>
            <CustomSelect
              label="Safra / Período"
              fullWidth
              value={harvestFilter}
              onChange={handleHarvestChange}
              options={[
                { value: 'all', label: 'Todas as Safras' },
                ...harvests.map((h) => ({
                  value: h.id,
                  label: h.name,
                  sublabel: h.isActive ? '(Ativa)' : undefined,
                })),
              ]}
            />
          </div>

          {/* Mês */}
          <div>
            <CustomSelect
              label="Mês"
              fullWidth
              value={monthFilter}
              onChange={(val) => {
                setMonthFilter(val);
                if (val !== 'all') {
                  setHarvestFilter('all');
                }
              }}
              options={[
                { value: 'all', label: 'Todos os Meses' },
                ...availableMonths.map((ym) => {
                  const [y, m] = ym.split('-');
                  return {
                    value: ym,
                    label: `${MONTH_NAMES_BR[m] || m} / ${y}`,
                  };
                }),
              ]}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                De
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setHarvestFilter('all');
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Até
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setHarvestFilter('all');
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Aggregated Total Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">
              Total Acumulado Filtrado
            </span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              <span className="text-[#143D2B] dark:text-emerald-400">{formatMm(totalFilteredMm)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Lançamentos</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{filteredRecords.length}</strong>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Dias Chuvosos</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{rainyDaysCount}</strong>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase">Média / Dia</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatMm(avgPerRainyDay)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table / Cards */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Nenhum registro encontrado para os filtros selecionados.
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Data / Hora</th>
                    <th className="py-2.5 px-3.5">Fazenda</th>
                    <th className="py-2.5 px-3.5">Talhão / Ponto</th>
                    <th className="py-2.5 px-3.5">Precipitação</th>
                    <th className="py-2.5 px-3.5">Observações</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRecords.map(record => {
                    const farm = farms.find(f => f.id === record.farmId);
                    const point = points.find(p => p.id === record.pointId);

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatDateBr(record.date)}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-normal">
                            {record.time || '07:00'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                          {farm?.name || 'Fazenda'}
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {point ? point.name : 'Geral'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {formatMm(record.amountMm)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {record.observation || '-'}
                        </td>
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onEditRecord(record)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredRecords.map(record => {
                const farm = farms.find(f => f.id === record.farmId);
                const point = points.find(p => p.id === record.pointId);

                return (
                  <div key={record.id} className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {formatDateBr(record.date)} <span className="font-normal text-slate-400 dark:text-slate-500">às {record.time}</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {farm?.name} • <span className="font-medium text-slate-800 dark:text-slate-200">{point?.name || 'Geral'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {formatMm(record.amountMm)}
                        </span>
                      </div>
                    </div>

                    {record.observation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                        "{record.observation}"
                      </p>
                    )}

                    <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => onEditRecord(record)}
                        className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 flex items-center gap-1 px-2 py-0.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
