import React, { useState } from 'react';
import { Harvest, RainRecord } from '../types';
import { formatDateBr, formatMm, isDateInRange } from '../utils/formatters';
import { CalendarRange, Plus, Edit2, Trash2, Check } from 'lucide-react';

interface Props {
  harvests: Harvest[];
  records: RainRecord[];
  onSaveHarvest: (harvest: Partial<Harvest> & { name: string; startDate: string; endDate: string }) => Promise<void>;
  onSetActiveHarvest: (harvestId: string) => Promise<void>;
  onDeleteHarvest: (harvestId: string) => Promise<void>;
}

export const HarvestsManager: React.FC<Props> = ({
  harvests,
  records,
  onSaveHarvest,
  onSetActiveHarvest,
  onDeleteHarvest,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAdd = () => {
    setEditingHarvest(null);
    setName('');
    const now = new Date();
    const currentYear = now.getFullYear();
    setStartDate(`${currentYear}-09-01`);
    setEndDate(`${currentYear + 1}-08-31`);
    setIsActive(harvests.length === 0);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: Harvest) => {
    setEditingHarvest(h);
    setName(h.name);
    setStartDate(h.startDate);
    setEndDate(h.endDate);
    setIsActive(h.isActive);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da safra é obrigatório.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Informe a data inicial e final da safra.');
      return;
    }
    if (startDate > endDate) {
      setError('A data inicial não pode ser posterior à data final.');
      return;
    }

    try {
      setLoading(true);
      await onSaveHarvest({
        id: editingHarvest?.id,
        name: name.trim(),
        startDate,
        endDate,
        isActive,
      });
      setIsModalOpen(false);
    } catch (err) {
      setError('Erro ao salvar safra.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (harvest: Harvest) => {
    if (harvest.isActive && harvests.length > 1) {
      alert('Você não pode excluir a safra que está ativa no momento. Ative outra safra antes.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a "${harvest.name}"?`)) {
      try {
        await onDeleteHarvest(harvest.id);
      } catch (err) {
        alert('Erro ao excluir safra.');
      }
    }
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#121820] p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#143D2B] dark:text-emerald-400" />
            <span>Ciclos Agrícolas e Safras</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Defina períodos para cálculo automático de acumulados pluviométricos
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Safra</span>
        </button>
      </div>

      {/* COMPACT PROFESSIONAL TABLE */}
      <div className="bg-white dark:bg-[#121820] rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {harvests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhuma safra cadastrada. Clique no botão acima para adicionar um ciclo agrícola.
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3.5">Safra / Ciclo</th>
                    <th className="py-2.5 px-3.5">Período de Vigência</th>
                    <th className="py-2.5 px-3.5">Acumulado Total (mm)</th>
                    <th className="py-2.5 px-3.5 text-center">Dias com Chuva</th>
                    <th className="py-2.5 px-3.5 text-center">Total de Lançamentos</th>
                    <th className="py-2.5 px-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {harvests.map((harvest) => {
                    const harvestRecs = records.filter(r => isDateInRange(r.date, harvest.startDate, harvest.endDate));
                    const totalMm = harvestRecs.reduce((sum, r) => sum + r.amountMm, 0);
                    const rainyDays = new Set(harvestRecs.filter(r => r.amountMm > 0).map(r => r.date)).size;

                    return (
                      <tr key={harvest.id} className="hover:bg-slate-50/60 dark:hover:bg-[#161f2c] transition-colors">
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {harvest.name}
                            </span>
                            {harvest.isActive && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[#143D2B] dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                                Ativa
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {formatDateBr(harvest.startDate)} a {formatDateBr(harvest.endDate)}
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white text-sm">
                          {formatMm(totalMm)}
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-center text-slate-700 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-transparent dark:border-slate-700">
                            {rainyDays} {rainyDays === 1 ? 'dia' : 'dias'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3.5 whitespace-nowrap text-center text-slate-600 dark:text-slate-400">
                          {harvestRecs.length}
                        </td>

                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {!harvest.isActive ? (
                              <button
                                onClick={() => onSetActiveHarvest(harvest.id)}
                                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium transition-colors"
                                title="Definir como safra padrão ativa"
                              >
                                Definir Ativa
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#143D2B] dark:text-emerald-400 font-medium px-2 py-1">
                                <Check className="w-3 h-3 text-[#143D2B] dark:text-emerald-400" />
                                <span>Padrão</span>
                              </span>
                            )}

                            <button
                              onClick={() => handleOpenEdit(harvest)}
                              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                              title="Editar Safra"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(harvest)}
                              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              title="Excluir Safra"
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
              {harvests.map((harvest) => {
                const harvestRecs = records.filter(r => isDateInRange(r.date, harvest.startDate, harvest.endDate));
                const totalMm = harvestRecs.reduce((sum, r) => sum + r.amountMm, 0);
                const rainyDays = new Set(harvestRecs.filter(r => r.amountMm > 0).map(r => r.date)).size;

                return (
                  <div key={harvest.id} className="p-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {harvest.name}
                          </span>
                          {harvest.isActive && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[#143D2B] dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
                              Ativa
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDateBr(harvest.startDate)} até {formatDateBr(harvest.endDate)}
                        </p>
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

                    <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {rainyDays} dias chuvosos ({harvestRecs.length} registros)
                      </span>

                      <div className="flex items-center gap-1.5">
                        {!harvest.isActive && (
                          <button
                            onClick={() => onSetActiveHarvest(harvest.id)}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-[#1a2330] text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-colors"
                          >
                            Ativar
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(harvest)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a2330] rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(harvest)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
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

      {/* Modal Add/Edit Harvest */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#121820] w-full max-w-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-[#143D2B] text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {editingHarvest ? 'Editar Safra' : 'Cadastrar Safra'}
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
                  Nome da Safra <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Safra 2026/2027"
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data Inicial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data Final <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#143D2B] text-[#143D2B] rounded border-slate-300 dark:border-slate-600 focus:ring-[#143D2B] cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Definir como Safra Ativa atual
                </label>
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
                  {editingHarvest ? 'Salvar Alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
