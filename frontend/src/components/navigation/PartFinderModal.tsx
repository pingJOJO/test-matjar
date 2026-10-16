'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Search,
  Check,
  X,
  Truck,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useMachineStore, ActiveMachine } from '@/stores/useMachineStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

const EQUIPMENT_TYPES = [
  { id: 'excavator', nameEn: 'Excavator', nameAr: 'حفار هيدروليكي' },
  { id: 'loader', nameEn: 'Wheel Loader', nameAr: 'لودر مجنزر وعجلات' },
  { id: 'dozer', nameEn: 'Bulldozer', nameAr: 'بلدوزر تسوية' },
  { id: 'compact', nameEn: 'Skid Steer / Compact', nameAr: 'بوبكات ولودر مدمج' },
  { id: 'tractor', nameEn: 'Tractor & Agriculture', nameAr: 'جرار زراعي ومعدات ريفية' },
  { id: 'engine', nameEn: 'Diesel Engine & Generator', nameAr: 'محرك ديزل ومولد' },
  { id: 'forklift', nameEn: 'Forklift & Telehandler', nameAr: 'رافعة شوكية وتيلي هاندلر' },
  { id: 'aerial', nameEn: 'Aerial Lift & Scissor', nameAr: 'رافعة مقصية ومنصة عمل' },
];

const MAKES: Record<string, string[]> = {
  excavator: ['Caterpillar', 'Komatsu', 'Kubota', 'Hitachi', 'Volvo', 'Doosan', 'JCB'],
  loader: ['Caterpillar', 'Komatsu', 'Volvo', 'John Deere', 'Case', 'Doosan'],
  dozer: ['Caterpillar', 'Komatsu', 'John Deere', 'Case'],
  compact: ['Bobcat', 'Caterpillar', 'Kubota', 'JCB', 'Case'],
  tractor: ['John Deere', 'Kubota', 'Case', 'New Holland', 'Massey Ferguson'],
  engine: ['Cummins', 'Caterpillar', 'Kubota', 'Yanmar', 'Perkins', 'Deutz', 'Isuzu'],
  forklift: ['Toyota', 'Komatsu', 'Caterpillar', 'Clark', 'Hyster', 'Bobcat'],
  aerial: ['Genie', 'JLG', 'Haulotte', 'Skyjack'],
};

const MODELS: Record<string, string[]> = {
  Caterpillar: ['320D', '320C', '330D', '336D', '950H', '966H', '980H', 'D6R', 'D8T', 'C9', 'C15'],
  Komatsu: ['PC200-8', 'PC220-8', 'PC300-7', 'WA380-6', 'WA470-6', 'D65EX-16', 'D155A', 'SAA6D107E'],
  Kubota: ['KX080-4', 'KX121-3', 'KX161-3', 'U35-4', 'V2203', 'V2403', 'D1105'],
  'John Deere': ['310SK', '410J', '450J', '4045', '6068', '5075E', '6120M'],
  Bobcat: ['S185', 'S250', 'T190', 'T300', 'E35', 'E50', 'S570'],
  JCB: ['3CX', '4CX', 'JS200', 'JS220', '535-125'],
  Cummins: ['6BT5.9', 'ISB 6.7', 'QSB6.7', 'QSC8.3', 'ISX15', 'N14'],
  Yanmar: ['4TNV98', '3TNV88', '4TNV84T', '3TNV76'],
  Volvo: ['EC210B', 'EC240B', 'EC290B', 'L120E', 'L150E'],
  Hitachi: ['ZX200-3', 'ZX210-5', 'ZX330-3', 'EX1200'],
  Deutz: ['BF4M2012', 'BF6M1013', 'TCD2013', 'F4L912'],
  Doosan: ['DX225LCA', 'DX300LCA', 'DL300'],
  Case: ['580N', '580 Super M', 'CX210', 'CX240'],
  Perkins: ['1104D-44T', '1106D-E66TA', '404D-22'],
};

