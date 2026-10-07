import React, { useState, useEffect } from 'react';
import { Farm, MeasurementPoint, RainRecord } from '../types';
import { getCurrentTimeIso, getTodayIso, parseMmInput } from '../utils/formatters';
import { CustomSelect } from './CustomSelect';
import { CloudRain, X, Check, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordData: Partial<RainRecord> & { farmId: string; date: string; amountMm: number }) => Promise<void>;
  onDelete?: (recordId: string) => Promise<void>;
  farms: Farm[];
  points: MeasurementPoint[];
  editingRecord?: RainRecord | null;
  defaultFarmId?: string;
}

export const RainModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  farms,
  points,
  editingRecord,
  defaultFarmId,
}) => {
  const [farmId, setFarmId] = useState<string>('');
  const [pointId, setPointId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayIso());
  const [time, setTime] = useState<string>(getCurrentTimeIso());
  const [amountStr, setAmountStr] = useState<string>('');
  const [observation, setObservation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRecord) {
      setFarmId(editingRecord.farmId);
      setPointId(editingRecord.pointId || '');
      setDate(editingRecord.date);
      setTime(editingRecord.time || '07:00');
      setAmountStr(editingRecord.amountMm.toString().replace('.', ','));
      setObservation(editingRecord.observation || '');
    } else {
      const selectedFarm = defaultFarmId && farms.some(f => f.id === defaultFarmId)
        ? defaultFarmId
        : (farms[0]?.id || '');
      setFarmId(selectedFarm);
      setDate(getTodayIso());
      setTime(getCurrentTimeIso());
      setAmountStr('');
      setObservation('');
    }
    setError(null);
  }, [editingRecord, defaultFarmId, farms, isOpen]);

  useEffect(() => {
    if (!farmId) return;
    const farmPoints = points.filter(p => p.farmId === farmId);
    if (pointId && !farmPoints.some(p => p.id === pointId)) {
      setPointId(farmPoints[0]?.id || '');
    } else if (!pointId && farmPoints.length > 0) {
      setPointId(farmPoints[0].id);
    }
  }, [farmId, points]);

  if (!isOpen) return null;

  const farmPoints = points.filter(p => p.farmId === farmId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!farmId) {
      setError('Selecione a fazenda.');
      return;
    }
    if (!date) {
      setError('Informe a data da chuva.');
      return;
    }
    const parsedMm = parseMmInput(amountStr);
    if (parsedMm <= 0) {
      setError('Informe um volume válido maior que zero (ex: 12,5).');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        id: editingRecord?.id,
        farmId,
        pointId: pointId || undefined,
        date,
        time: time || '07:00',
        amountMm: parsedMm,
        observation: observation.trim(),
      });
      onClose();
    } catch (err) {
      setError('Erro ao salvar o registro.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRecord || !onDelete) return;
    if (window.confirm('Tem certeza que deseja excluir este registro de chuva?')) {
      try {
        setLoading(true);
        await onDelete(editingRecord.id);
        onClose();
      } catch (err) {
        setError('Erro ao excluir registro.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleQuickAdd = (increment: number) => {
    const current = parseMmInput(amountStr);
    const updated = Math.round((current + increment) * 10) / 10;
    setAmountStr(updated.toString().replace('.', ','));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3">
      <div className="bg-white dark:bg-[#121820] w-full max-w-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#143D2B] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-slate-200" />
            <h2 className="text-sm font-semibold">
              {editingRecord ? 'Editar Registro de Chuva' : 'Registrar Chuva'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-200 hover:text-white"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount In Millimeters */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md p-3.5 text-center">
            <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Volume Precipitado (mm)
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,0"
                autoFocus={!editingRecord}
                className="w-36 text-center text-3xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md py-1 px-2 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
              />
              <span className="text-xl font-bold text-slate-700 dark:text-slate-300">mm</span>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 flex-wrap">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 mr-1 uppercase font-medium">Atalhos:</span>
              {[5, 10, 20, 50].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => handleQuickAdd(inc)}
                  className="px-2 py-0.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  +{inc} mm
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2 py-0.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Farm and Point Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fazenda <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                fullWidth
                value={farmId}
                onChange={setFarmId}
                placeholder="Selecione..."
                options={farms.map((f) => ({ value: f.id, label: f.name }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Talhão / Ponto
              </label>
              <CustomSelect
                fullWidth
                value={pointId}
                onChange={setPointId}
                options={[
                  { value: '', label: 'Pluviômetro Geral da Fazenda' },
                  ...farmPoints.map((p) => ({
                    value: p.id,
                    label: p.name,
                    sublabel: p.areaHa ? `${p.areaHa.toLocaleString('pt-BR')} ha` : undefined,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                max={getTodayIso()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          {/* Observation */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Observações (opcional)
            </label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Chuva mansa e contínua..."
              className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-[#143D2B] dark:focus:border-emerald-600 resize-none transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
            {editingRecord && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2330] hover:text-slate-900 dark:hover:text-white rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-[#143D2B] hover:bg-[#0F2D1F] active:bg-[#0A2016] text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingRecord ? 'Atualizar' : 'Salvar Registro'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
