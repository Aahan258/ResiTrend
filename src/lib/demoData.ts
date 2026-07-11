import { SurgicalLog } from "../components/Dashboard";

export const HIGH_FIDELITY_DEMO_LOGS: SurgicalLog[] = [
  // Retina Tiers
  { 
    id: "demo-ret-1", 
    date: "2026-07-08", 
    procedure: "Pars Plana Vitrectomy (PPV)", 
    supervisor: "Dr. Mehta", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "None" 
  },
  { 
    id: "demo-ret-2", 
    date: "2026-07-06", 
    procedure: "Pars Plana Vitrectomy (PPV)", 
    supervisor: "Dr. Mehta", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "Vitreous Loss" 
  },
  { 
    id: "demo-ret-3", 
    date: "2026-07-05", 
    procedure: "Pneumatic Retinopexy", 
    supervisor: "Dr. Nair", 
    role: "Performed", 
    difficulty: "Medium", 
    complications: "None" 
  },
  { 
    id: "demo-ret-4", 
    date: "2026-07-01", 
    procedure: "Scleral Buckle / Band", 
    supervisor: "Dr. Mehta", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "None" 
  },
  { 
    id: "demo-ret-5", 
    date: "2026-06-28", 
    procedure: "Pars Plana Vitrectomy (PPV)", 
    supervisor: "Dr. Sengupta", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "None" 
  },
  
  // Cornea Tiers
  { 
    id: "demo-cor-1", 
    date: "2026-07-07", 
    procedure: "Endothelial Keratoplasty (DSEK/DMEK)", 
    supervisor: "Dr. Sengupta", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "None" 
  },
  { 
    id: "demo-cor-2", 
    date: "2026-07-03", 
    procedure: "Penetrating Keratoplasty (PKP)", 
    supervisor: "Dr. Nair", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "Mild corneal astigmatism" 
  },
  { 
    id: "demo-cor-3", 
    date: "2026-06-30", 
    procedure: "Refractive Surgery (LASIK/SMILE)", 
    supervisor: "Dr. Rao", 
    role: "Performed", 
    difficulty: "Medium", 
    complications: "None" 
  },
  { 
    id: "demo-cor-4", 
    date: "2026-06-24", 
    procedure: "Cataract Surgery", 
    supervisor: "Dr. Nair", 
    role: "Performed", 
    difficulty: "Easy", 
    complications: "None" 
  },

  // Glaucoma Tiers
  { 
    id: "demo-gl-1", 
    date: "2026-07-09", 
    procedure: "Trabeculectomy", 
    supervisor: "Dr. Sharma", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "None" 
  },
  { 
    id: "demo-gl-2", 
    date: "2026-07-04", 
    procedure: "Minimally Invasive Glaucoma Surgery (MIGS)", 
    supervisor: "Dr. Sharma", 
    role: "Performed", 
    difficulty: "Medium", 
    complications: "None" 
  },
  { 
    id: "demo-gl-3", 
    date: "2026-06-27", 
    procedure: "Combined Phaco + MIGS", 
    supervisor: "Dr. Rao", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "Early bleb leak" 
  },
  { 
    id: "demo-gl-4", 
    date: "2026-06-22", 
    procedure: "Glaucoma Drainage Device (GDD)", 
    supervisor: "Dr. Sharma", 
    role: "Performed", 
    difficulty: "Complex", 
    complications: "None" 
  }
];

export function triggerToast(message: string, sub?: string) {
  const event = new CustomEvent("resitrend-toast", { detail: { message, sub } });
  window.dispatchEvent(event);
}
