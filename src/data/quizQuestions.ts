export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  tag: string;
  subtag: string;
  exam?: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- Refractive Surgery ---
  {
    id: "ref_1",
    question: "Which imaging method in refractive surgery uses a low-intensity laser focused on the retina as a point source to evaluate refractive state?",
    options: [
      "Scheimpflug imaging",
      "Thin-beam single-ray tracing",
      "Spectral-domain OCT",
      "Hartmann-Shack wavefront sensing"
    ],
    correctAnswer: "D",
    explanation: "Wavefront aberrometry measures total refractive error, including higher- and lower-order aberrations. Hartmann–Shack is the most common technique, using laser light reflected from the retina through lenslets to reconstruct the wavefront. Alternatives include thin-beam ray tracing, Tscherning, and optical path difference. Scheimpflug imaging and OCT assess corneal/retinal structure, not refractive error.",
    tag: "Refractive Surgery",
    subtag: "Imaging"
  },
  {
    id: "ref_2",
    question: "Why is mitomycin C (MMC) used during surface ablation in a patient with prior LASIK and residual myopia?",
    options: [
      "Prevents haze formation after surface ablation",
      "FDA-approved for PRK haze prevention",
      "Should be avoided due to toxicity in low corrections",
      "Reduces pain and haze"
    ],
    correctAnswer: "A",
    explanation: "Mitomycin C (MMC) is used off-label to prevent corneal haze after surface ablation, especially in moderate to high corrections or in eyes with prior PRK, LASIK, PKP, or RK. It is not FDA-approved. The cornea is irrigated with BSS afterward; chilled BSS may reduce pain and haze.",
    tag: "Refractive Surgery",
    subtag: "Mitomycin C"
  },
  {
    id: "ref_3",
    question: "What is a disadvantage of SMILE compared with excimer-based procedures?",
    options: [
      "Greater disruption of anterior corneal innervation",
      "Less biomechanical stability",
      "More sensitivity to environmental factors",
      "Limited therapeutic range"
    ],
    correctAnswer: "D",
    explanation: "SMILE has a narrower treatment range than excimer ablation. Approved indications include myopia (−1.00 to −10.00 D) and astigmatism (−0.75 to −3.00 D, MRSE > −10.00 D). It is not approved for hyperopia but offers biomechanical stability, less nerve disruption, and reduced environmental effects.",
    tag: "Refractive Surgery",
    subtag: "SMILE"
  },
  {
    id: "ref_4",
    question: "In monovision LASIK for a −5.00 D myopic eye planned for near vision, what treatment should be programmed?",
    options: [
      "−3.50 D",
      "−6.50 D",
      "−0.75 D",
      "−1.50 D"
    ],
    correctAnswer: "A",
    explanation: "Monovision can reduce presbyopia-related spectacle dependence by inducing mild myopia in one eye. Typical targets are −0.50 to −1.50 D, providing good near/intermediate vision while maintaining stereopsis. Mini-monovision (−0.50 to −0.75 D) preserves distance vision; blended vision targets −1.00 to −1.50 D.",
    tag: "Refractive Surgery",
    subtag: "Monovision"
  },
  {
    id: "ref_5",
    question: "What concentration and duration of MMC are most commonly used in refractive surgery?",
    options: [
      "0.002% for 2–4 min",
      "0.02% for 12–120 sec",
      "0.2% for 12–120 sec",
      "2.0% for 10–30 sec"
    ],
    correctAnswer: "B",
    explanation: "MMC reduces corneal haze after PRK or PTK. Common concentrations are 0.01%–0.02% for 10–120 seconds. Overdosage may cause corneal melt; other risks include keratitis, delayed healing, and scarring.",
    tag: "Refractive Surgery",
    subtag: "Mitomycin C"
  },
  {
    id: "ref_6",
    question: "Most common pathogen in infectious keratitis after LASIK?",
    options: [
      "Pseudomonas spp",
      "Staphylococcus spp",
      "Mycobacterium spp",
      "Nocardia spp"
    ],
    correctAnswer: "C",
    explanation: "Post-LASIK keratitis usually appears 2–3 days post-op with focal infiltrates and possible AC reaction. Common pathogens are Staphylococcus and Streptococcus spp., followed by atypical mycobacteria, Nocardia, and fungi. Flap lift with interface cultures and antibiotic irrigation is essential if infection is suspected.",
    tag: "Refractive Surgery",
    subtag: "Infections"
  },
  {
    id: "ref_7",
    question: "Which refractive procedure has the highest risk of iatrogenic ectasia?",
    options: [
      "LASIK",
      "Epikeratophakia",
      "PRK",
      "Intrastromal corneal ring segment"
    ],
    correctAnswer: "A",
    explanation: "Ectasia occurs more often after LASIK than PRK due to thinner residual stromal beds. ICRS may reduce irregular astigmatism but do not halt progression. Epikeratophakia, once used, involved suturing a donor lenticule to Bowman’s layer and is now obsolete.",
    tag: "Refractive Surgery",
    subtag: "Ectasia"
  },
  {
    id: "ref_8",
    question: "Haze after PRK typically peaks at what time?",
    options: [
      "1–2 days",
      "1–2 weeks",
      "1–2 months",
      "6–8 months"
    ],
    correctAnswer: "C",
    explanation: "Subepithelial haze after surface ablation results from epithelial–stromal healing. It appears within weeks, peaks at 1–2 months, and usually regresses over 6–12 months.",
    tag: "Refractive Surgery",
    subtag: "Haze"
  },

  // --- Clinical Optics and Visual Rehabilitation ---
  {
    id: "opt_1",
    question: "The simplest imaging system is a pinhole camera. Which feature characterizes this device?",
    options: [
      "High magnification",
      "Superb depth of field",
      "Upright image at the image plane",
      "Rapid exposure times"
    ],
    correctAnswer: "B",
    explanation: "Pinhole camera magnification depends on pinhole–image plane distance. Image is inverted, needs long exposure due to low light, but depth of field is nearly unlimited.",
    tag: "Clinical Optics and Visual Rehabilitation",
    subtag: "Pinhole Optics"
  },
  {
    id: "opt_2",
    question: "During a solar eclipse, a pinhole camera gives dim images. A +1.00 D lens is used to project a sharp solar image on the ground. At what distance should the lens be held?",
    options: [
      "0.5 m",
      "1.0 m",
      "2.0 m",
      "Any distance works, as with a pinhole"
    ],
    correctAnswer: "B",
    explanation: "A +1.00 D lens focuses distant objects 1 m away (P = 1/f). The sun, a distant object, would form its image 1 m behind the lens.",
    tag: "Clinical Optics and Visual Rehabilitation",
    subtag: "Lenses"
  },
  {
    id: "opt_3",
    question: "A distant object is imaged 1.0 m to the right of a lens system. Adding a +3.00 D lens adjacent shifts the image location to?",
    options: [
      "25 cm right",
      "50 cm right",
      "1.5 m right",
      "4.0 m right"
    ],
    correctAnswer: "A",
    explanation: "For a distant object, U=0, so P=+1.00 D. Adding +3.00 D makes P=+4.00 D, giving image at 0.25 m.",
    tag: "Clinical Optics and Visual Rehabilitation",
    subtag: "Lenses"
  },
  {
    id: "opt_4",
    question: "In uncorrected myopia, where does the image of a distant object form?",
    options: [
      "In front of retina",
      "On the retina",
      "Behind the retina",
      "Depends on accommodation"
    ],
    correctAnswer: "A",
    explanation: "In uncorrected myopia, images of distant objects fall in front of the retina; in hyperopia, behind it. Accommodation may help in hyperopia.",
    tag: "Clinical Optics and Visual Rehabilitation",
    subtag: "Refractive Error"
  },
  {
    id: "opt_5",
    question: "Power cross: +1.00 @ 25°, −2.00 @ 115°. What is the minus-cylinder notation?",
    options: [
      "1.00 -2.00 across 115",
      "−2.00 +1.00 ×025°",
      "+1.00 −3.00 ×025°",
      "−2.00 +3.00 ×025°"
    ],
    correctAnswer: "C",
    explanation: "Power-cross difference is 3.00 D. Minus cylinder form = +1.00/−3.00 × 25°. Plus cylinder = −2.00/+3.00 × 115°.",
    tag: "Clinical Optics and Visual Rehabilitation",
    subtag: "Refraction"
  },

  // --- Pediatric Ophthalmology & Strabismus ---
  {
    id: "ped_1",
    question: "In testing visual acuity in preliterate children, what optotype has the best calibration and reliability?",
    options: [
      "HOTV",
      "Tumbling E",
      "Allen figures",
      "Light house chart"
    ],
    correctAnswer: "A",
    explanation: "HOTV optotypes provide standardized calibration and reliable results in young children.",
    tag: "Pediatric Ophthalmology & Strabismus",
    subtag: "Visual Function"
  },
  {
    id: "ped_2",
    question: "What is the primary sensory territory carried by CN VII?",
    options: [
      "External auditory meatus sensation",
      "Preauricular skin sensation",
      "Preganglionic sympathetic to ciliary ganglion",
      "Taste from posterior 1/3 tongue"
    ],
    correctAnswer: "A",
    explanation: "Facial nerve transmits sensation from the external auditory canal and adjacent skin; taste from anterior 2/3 (not posterior 1/3).",
    tag: "Pediatric Ophthalmology & Strabismus",
    subtag: "Extraocular Muscles & Nerve Laws"
  },
  {
    id: "ped_3",
    question: "In right gaze, the innervation to the right lateral rectus will increase. What determines the amount of innervation to the right medial rectus in this situation?",
    options: [
      "Arc of contact",
      "Sherrington’s law",
      "Vergence amplitudes",
      "Recruitment"
    ],
    correctAnswer: "B",
    explanation: "Sherrington's law of reciprocal innervation states that increased innervation to an agonist muscle is accompanied by a reciprocal decrease in innervation to its antagonist (e.g., right medial rectus relaxes as right lateral rectus contracts).",
    tag: "Pediatric Ophthalmology & Strabismus",
    subtag: "Extraocular Muscles & Nerve Laws"
  },
  {
    id: "ped_4",
    question: "What are the primary synergistic (yoke) muscles for gazing up and to the right?",
    options: [
      "LIO + RSO",
      "LSR + RIO",
      "LIO + RSR",
      "LSO + RSR"
    ],
    correctAnswer: "C",
    explanation: "Yoke muscles for right upward gaze are left inferior oblique (LIO) and right superior rectus (RSR).",
    tag: "Pediatric Ophthalmology & Strabismus",
    subtag: "Extraocular Muscles & Nerve Laws"
  },
  {
    id: "ped_5",
    question: "Essential feature of monofixation syndrome?",
    options: [
      "Normal stereopsis",
      "Loss of peripheral fusion",
      "Amblyopia",
      "Peripheral fusion without bifoveal fusion"
    ],
    correctAnswer: "D",
    explanation: "Monofixation syndrome retains peripheral fusion but lacks bifoveal fusion.",
    tag: "Pediatric Ophthalmology & Strabismus",
    subtag: "Strabismus"
  },

  // --- Oculofacial Plastic and Orbital Surgery ---
  {
    id: "plas_1",
    question: "The lateral canthal tendon attaches to what structure?",
    options: [
      "lateral orbital rim",
      "lateral orbital tubercle (Whitnall's)",
      "orbicularis muscle",
      "Whitnall ligament"
    ],
    correctAnswer: "B",
    explanation: "The lateral canthal tendon inserts at Whitnall’s tubercle on the lateral orbital rim.",
    tag: "Oculofacial Plastic and Orbital Surgery",
    subtag: "Anatomy & Nerve Supply"
  },
  {
    id: "plas_2",
    question: "What sensory nerve enters the orbit through the superior orbital fissure?",
    options: [
      "optic nerve",
      "maxillary division of CN V",
      "facial nerve",
      "ophthalmic division of CN V"
    ],
    correctAnswer: "D",
    explanation: "The ophthalmic division (V1) of the trigeminal nerve passes via the superior orbital fissure.",
    tag: "Oculofacial Plastic and Orbital Surgery",
    subtag: "Anatomy & Nerve Supply"
  },
  {
    id: "plas_3",
    question: "Trauma patient with rock-hard lids, vision loss, IOP 45. Next step?",
    options: [
      "lateral canthotomy & cantholysis",
      "CT orbits",
      "topical antiglaucoma meds",
      "orbital exploration in OR"
    ],
    correctAnswer: "A",
    explanation: "Orbital compartment syndrome requires immediate lateral canthotomy and cantholysis to save vision.",
    tag: "Oculofacial Plastic and Orbital Surgery",
    subtag: "Trauma & Emergencies"
  },

  // --- Lens and Cataract ---
  {
    id: "lens_1",
    question: "What systemic disorder increases the likelihood of developing a cataract?",
    options: [
      "multiple sclerosis",
      "diabetes mellitus",
      "hypercholesterolemia",
      "ischemic cardiovascular disease"
    ],
    correctAnswer: "B",
    explanation: "Diabetes accelerates all age-related lens changes via sorbitol accumulation, glycation, and oxidative stress.",
    tag: "Lens and Cataract",
    subtag: "Systemic Links"
  },
  {
    id: "lens_2",
    question: "Where are the oldest layers of the lens located?",
    options: [
      "capsule",
      "cortex",
      "epinucleus",
      "endonucleus"
    ],
    correctAnswer: "D",
    explanation: "New lens fibers form peripherally, compacting older fibers into the central endonucleus.",
    tag: "Lens and Cataract",
    subtag: "Lens Anatomy"
  },
  {
    id: "lens_3",
    question: "Which layers are separated during hydrodelineation?",
    options: [
      "capsule–cortex",
      "cortex–epinucleus",
      "capsule–nucleus",
      "epinucleus–endonucleus"
    ],
    correctAnswer: "D",
    explanation: "Hydrodissection separates the cortex from the capsule, while hydrodelineation separates the epinucleus from the endonucleus.",
    tag: "Lens and Cataract",
    subtag: "Surgery Techniques"
  },

  // --- Fundamentals in Ophthalmology ---
  {
    id: "fund_1",
    question: "What is the approximate adult orbital volume?",
    options: [
      "5 mL",
      "15 mL",
      "30 mL",
      "50 mL"
    ],
    correctAnswer: "C",
    explanation: "Average adult orbital volume is approximately 30 mL; dimensions vary with sex and race.",
    tag: "Fundamentals in Ophthalmology",
    subtag: "Orbital Anatomy"
  },
  {
    id: "fund_2",
    question: "Normal central corneal endothelial cell density in young adults is approximately?",
    options: [
      "8000 cells/mm²",
      "3000 cells/mm²",
      "1000 cells/mm²",
      "500 cells/mm²"
    ],
    correctAnswer: "B",
    explanation: "Central endothelial density is about 2500–3000 cells/mm² in young adults; density declines with age, surgical trauma, and injury.",
    tag: "Fundamentals in Ophthalmology",
    subtag: "Cornea"
  },

  // --- External disease and cornea ---
  {
    id: "ext_1",
    question: "Best noninvasive method to visualize Acanthamoeba cysts?",
    options: [
      "AS-OCT",
      "Confocal microscopy",
      "Sclerotic scatter",
      "Specular microscopy"
    ],
    correctAnswer: "B",
    explanation: "Confocal microscopy allows in-vivo detection of Acanthamoeba cysts with good sensitivity/specificity but requires an experienced reader.",
    tag: "External disease and cornea",
    subtag: "Imaging-Confocal"
  },
  {
    id: "ext_2",
    question: "Which corneal layer is mainly affected in calcific band keratopathy?",
    options: [
      "epithelium",
      "Bowman layer",
      "anterior stroma",
      "deep stroma"
    ],
    correctAnswer: "B",
    explanation: "Band keratopathy deposits primarily localize to Bowman layer (superficial cornea) and coalesce across the interpalpebral zone.",
    tag: "External disease and cornea",
    subtag: "Degeneration"
  },

  // --- Glaucoma ---
  {
    id: "glau_1",
    question: "From where is the arterial blood supply of the anterior optic nerve primarily derived?",
    options: [
      "central retinal artery",
      "circle of Zinn-Haller",
      "pial arteries",
      "short posterior ciliary arteries"
    ],
    correctAnswer: "D",
    explanation: "Short posterior ciliary arteries (via the Zinn-Haller plexus) supply the anterior optic nerve head.",
    tag: "Glaucoma",
    subtag: "Anatomy-Vascular"
  },
  {
    id: "glau_2",
    question: "Which tonometer is based on the Imbert–Fick principle?",
    options: [
      "Perkins tonometer",
      "pneumotonometer",
      "rebound tonometer",
      "Schiøtz tonometer"
    ],
    correctAnswer: "A",
    explanation: "Perkins is a handheld applanation tonometer using the Imbert–Fick principle (same basis as Goldmann).",
    tag: "Glaucoma",
    subtag: "Diagnostics-Tonometry"
  },
  {
    id: "glau_3",
    question: "Which optic nerve head sign is most specific for glaucoma?",
    options: [
      "exposed lamina cribrosa",
      "focal notching of the neuroretinal rim",
      "nasal displacement of vessels",
      "peripapillary atrophy"
    ],
    correctAnswer: "B",
    explanation: "Focal rim notching indicates localized axonal loss and is highly specific for glaucoma.",
    tag: "Glaucoma",
    subtag: "Clinical-Disc signs"
  },

  // --- Retina ---
  {
    id: "ret_1",
    question: "What is the correct histological sequence of the five layers of Bruch’s membrane from the retinal side toward the scleral side?",
    options: [
      "RPE basement membrane, inner collagenous zone, elastic layer, outer collagenous zone, choriocapillaris basement membrane",
      "RPE basement membrane, elastic layer, inner collagenous zone, outer collagenous zone, choriocapillaris basement membrane",
      "Elastic layer, RPE basement membrane, inner collagenous zone, outer collagenous zone, choriocapillaris basement membrane",
      "Inner collagenous zone, elastic layer, outer collagenous zone, RPE basement membrane, choriocapillaris basement membrane"
    ],
    correctAnswer: "A",
    explanation: "The membrane is classically described as an “elastin sandwich,” with collagenous layers and basement membranes surrounding a central elastic layer.",
    tag: "Retina",
    subtag: "Anatomy"
  },
  {
    id: "ret_2",
    question: "Within the retina, rod density is greatest at what degree from fixation?",
    options: [
      "90°",
      "45°",
      "12°",
      "0°"
    ],
    correctAnswer: "C",
    explanation: "Rod density peaks at ~12° from fixation (~160,000/mm²), highest outside the fovea, whereas cones dominate the foveola.",
    tag: "Retina",
    subtag: "Retinal Anatomy"
  },

  // --- Uvea and Ocular Inflammation ---
  {
    id: "uvea_1",
    question: "What are the main effector cells of the innate immune system?",
    options: [
      "CD4+ T cells and CD8+ T cells",
      "macrophages and neutrophils",
      "mast cells and dendritic cells",
      "plasma cells and B lymphocytes"
    ],
    correctAnswer: "B",
    explanation: "Macrophages and neutrophils are the principal innate effectors, acting rapidly to phagocytose and degrade pathogens without prior sensitization.",
    tag: "Uvea and Ocular Inflammation",
    subtag: "Innate Immunity"
  },

  // --- Neuro-ophthalmology and Ocular Motility ---
  {
    id: "neuro_1",
    question: "Which cranial nerve runs along the surface of the clivus?",
    options: [
      "abducens (CN VI)",
      "oculomotor (CN III)",
      "trigeminal (CN V)",
      "trochlear (CN IV)"
    ],
    correctAnswer: "A",
    explanation: "CN VI (abducens) runs forward over the clivus in the subarachnoid space, pierces the dura near the petrous apex, passes under the petroclinoid ligament into Dorello’s canal — a highly vulnerable site for clival lesions or skull-base fractures.",
    tag: "Neuro-ophthalmology and Ocular Motility",
    subtag: "Cranial Nerves"
  },

  // --- General Medicine ---
  {
    id: "gen_1",
    question: "What is the mechanism of action of teprotumumab in thyroid eye disease?",
    options: [
      "Inhibits TSH secretion",
      "Competitively binds TSH receptor",
      "Competitively binds thyroid-stimulating immunoglobulin",
      "Inhibits insulin-like growth factor I receptor (IGF-1R)"
    ],
    correctAnswer: "D",
    explanation: "Teprotumumab treats thyroid eye disease by inhibiting the IGF-1 receptor, reducing the inflammatory and expansion signaling in orbital fibroblasts.",
    tag: "General Medicine",
    subtag: "Endocrinology"
  }
];
