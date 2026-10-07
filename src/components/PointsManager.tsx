import React, { useState } from 'react';
import { Farm, MeasurementPoint, RainRecord } from '../types';
import { formatMm } from '../utils/formatters';
import { CustomSelect } from './CustomSelect';
import { MapPin, Plus, Edit2, Trash2, Building2, Droplets, X, AlertCircle } from 'lucide-react';

interface Props {
  farms: Farm[];
  points: MeasurementPoint[];
  records: RainRecord[];
  selectedFarmIdFilter?: string;
  onSavePoint: (point: Partial<MeasurementPoint> & { name: string; farmId: string }) => Promise<void>;
  onDeletePoint: (pointId: string) => Promise<void>;
  onOpenNewRainModal: (farmId?: string) => void;
}

export const PointsManager: React.FC<Props> = ({
  farms,
  points,
  records,
  selectedFarmIdFilter = 'all',
  onSavePoint,
  onDeletePoint,
  onOpenNewRainModal,
}) => {
  const [filterFarmId, setFilterFarmId] = useState<string>(selectedFarmIdFilter);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MeasurementPoint | null>(null);
  const [name, setName] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [farmId, setFarmId] = useState('');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredPoints = filterFarmId === 'all'
    ? points
    : points.filter(p => p.farmId === filterFarmId);

  const handleOpenAdd = () => {
    setEditingPoint(null);
    setName('');
    setAreaHa('');
    setFarmId(filterFarmId !== 'all' ? filterFarmId : (farms[0]?.id || ''));
    setObservation('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: MeasurementPoint) => {
    setEditingPoint(p);
    setName(p.name);
    setAreaHa(p.areaHa !== undefined ? p.areaHa.toString().replace('.', ',') : '');
    setFarmId(p.farmId);
    setObservation(p.observation || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O código/nome do talhão é obrigatório.');
      return;
    }
    if (!farmId) {
      setError('Selecione a fazenda vinculada.');
      return;
    }

    const parsedArea = areaHa.trim() ? parseFloat(areaHa.replace(',', '.')) : undefined;

    try {
      setLoading(true);
      await onSavePoint({
        id: editingPoint?.id,
        name: name.trim(),
        code: name.trim(),
        areaHa: parsedArea !== undefined && !isNaN(parsedArea) ? parsedArea : undefined,
        farmId,
        observation: observation.trim(),
      });
      setIsModalOpen(false);
    } catch (err) {
      setError('Erro ao salvar ponto de medição.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (point: MeasurementPoint) => {
    const pointRecords = records.filter(r => r.pointId === point.id);
    const msg = pointRecords.length > 0
      ? `Atenção: Este talhão possui ${pointRecords.length} medição(ões). Deseja continuar com a exclusão?`
      : `Deseja realmente excluir o ponto "${point.name}"?`;

    if (window.confirm(msg)) {
      try {
        await onDeletePoint(point.id);
      } catch (err) {
        alert('Erro ao excluir ponto.');
      }
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#143D2B] dark:text-emerald-400" />
            <span>Talhões e Pontos de Medição</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastro e acompanhamento de pluviômetros e talhões agrícolas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <CustomSelect
            prefix="Fazenda:"
            value={filterFarmId}
            onChange={setFilterFarmId}
            options={[
              { value: 'all', label: `Todas (${farms.length})` },
              ...farms.map((f) => ({ value: f.id, label: f.name })),
            ]}
          />

          <button
            onClick={handleOpenAdd}
            disabled={farms.length === 0}
            className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Talhão</span>
          </button>
        </div>
      </div>

      {/* COMPACT PROFESSIONAL TABLE */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {farms.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Cadastre primeiro uma fazenda para vincular talhões.
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhum talhão ou ponto encontrado para esta seleção.
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Talhão / Ponto</th>
                    <th className="py-2.5 px-3.5">Área (ha)</th>
                    <th className="py-2.5 px-3.5">Fazenda Vinculada</th>
                    <th className="py-2.5 px-3.5">Observação</th>
                    <th className="py-2.5 px-3.5 text-center">Registros</th>
                    <th className="py-2.5 px-3.5">Acumulado (mm)</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredPoints.map((point) => {
                    const farm = farms.find(f => f.id === point.farmId);
                    const pointRecs = records.filter(r => r.pointId === point.id);
                    const totalMm = pointRecs.reduce((sum, r) => sum + r.amountMm, 0);

                    return (
                      <tr key={point.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {point.name}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                          {point.areaHa ? `${point.areaHa.toLocaleString('pt-BR')} ha` : '-'}
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {farm?.name || 'Fazenda'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {point.observation || '-'}
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-center text-slate-600 dark:text-slate-400">
                          <span className="bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {pointRecs.length}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white text-sm">
                          {formatMm(totalMm)}
                        </td>

                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onOpenNewRainModal(farm?.id)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#143D2B] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Registrar Chuva neste ponto"
                            >
                              <Droplets className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(point)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Editar Talhão"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(point)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              title="Excluir Talhão"
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
              {filteredPoints.map((point) => {
                const farm = farms.find(f => f.id === point.farmId);
                const pointRecs = records.filter(r => r.pointId === point.id);
                const totalMm = pointRecs.reduce((sum, r) => sum + r.amountMm, 0);

                return (
                  <div key={point.id} className="p-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm block">
                            {point.name}
                          </span>
                          {point.areaHa && (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
                              {point.areaHa.toLocaleString('pt-BR')} ha
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{farm?.name}</span>
                        </span>
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

                    {point.observation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                        "{point.observation}"
                      </p>
                    )}

                    <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {pointRecs.length} {pointRecs.length === 1 ? 'medição' : 'medições'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenNewRainModal(farm?.id)}
                          className="px-2 py-1 text-[11px] font-medium text-[#143D2B] dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded flex items-center gap-1"
                        >
                          <Droplets className="w-3 h-3" />
                          <span>+ Chuva</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(point)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(point)}
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

      {/* Modal Cadastrar / Editar Ponto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#121820] w-full max-w-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#143D2B] text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {editingPoint ? 'Editar Talhão' : 'Cadastrar Talhão'}
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
                  Fazenda Vinculada <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  fullWidth
                  value={farmId}
                  onChange={setFarmId}
                  placeholder="Selecione a fazenda..."
                  options={farms.map((f) => ({ value: f.id, label: f.name }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Código do Talhão <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: SP01 ou M01"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Área do Talhão (ha)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={areaHa}
                  onChange={(e) => setAreaHa(e.target.value)}
                  placeholder="Ex: 122 ou 99,42"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Observações de Localização
                </label>
                <textarea
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex: Setor norte junto à divisa..."
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
                  {editingPoint ? 'Salvar Alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
