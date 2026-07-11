export type ResidentType = "JR" | "SR Glaucoma" | "SR Retina" | "SR Cornea";

export interface ProcedureRequirement {
  name: string;      // Internal/Unique name
  label: string;     // Friendly UI label
  target: number;    // Case target count
  xpPerCase: number; // XP awarded per case
}

export const SURGICAL_REQUIREMENTS: Record<ResidentType, ProcedureRequirement[]> = {
  "JR": [
    { name: "Cataract", label: "Cataracts", target: 10, xpPerCase: 20 },
    { name: "Pterygium", label: "Pterygium Surgery", target: 10, xpPerCase: 15 },
    { name: "Trab", label: "Trabeculectomy", target: 10, xpPerCase: 25 },
    { name: "C3R", label: "C3R / Collagen Cross-linking", target: 5, xpPerCase: 20 },
    { name: "Anti VEGF", label: "Anti-VEGF Injection", target: 5, xpPerCase: 15 },
    { name: "OGI repair", label: "Open Globe Injury Repair (OGI)", target: 10, xpPerCase: 30 },
    { name: "DLCP", label: "DLCP (Diode Laser Cyclophotocoagulation)", target: 5, xpPerCase: 15 }
  ],
  "SR Glaucoma": [
    { name: "Trab", label: "Trabeculectomy", target: 10, xpPerCase: 25 },
    { name: "Cataract", label: "Cataract Surgery", target: 5, xpPerCase: 20 },
    { name: "MIGS", label: "Minimally Invasive Glaucoma Surgery (MIGS)", target: 10, xpPerCase: 30 },
    { name: "Cataract + MIGS", label: "Combined Phaco + MIGS", target: 10, xpPerCase: 35 },
    { name: "GDD", label: "Glaucoma Drainage Device (GDD)", target: 10, xpPerCase: 40 },
    { name: "OGI repair", label: "Open Globe Injury Repair (OGI)", target: 5, xpPerCase: 30 }
  ],
  "SR Retina": [
    { name: "Pneumatic Retinopexy", label: "Pneumatic Retinopexy", target: 10, xpPerCase: 25 },
    { name: "PPV", label: "Pars Plana Vitrectomy (PPV)", target: 10, xpPerCase: 35 },
    { name: "Scleral Band", label: "Scleral Buckle / Band", target: 10, xpPerCase: 30 },
    { name: "SOR", label: "Silicone Oil Removal (SOR)", target: 5, xpPerCase: 20 },
    { name: "Intravitreal Injection", label: "Intravitreal Injection", target: 5, xpPerCase: 15 },
    { name: "OGI repair", label: "Open Globe Injury Repair (OGI)", target: 5, xpPerCase: 30 }
  ],
  "SR Cornea": [
    { name: "Cataract", label: "Cataract Surgery", target: 5, xpPerCase: 20 },
    { name: "PKP", label: "Penetrating Keratoplasty (PKP)", target: 10, xpPerCase: 35 },
    { name: "Refractive sx", label: "Refractive Surgery (LASIK/SMILE)", target: 5, xpPerCase: 25 },
    { name: "Endothelial keratoplasty", label: "Endothelial Keratoplasty (DSEK/DMEK)", target: 10, xpPerCase: 35 },
    { name: "C3R", label: "C3R / Collagen Cross-linking", target: 5, xpPerCase: 20 },
    { name: "AMT", label: "Amniotic Membrane Transplantation (AMT)", target: 5, xpPerCase: 15 },
    { name: "Pterygium", label: "Pterygium Surgery", target: 5, xpPerCase: 15 }
  ]
};

/**
 * Maps a string-based ResidentYear to one of our target types: JR, SR Glaucoma, SR Retina, or SR Cornea
 */
export function getResidentType(year: string): ResidentType {
  const lowercaseYear = year?.toLowerCase() || "";
  if (lowercaseYear.includes("glaucoma")) {
    return "SR Glaucoma";
  }
  if (lowercaseYear.includes("retina")) {
    return "SR Retina";
  }
  if (lowercaseYear.includes("cornea")) {
    return "SR Cornea";
  }
  if (lowercaseYear.includes("senior") || lowercaseYear.includes("y4") || lowercaseYear.includes("y5") || lowercaseYear.includes("y6")) {
    // If they are a general Senior Resident, map to Glaucoma as fallback, or let them specify in settings
    return "SR Glaucoma";
  }
  return "JR";
}

/**
 * Checks if a logged procedure match a given requirement name
 */
export function matchesProcedure(loggedProc: string, reqName: string): boolean {
  const lp = loggedProc.toLowerCase().trim();
  const rn = reqName.toLowerCase().trim();
  
  if (lp === rn) return true;
  
  // Custom smart matchings
  if (rn === "cataract" || rn === "cataracts") {
    return lp.includes("cataract") || lp.includes("phaco");
  }
  if (rn === "pterygium") {
    return lp.includes("pterygium");
  }
  if (rn === "trab") {
    return lp.includes("trab") || lp.includes("trabeculectomy");
  }
  if (rn === "c3r") {
    return lp.includes("c3r") || lp.includes("collagen cross");
  }
  if (rn === "anti vegf" || rn === "intravitreal injection") {
    return lp.includes("vegf") || lp.includes("intravitreal") || lp.includes("injection") || lp.includes("anti-vegf");
  }
  if (rn === "ogi repair") {
    return lp.includes("ogi") || lp.includes("open globe") || lp.includes("injury repair");
  }
  if (rn === "dlcp") {
    return lp.includes("dlcp") || lp.includes("diode laser") || lp.includes("cyclophotocoagulation");
  }
  if (rn === "migs") {
    return lp.includes("migs") || (lp.includes("minimally invasive") && lp.includes("glaucoma"));
  }
  if (rn === "cataract + migs") {
    return (lp.includes("phaco") || lp.includes("cataract")) && lp.includes("migs");
  }
  if (rn === "gdd") {
    return lp.includes("gdd") || lp.includes("drainage device") || lp.includes("ahmed valve");
  }
  if (rn === "pneumatic retinopexy") {
    return lp.includes("pneumatic") || lp.includes("retinopexy");
  }
  if (rn === "ppv") {
    return lp.includes("ppv") || lp.includes("vitrectomy") || lp.includes("pars plana");
  }
  if (rn === "scleral band") {
    return lp.includes("scleral band") || lp.includes("scleral buckle") || lp.includes("band");
  }
  if (rn === "sor") {
    return lp.includes("sor") || lp.includes("silicone oil") || lp.includes("oil removal");
  }
  if (rn === "pkp") {
    return lp.includes("pkp") || lp.includes("penetrating keratoplasty") || lp.includes("corneal transplant");
  }
  if (rn === "refractive sx") {
    return lp.includes("refractive") || lp.includes("lasik") || lp.includes("smile") || lp.includes("prk");
  }
  if (rn === "endothelial keratoplasty") {
    return lp.includes("endothelial") || lp.includes("keratoplasty") || lp.includes("dsek") || lp.includes("dmek");
  }
  if (rn === "amt") {
    return lp.includes("amt") || lp.includes("amniotic") || lp.includes("membrane");
  }

  return lp.includes(rn) || rn.includes(lp);
}