export function PartFinderModal() {
  const router = useRouter();
  const { activeMachine, isFinderOpen, setFinderOpen, setActiveMachine, clearActiveMachine } =
    useMachineStore();
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const [selectedType, setSelectedType] = useState<string>('excavator');
  const [selectedMake, setSelectedMake] = useState<string>('Komatsu');
  const [selectedModel, setSelectedModel] = useState<string>('PC200-8');
  const [directSearch, setDirectSearch] = useState<string>('');

  if (!isFinderOpen) return null;

  const currentMakes = MAKES[selectedType] || Object.keys(MODELS);
  const currentModels = MODELS[selectedMake] || ['Standard Model'];

  const handleSelect = (make: string, model: string, type: string) => {
    const profile: ActiveMachine = {
      equipmentType: type,
      make,
      model,
      label: `${make} ${model}`,
    };
    setActiveMachine(profile);
    setFinderOpen(false);
    router.push(`/products?search=${encodeURIComponent(model)}`);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSearch.trim()) return;

    const term = directSearch.trim();
    const profile: ActiveMachine = {
      equipmentType: 'heavy_machinery',
      make: term.split(' ')[0] || 'Generic',
      model: term,
      label: term,
    };
    setActiveMachine(profile);
    setFinderOpen(false);
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir={dir}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-e4 border border-border overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="finder-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111827] text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 id="finder-modal-title" className="text-base font-bold">
                {isAr ? 'محدد قطع الغيار والتوافق الميداني' : 'Select Your Equipment / Part Finder'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'اختر نوع الآلية والماركة والموديل لفلترة القطع المتوافقة 100%'
                  : 'Filter catalog to 100% verified interchangeable parts'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFinderOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Active machine banner if exists */}
        {activeMachine && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900">
            <span className="flex items-center gap-2 font-bold">
              <Check className="h-4 w-4 text-emerald-600" />
              {isAr ? 'الآلية النشطة حالياً:' : 'Current Active Machine:'}{' '}
              <strong className="underline font-mono">{activeMachine.label}</strong>
            </span>
            <button
              onClick={clearActiveMachine}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline"
            >
              {isAr ? 'إلغاء التحديد' : 'Clear Machine'}
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Direct Model Number Search */}
          <form onSubmit={handleDirectSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              {isAr ? 'البحث المباشر برقم الموديل أو الشاسيه:' : 'Instant Model Lookup:'}
            </label>
            <div className="relative flex items-center">
              <Search className={`absolute ${isAr ? 'right-3' : 'left-3'} h-4 w-4 text-muted-foreground`} />
              <input
                type="text"
                value={directSearch}
                onChange={(e) => setDirectSearch(e.target.value)}
                placeholder={isAr ? 'مثال: PC200-8, 320D, KX080-4, S185...' : 'e.g. PC200-8, 320D, KX080-4, S185...'}
                className={`w-full h-10 rounded-md border border-control bg-muted/40 text-xs font-mono text-foreground focus:outline-none focus:border-primary focus:bg-white transition-colors ${
                  isAr ? 'pr-9 pl-24' : 'pl-9 pr-24'
                }`}
              />
              <Button
                type="submit"
                size="sm"
                variant="royal"
                className={`absolute ${isAr ? 'left-1' : 'right-1'} h-8 px-3 text-xs font-bold`}
              >
                {isAr ? 'فحص' : 'Resolve'}
              </Button>
            </div>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isAr ? 'أو حدد خطوات المعدة' : 'Or Step-by-Step Cascade'}
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Cascade Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Step 1: Equipment Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                  1
                </span>
                {isAr ? 'نوع الآلية' : 'Equipment Type'}
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  const t = e.target.value;
                  setSelectedType(t);
                  const newMakes = MAKES[t] || [];
                  if (newMakes.length > 0) {
                    setSelectedMake(newMakes[0]);
                    const newModels = MODELS[newMakes[0]] || [];
                    if (newModels.length > 0) setSelectedModel(newModels[0]);
                  }
                }}
                className="w-full h-10 rounded-md border border-control bg-white px-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isAr ? t.nameAr : t.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Make */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                  2
                </span>
                {isAr ? 'الماركة / المصنّع' : 'Make'}
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  const m = e.target.value;
                  setSelectedMake(m);
                  const newModels = MODELS[m] || [];
                  if (newModels.length > 0) setSelectedModel(newModels[0]);
                }}
                className="w-full h-10 rounded-md border border-control bg-white px-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                {currentMakes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Model */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                  3
                </span>
                {isAr ? 'الموديل' : 'Model'}
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-10 rounded-md border border-control bg-white px-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-mono"
              >
                {currentModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Model Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              {isAr ? 'الموديلات الشائعة لماركة ' : 'Popular Models for '}{selectedMake}:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentModels.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedModel(m)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono border transition-all cursor-pointer ${
                    selectedModel === m
                      ? 'bg-primary text-white border-primary font-bold shadow-xs'
                      : 'bg-muted/50 text-foreground border-border hover:border-control'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>{isAr ? 'ضمان توافق الأبعاد والـ OEM بنسبة 100%' : '100% Fitment Guarantee'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFinderOpen(false)}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="royal"
              size="sm"
              onClick={() => handleSelect(selectedMake, selectedModel, selectedType)}
              className="gap-1.5 font-bold"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{isAr ? 'تأكيد وعرض القطع' : 'Find Matching Parts'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
