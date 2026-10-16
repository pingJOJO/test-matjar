'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Search, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useMachineStore, ActiveMachine } from '@/stores/useMachineStore';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Button } from '@/components/ui/button';

const EQUIPMENT_TYPES = [
  { id: 'excavator', nameEn: 'Excavator', nameAr: 'حفار هيدروليكي' },
  { id: 'loader', nameEn: 'Wheel Loader', nameAr: 'لودر مجنزر وعجلات' },
  { id: 'dozer', nameEn: 'Bulldozer', nameAr: 'بلدوزر تسوية' },
  { id: 'compact', nameEn: 'Skid Steer / Compact', nameAr: 'بوبكات ولودر مدمج' },
  { id: 'tractor', nameEn: 'Tractor & Agriculture', nameAr: 'جرار زراعي' },
  { id: 'engine', nameEn: 'Diesel Engine & Genset', nameAr: 'محرك ديزل ومولد' },
  { id: 'forklift', nameEn: 'Forklift & Telehandler', nameAr: 'رافعة شوكية' },
];

const MAKES: Record<string, string[]> = {
  excavator: ['Komatsu', 'Caterpillar', 'Kubota', 'Hitachi', 'Volvo', 'Doosan', 'JCB'],
  loader: ['Caterpillar', 'Komatsu', 'Volvo', 'John Deere', 'Case', 'Doosan'],
  dozer: ['Caterpillar', 'Komatsu', 'John Deere', 'Case'],
  compact: ['Bobcat', 'Caterpillar', 'Kubota', 'JCB', 'Case'],
  tractor: ['John Deere', 'Kubota', 'Case', 'New Holland', 'Massey Ferguson'],
  engine: ['Cummins', 'Caterpillar', 'Kubota', 'Yanmar', 'Perkins', 'Deutz'],
  forklift: ['Toyota', 'Komatsu', 'Caterpillar', 'Bobcat'],
};

const MODELS: Record<string, string[]> = {
  Komatsu: ['PC200-8', 'PC220-8', 'PC300-7', 'WA380-6', 'WA470-6', 'D65EX-16'],
  Caterpillar: ['320D', '320C', '330D', '336D', '950H', '966H', '980H', 'D6R'],
  Kubota: ['KX080-4', 'KX121-3', 'KX161-3', 'U35-4', 'V2203', 'V2403'],
  'John Deere': ['310SK', '410J', '450J', '4045', '6068', '5075E'],
  Bobcat: ['S185', 'S250', 'T190', 'T300', 'E35', 'E50'],
  JCB: ['3CX', '4CX', 'JS200', 'JS220'],
  Cummins: ['6BT5.9', 'ISB 6.7', 'QSB6.7', 'QSC8.3', 'ISX15'],
  Yanmar: ['4TNV98', '3TNV88', '4TNV84T'],
  Volvo: ['EC210B', 'EC240B', 'L120E'],
  Hitachi: ['ZX200-3', 'ZX210-5', 'ZX330-3'],
  Deutz: ['BF4M2012', 'BF6M1013', 'TCD2013'],
  Doosan: ['DX225LCA', 'DX300LCA'],
  Case: ['580N', '580 Super M'],
  Perkins: ['1104D-44T', '1106D-E66TA'],
};

export function PartFinderInline() {
  const router = useRouter();
  const { setActiveMachine } = useMachineStore();
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const [selectedType, setSelectedType] = useState<string>('excavator');
  const [selectedMake, setSelectedMake] = useState<string>('Komatsu');
  const [selectedModel, setSelectedModel] = useState<string>('PC200-8');

  const currentMakes = MAKES[selectedType] || Object.keys(MODELS);
  const currentModels = MODELS[selectedMake] || ['Standard Model'];

  const handleFind = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: ActiveMachine = {
      equipmentType: selectedType,
      make: selectedMake,
      model: selectedModel,
      label: `${selectedMake} ${selectedModel}`,
    };
    setActiveMachine(profile);
    router.push(`/products?search=${encodeURIComponent(selectedModel)}`);
  };

  return (
    <div
      className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-e2 text-slate-900"
      dir={dir}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? 'البحث عن القطع حسب موديل الآلية والمعدة' : 'Find Parts by Equipment Model'}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? 'حدد نوع وموديل معدتك لاستعراض القطع المتوافقة 100%'
                : 'Filter 36,000+ aftermarket parts by exact machine match'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto font-mono">
          100% Fitment Guaranteed
        </span>
      </div>

      <form onSubmit={handleFind} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* 1. Equipment Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {isAr ? '1. نوع الآلية' : '1. Equipment Type'}
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

        {/* 2. Make */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {isAr ? '2. الماركة / المصنّع' : '2. Make'}
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

        {/* 3. Model */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            {isAr ? '3. الموديل' : '3. Model'}
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

        {/* 4. Find Parts Button */}
        <div className="flex items-end">
          <Button
            type="submit"
            variant="royal"
            size="default"
            className="w-full h-10 font-bold text-xs gap-2 shadow-sm cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>{isAr ? 'عرض القطع المتوافقة' : 'Find Parts'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
