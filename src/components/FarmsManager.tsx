import React, { useState } from 'react';
import { Farm, MeasurementPoint, RainRecord, Harvest } from '../types';
import { formatDateBr, formatMm, isDateInRange } from '../utils/formatters';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  FileText,
  Eye,
  ArrowLeft,
  CloudRain,
  X,
} from 'lucide-react';

interface Props {
  farms: Farm[];
  points: MeasurementPoint[];
  records: RainRecord[];
  activeHarvest?: Harvest;
  onSaveFarm: (farm: Partial<Farm> & { name: string }) => Promise<void>;
  onDeleteFarm: (farmId: string) => Promise<void>;
  onOpenNewRainModal: (farmId?: string) => void;
  onNavigateToPoints: (farmId?: string) => void;
}

export const FarmsManager: React.FC<Props> = ({
  farms,
  points,
  records,
  activeHarvest,
  onSaveFarm,
  onDeleteFarm,
  onOpenNewRainModal,
  onNavigateToPoints,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [viewingFarm, setViewingFarm] = useState<Farm | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedFarmForHistory, setSelectedFarmForHistory] = useState<Farm | null>(null);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setName('');
    setLocation('');
    setDescription('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocation(farm.location || '');
    setDescription(farm.description || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da fazenda é obrigatório.');
      return;
    }

    try {
      setLoading(true);
      await onSaveFarm({
        id: editingFarm?.id,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
      });
      setIsModalOpen(false);
    } catch (err) {
      setError('Erro ao salvar fazenda. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (farm: Farm) => {
    const farmRecs = records.filter(r => r.farmId === farm.id);
    const msg = farmRecs.length > 0
      ? `A fazenda "${farm.name}" possui ${farmRecs.length} registro(s) vinculado(s). Deseja realmente excluir esta fazenda e seus dados?`
      : `Deseja realmente excluir a fazenda "${farm.name}"?`;

    if (window.confirm(msg)) {
      try {
        await onDeleteFarm(farm.id);
        if (selectedFarmForHistory?.id === farm.id) {
          setSelectedFarmForHistory(null);
        }
        if (viewingFarm?.id === farm.id) {
          setViewingFarm(null);
        }
      } catch (err) {
        alert('Erro ao excluir fazenda.');
      }
    }
  };

  // Dedicated view for inspecting a single farm's rainfall history
  if (selectedFarmForHistory) {
    const farmRecs = records
      .filter(r => r.farmId === selectedFarmForHistory.id)
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

    const farmPoints = points.filter(p => p.farmId === selectedFarmForHistory.id);
    const totalAllTime = farmRecs.reduce((acc, r) => acc + r.amountMm, 0);

    const harvestRecs = activeHarvest
      ? farmRecs.filter(r => isDateInRange(r.date, activeHarvest.startDate, activeHarvest.endDate))
      : farmRecs;
    const harvestTotalMm = harvestRecs.reduce((acc, r) => acc + r.amountMm, 0);

    return (
      <div className="space-y-4 pb-10">
        <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedFarmForHistory(null)}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {selectedFarmForHistory.name}
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Histórico de Chuvas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{selectedFarmForHistory.location || 'Sem localização informada'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenNewRainModal(selectedFarmForHistory.id)}
            className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Chuva</span>
          </button>
        </div>

        {/* Compact stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-[#121820] p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Safra Ativa ({activeHarvest?.name || 'Geral'})
            </span>
            <span className="text-lg font-bold text-[#143D2B] dark:text-emerald-400 block mt-0.5">
              {formatMm(harvestTotalMm)}
            </span>
          </div>

          <div className="bg-white dark:bg-[#121820] p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Acumulado Geral
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
              {formatMm(totalAllTime)}
            </span>
          </div>

          <div className="bg-white dark:bg-[#121820] p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Dias com Chuva
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
              {new Set(farmRecs.map(r => r.date)).size}
            </span>
          </div>

          <div className="bg-white dark:bg-[#121820] p-3 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Talhões Vinculados
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-0.5">
              {farmPoints.length}
            </span>
          </div>
        </div>

        {/* Rainfall history table for this farm */}
        <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-[#143D2B] dark:text-emerald-400" />
              <span>Lançamentos Registrados na Fazenda</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {farmRecs.length} {farmRecs.length === 1 ? 'medição' : 'medições'}
            </span>
          </div>

          {farmRecs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              Nenhuma medição registrada nesta fazenda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Data / Hora</th>
                    <th className="py-2.5 px-3.5">Talhão / Ponto</th>
                    <th className="py-2.5 px-3.5">Precipitação</th>
                    <th className="py-2.5 px-3.5">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {farmRecs.map(record => {
                    const point = points.find(p => p.id === record.pointId);
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                          {formatDateBr(record.date)} <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">às {record.time}</span>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {point ? point.name : 'Pluviômetro Geral'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {formatMm(record.amountMm)}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 italic max-w-xs truncate">
                          {record.observation || '-'}
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
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Top Banner with Cadastrar Fazenda Button */}
      <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#143D2B] dark:text-emerald-400" />
            <span>Propriedades Rurais</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastro, monitoramento e índices pluviométricos de cada propriedade
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Fazenda</span>
        </button>
      </div>

      {/* COMPACT PROFESSIONAL TABLE */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {farms.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhuma fazenda cadastrada. Clique no botão acima para adicionar a primeira propriedade.
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Fazenda</th>
                    <th className="py-2.5 px-3.5">Localização</th>
                    <th className="py-2.5 px-3.5 text-center">Quantidade de Talhões</th>
                    <th className="py-2.5 px-3.5">Acumulado de Chuva (mm)</th>
                    <th className="py-2.5 px-3.5">Observação</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {farms.map((farm) => {
                    const farmPoints = points.filter(p => p.farmId === farm.id);
                    const farmRecs = records.filter(r => r.farmId === farm.id);
                    const totalMm = farmRecs.reduce((sum, r) => sum + r.amountMm, 0);

                    return (
                      <tr key={farm.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                        {/* Fazenda */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <button
                            onClick={() => setViewingFarm(farm)}
                            className="font-bold text-slate-900 dark:text-white hover:text-[#143D2B] dark:hover:text-emerald-400 text-left hover:underline focus:outline-hidden"
                            title="Visualizar detalhes"
                          >
                            {farm.name}
                          </button>
                        </td>

                        {/* Localização */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {farm.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{farm.location}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Quantidade de Talhões */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                          <button
                            onClick={() => onNavigateToPoints(farm.id)}
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-slate-700 transition-colors"
                            title="Gerenciar talhões desta fazenda"
                          >
                            {farmPoints.length} {farmPoints.length === 1 ? 'talhão' : 'talhões'}
                          </button>
                        </td>

                        {/* Acumulado de Chuva (mm) */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {formatMm(totalMm)}
                          </span>
                        </td>

                        {/* Observação */}
                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {farm.description || '-'}
                        </td>

                        {/* Ações */}
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setViewingFarm(farm)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Visualizar Detalhes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setSelectedFarmForHistory(farm)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#143D2B] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Histórico de Chuva"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onNavigateToPoints(farm.id)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Ver Talhões"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(farm)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Editar Fazenda"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(farm)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              title="Excluir Fazenda"
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

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {farms.map((farm) => {
                const farmPoints = points.filter(p => p.farmId === farm.id);
                const farmRecs = records.filter(r => r.farmId === farm.id);
                const totalMm = farmRecs.reduce((sum, r) => sum + r.amountMm, 0);

                return (
                  <div key={farm.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => setViewingFarm(farm)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:underline text-left"
                        >
                          {farm.name}
                        </button>
                        {farm.location && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{farm.location}</span>
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-medium text-slate-400 block leading-tight">
                          Acumulado
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatMm(totalMm)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {farmPoints.length} {farmPoints.length === 1 ? 'talhão' : 'talhões'}
                      </span>
                      {farm.description && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px] italic">
                          {farm.description}
                        </span>
                      )}
                    </div>

                    {/* Actions toolbar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingFarm(farm)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] border border-slate-200 dark:border-slate-700 rounded flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Visualizar</span>
                        </button>
                        <button
                          onClick={() => setSelectedFarmForHistory(farm)}
                          className="px-2 py-1 text-[11px] font-medium text-[#143D2B] dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Histórico</span>
                        </button>
                        <button
                          onClick={() => onNavigateToPoints(farm.id)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] border border-slate-200 dark:border-slate-700 rounded flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Talhões</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(farm)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(farm)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Visualizar Detalhes da Fazenda */}
      {viewingFarm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#121820] w-full max-w-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#143D2B] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-200" />
                <h2 className="text-sm font-semibold">Detalhes da Propriedade</h2>
              </div>
              <button
                onClick={() => setViewingFarm(null)}
                className="text-slate-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Nome da Fazenda
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingFarm.name}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Localização
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {viewingFarm.location || 'Não informada'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Observações Gerais
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 mt-0.5">
                  {viewingFarm.description || 'Nenhuma observação cadastrada.'}
                </p>
              </div>

              {/* Summary numbers */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block">
                    Talhões Cadastrados
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {points.filter(p => p.farmId === viewingFarm.id).length}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block">
                    Total Acumulado
                  </span>
                  <span className="text-sm font-bold text-[#143D2B] dark:text-emerald-400">
                    {formatMm(records.filter(r => r.farmId === viewingFarm.id).reduce((s, r) => s + r.amountMm, 0))}
                  </span>
                </div>
              </div>

              {/* Action buttons inside viewer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingFarm;
                    setViewingFarm(null);
                    setSelectedFarmForHistory(target);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-[#1a2330] text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-slate-700 rounded font-medium flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Histórico de Chuvas</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingFarm;
                      setViewingFarm(null);
                      onNavigateToPoints(target.id);
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-[#1a2330] text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-transparent dark:border-slate-700 rounded font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Ver Talhões</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingFarm;
                      setViewingFarm(null);
                      handleOpenEdit(target);
                    }}
                    className="px-3 py-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white rounded font-medium transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastrar / Editar Fazenda */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#121820] w-full max-w-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#143D2B] text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {editingFarm ? 'Editar Fazenda' : 'Cadastrar Fazenda'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {error && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs">
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Fazenda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fazenda Boa Esperança"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Localização / Município / UF
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sorriso - MT"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Observações Gerais
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Observações agronômicas da área..."
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 resize-none transition-colors"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-xs font-medium rounded-md transition-colors"
                >
                  {editingFarm ? 'Salvar Alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
