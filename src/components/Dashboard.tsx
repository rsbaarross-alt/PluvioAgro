import React from 'react';
import { Farm, Harvest, MeasurementPoint, RainRecord } from '../types';
import { formatDateBr, formatMm, formatMonthYearBr, getCurrentYearMonthIso, getTodayIso, isDateInRange } from '../utils/formatters';
import { PrecipitationChart } from './PrecipitationChart';
import { CustomSelect } from './CustomSelect';
import { CloudRain, Droplets, Calendar, MapPin, Plus, TrendingUp, ChevronRight, Check } from 'lucide-react';

interface Props {
  farms: Farm[];
  points: MeasurementPoint[];
  harvests: Harvest[];
  records: RainRecord[];
  activeHarvest?: Harvest;
  selectedFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onOpenNewRainModal: (farmId?: string) => void;
  onNavigateToHistory: (farmId?: string) => void;
  onNavigateToFarms: () => void;
}

export const Dashboard: React.FC<Props> = ({
  farms,
  points,
  harvests,
  records,
  activeHarvest,
  selectedFarmId,
  onSelectFarm,
  onOpenNewRainModal,
  onNavigateToHistory,
  onNavigateToFarms,
}) => {
  const todayIso = getTodayIso();
  const currentYearMonth = getCurrentYearMonthIso();

  // Filter records by active farm and active harvest
  const farmFilteredRecords = selectedFarmId === 'all'
    ? records
    : records.filter(r => r.farmId === selectedFarmId);

  const harvestRecords = farmFilteredRecords.filter(r => {
    if (!activeHarvest) return true;
    return isDateInRange(r.date, activeHarvest.startDate, activeHarvest.endDate);
  });

  // 1. Chuva de hoje (mm)
  const todayRecords = farmFilteredRecords.filter(r => r.date === todayIso);
  const todayMm = todayRecords.reduce((acc, r) => acc + r.amountMm, 0);

  // 2. Acumulado do mês atual (mm)
  const monthRecords = farmFilteredRecords.filter(r => r.date.startsWith(currentYearMonth));
  const monthMm = monthRecords.reduce((acc, r) => acc + r.amountMm, 0);
  const monthRainyDays = new Set(monthRecords.filter(r => r.amountMm > 0).map(r => r.date)).size;

  // 3. Acumulado da safra (mm)
  const harvestTotalMm = harvestRecords.reduce((acc, r) => acc + r.amountMm, 0);

  // 4. Quantidade de dias com chuva na safra
  const harvestRainyDays = new Set(harvestRecords.filter(r => r.amountMm > 0).map(r => r.date)).size;

  // 5. Última chuva registrada
  const sortedRecords = [...farmFilteredRecords].sort((a, b) => {
    const dtA = `${a.date}T${a.time || '00:00'}`;
    const dtB = `${b.date}T${b.time || '00:00'}`;
    return dtB.localeCompare(dtA);
  });
  const lastRecord = sortedRecords[0];

  const getLastRecordDetails = () => {
    if (!lastRecord) return null;
    const farm = farms.find(f => f.id === lastRecord.farmId);
    const point = points.find(p => p.id === lastRecord.pointId);
    return {
      record: lastRecord,
      farmName: farm ? farm.name : 'Fazenda',
      pointName: point ? point.name : 'Geral da Fazenda',
    };
  };

  const lastRecordInfo = getLastRecordDetails();

  // Resumo por fazenda na safra
  const farmSummaries = farms.map(farm => {
    const farmRecs = records.filter(r => {
      if (r.farmId !== farm.id) return false;
      if (activeHarvest) {
        return isDateInRange(r.date, activeHarvest.startDate, activeHarvest.endDate);
      }
      return true;
    });

    const totalMm = farmRecs.reduce((sum, r) => sum + r.amountMm, 0);
    const rainyDays = new Set(farmRecs.filter(r => r.amountMm > 0).map(r => r.date)).size;
    const farmPoints = points.filter(p => p.farmId === farm.id);

    const sortedFarmRecs = [...farmRecs].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
    const lastFarmRain = sortedFarmRecs[0];

    return {
      farm,
      totalMm: Math.round(totalMm * 10) / 10,
      rainyDays,
      pointCount: farmPoints.length,
      lastRain: lastFarmRain ? {
        date: lastFarmRain.date,
        amountMm: lastFarmRain.amountMm,
        pointName: points.find(p => p.id === lastFarmRain.pointId)?.name || 'Geral',
      } : null,
    };
  });

  return (
    <div className="space-y-4 pb-10">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Monitoramento Pluviométrico
            </h1>
            {activeHarvest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Check className="w-3 h-3 text-[#143D2B] dark:text-emerald-400" />
                {activeHarvest.name}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro e consolidação de índices pluviométricos no campo
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Farm Filter Dropdown */}
          <CustomSelect
            prefix="Fazenda:"
            value={selectedFarmId}
            onChange={onSelectFarm}
            options={[
              { value: 'all', label: `Todas (${farms.length})` },
              ...farms.map((f) => ({ value: f.id, label: f.name })),
            ]}
          />

          <button
            onClick={() => onOpenNewRainModal(selectedFarmId !== 'all' ? selectedFarmId : undefined)}
            className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Chuva</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Chuva de Hoje */}
        <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chuva Hoje
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <CloudRain className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatMm(todayMm)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {todayRecords.length === 0 ? 'Sem registros hoje' : `${todayRecords.length} medição(ões)`}
          </p>
        </div>

        {/* Acumulado do Mês */}
        <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Mês ({formatMonthYearBr(currentYearMonth).split(' ')[0]})
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatMm(monthMm)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {monthRainyDays} {monthRainyDays === 1 ? 'dia chuvoso' : 'dias chuvosos'}
          </p>
        </div>

        {/* Acumulado da Safra */}
        <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Acumulado Safra
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatMm(harvestTotalMm)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {activeHarvest ? activeHarvest.name : 'Período completo'}
          </p>
        </div>

        {/* Dias com Chuva na Safra */}
        <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dias com Chuva
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {harvestRainyDays}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total de dias na safra ativa
          </p>
        </div>
      </div>

      {/* Última Chuva Card */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border-l-4 border-l-[#143D2B] border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-[#143D2B] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
              Última Chuva Registrada
            </span>
            {lastRecordInfo ? (
              <div className="mt-0.5">
                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#143D2B] dark:text-emerald-400 font-extrabold">{formatMm(lastRecordInfo.record.amountMm)}</span>
                  <span className="text-slate-600 dark:text-slate-300 font-normal text-xs sm:text-sm">
                    em {formatDateBr(lastRecordInfo.record.date)} às {lastRecordInfo.record.time}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{lastRecordInfo.farmName}</span>
                  <span>•</span>
                  <span>{lastRecordInfo.pointName}</span>
                  {lastRecordInfo.record.observation && (
                    <>
                      <span>•</span>
                      <span className="italic text-slate-500 dark:text-slate-400">"{lastRecordInfo.record.observation}"</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nenhuma medição registrada nesta seleção.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onNavigateToHistory(selectedFarmId !== 'all' ? selectedFarmId : undefined)}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Consultar Histórico
          </button>
        </div>
      </div>

      {/* Precipitation Bar Chart Component */}
      <PrecipitationChart
        records={farmFilteredRecords}
        harvestStartDate={activeHarvest?.startDate}
        harvestEndDate={activeHarvest?.endDate}
      />

      {/* Resumo por Propriedade - COMPACT TABLE */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Resumo por Propriedade
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Índices consolidados da {activeHarvest ? activeHarvest.name : 'safra atual'}
            </p>
          </div>
          <button
            onClick={onNavigateToFarms}
            className="text-xs font-medium text-[#143D2B] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Gerenciar Fazendas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {farms.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Nenhuma fazenda cadastrada.</p>
            <button
              onClick={onNavigateToFarms}
              className="text-xs font-medium px-3 py-1 bg-[#143D2B] text-white rounded-md"
            >
              Cadastrar Fazenda
            </button>
          </div>
        ) : (
          <div className="border border-slate-200/90 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-[#121820]">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Propriedade</th>
                    <th className="py-2.5 px-3.5">Localização</th>
                    <th className="py-2.5 px-3.5 text-center">Talhões</th>
                    <th className="py-2.5 px-3.5">Acumulado Safra</th>
                    <th className="py-2.5 px-3.5 text-center">Dias com Chuva</th>
                    <th className="py-2.5 px-3.5">Última Chuva</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {farmSummaries.map(({ farm, totalMm, rainyDays, pointCount, lastRain }) => (
                    <tr key={farm.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {farm.name}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {farm.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{farm.location}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-center text-slate-700 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-transparent dark:border-slate-700">
                          {pointCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white text-sm">
                        {formatMm(totalMm)}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-center text-slate-700 dark:text-slate-300">
                        {rainyDays}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {lastRain ? (
                          <span>
                            <strong className="text-slate-900 dark:text-white">{formatMm(lastRain.amountMm)}</strong> em {formatDateBr(lastRain.date)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sem registros</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onNavigateToHistory(farm.id)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded transition-colors"
                          >
                            Histórico
                          </button>
                          <button
                            onClick={() => onOpenNewRainModal(farm.id)}
                            className="px-2 py-1 text-[11px] font-medium bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white rounded transition-colors"
                          >
                            + Chuva
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {farmSummaries.map(({ farm, totalMm, rainyDays, pointCount, lastRain }) => (
                <div key={farm.id} className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {farm.name}
                      </span>
                      {farm.location && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{farm.location}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-medium text-slate-400 block leading-tight">
                        Safra
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatMm(totalMm)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
                    <span>{pointCount} {pointCount === 1 ? 'talhão' : 'talhões'} • {rainyDays} dias chuvosos</span>
                    {lastRain ? (
                      <span className="text-slate-500 dark:text-slate-400">Última: <strong>{formatMm(lastRain.amountMm)}</strong> ({formatDateBr(lastRain.date)})</span>
                    ) : (
                      <span className="text-slate-400 italic">Sem registros</span>
                    )}
                  </div>

                  <div className="pt-1.5 flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onNavigateToHistory(farm.id)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded transition-colors"
                    >
                      Histórico
                    </button>
                    <button
                      onClick={() => onOpenNewRainModal(farm.id)}
                      className="px-2 py-1 text-[11px] font-medium bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white rounded transition-colors"
                    >
                      + Chuva
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
