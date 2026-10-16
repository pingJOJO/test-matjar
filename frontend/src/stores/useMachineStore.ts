import { create } from 'zustand';

export interface ActiveMachine {
  equipmentType: string;
  make: string;
  model: string;
  variant?: string;
  label: string; // e.g. "Kubota KX080-4"
}

interface MachineState {
  activeMachine: ActiveMachine | null;
  isFinderOpen: boolean;
  setActiveMachine: (machine: ActiveMachine) => void;
  clearActiveMachine: () => void;
  setFinderOpen: (open: boolean) => void;
  checkFit: (product: {
    sku?: string;
    title?: string;
    description?: string;
    attributes?: Record<string, any>;
  }) => 'exact' | 'likely' | 'none' | 'unknown';
}

export const useMachineStore = create<MachineState>((set, get) => ({
  activeMachine: null,
  isFinderOpen: false,

  setActiveMachine: (machine: ActiveMachine) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('a2z_active_machine', JSON.stringify(machine));
      } catch (err) {
        console.error('Failed to save active machine:', err);
      }
    }
    set({ activeMachine: machine });
  },

  clearActiveMachine: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('a2z_active_machine');
      } catch (err) {
        console.error('Failed to clear active machine:', err);
      }
    }
    set({ activeMachine: null });
  },

  setFinderOpen: (open: boolean) => {
    set({ isFinderOpen: open });
  },

  checkFit: (product) => {
    const { activeMachine } = get();
    if (!activeMachine) return 'unknown';

    const modelNormalized = activeMachine.model.toLowerCase().replace(/[^a-z0-9]/g, '');
    const makeNormalized = activeMachine.make.toLowerCase().trim();

    // Check compatibleModels in attributes (supports array or comma-separated string)
    const rawComp = product.attributes?.compatibleModels;
    const compModels: string[] = Array.isArray(rawComp)
      ? rawComp
      : typeof rawComp === 'string'
      ? rawComp.split(',').map((s) => s.trim())
      : [];
    const directHit = compModels.some((m) => {
      const norm = m.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm.includes(modelNormalized) || modelNormalized.includes(norm);
    });

    if (directHit) return 'exact';

    // Check title or description
    const fullText = `${product.title || ''} ${product.description || ''}`.toLowerCase();
    if (fullText.includes(activeMachine.model.toLowerCase())) {
      return 'exact';
    }

    if (fullText.includes(makeNormalized)) {
      return 'likely';
    }

    return 'none';
  },
}));
