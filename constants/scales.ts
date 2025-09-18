import { RequireContext } from "expo-router";
export type Maqam =
  | "Rast"
  | "Bayaty"
  | "Agam"
  | "Nahawand"
  | "Saba"
  | "Sika"
  | "Hegaz"
  | "Kurd";

export const keysMap = {
  Do: "دو",
  Re: "ري",
  Mi: "مي",
  Fa: "فا",
  Sol: "صول",
  La: "لا",
  Si: "سي",
  Doo: "دو",
  Ree: "ري",
  Re_b: "ري بيمول",
  Mi_b: "مي بيمول",
  Fa_d: "فا دييز",
  Sol_b: "صول بيمول",
  La_b: "لا بيمول",
  Si_b: "سي بيمول",
  Mi_q: "مي نصف بيمول",
  Si_q: "سي نصف بيمول",
  mii_q: "مي نصف بيمول",
  Ree_b: "ري بيمول",
};
export const tonesLables = {
  DoReMi: {
    Do: "Do",
    Re: "Re",
    Mi: "Mi",
    Fa: "Fa",
    Sol: "Sol",
    La: "La",
    Si: "Si",
    Doo: "Do",
    Ree: "Re",
    Re_b: "Re♭",
    Mi_b: "Mi♭",
    Fa_d: "Fa♯",
    Sol_b: "Sol♭",
    La_b: "La♭",
    Si_b: "Si♭",
    Mi_q: "Mi˷",
    Si_q: "Si˷",
    mii_q: "Mi˷",
    Ree_b: "Re♭",
  },
  Numbers: {
    Do: "1",
    Re: "2",
    Mi: "3",
    Fa: "4",
    Sol: "5",
    La: "6",
    Si: "7",
    Doo: "8",
    Ree: "9",
  },
  CDE: {
    Do: "C",
    Re: "D",
    Mi: "E",
    Fa: "F",
    Sol: "G",
    La: "A",
    Si: "B",
    Doo: "C",
    Ree: "D",
  },
};
export const scaleKeysMap = {
  DoReMi: {
    en: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Doo", "Ree"],
    ar: ["دو", "ري", "مي", "فا", "صول", "لا", "سي", "دوو", "ري"],
  },
  Numbers: {
    en: ["1", "2", "3", "4", "5", "6", "7", "8"],
    ar: ["1", "2", "3", "4", "5", "6", "7", "8"],
  },
  CDE: {
    en: ["C", "D", "E", "F", "G", "A", "B", "CC"],
    ar: ["C", "D", "E", "F", "G", "A", "B", "CC"],
  },
};

export const scalesLists = {
  Saba: ["re", "mi_q", "fa", "sol_b", "la", "si_b", "doo", "ree_b"],
  Nahawand: ["do", "re", "mi_b", "fa", "sol", "la_b", "si", "doo"],
  Agam: ["do", "re", "mi", "fa", "sol", "la", "si", "doo"],
  Bayaty: ["re", "mi_q", "fa", "sol", "la", "si_b", "doo", "ree"],
  Sika: ["mi_q", "fa", "sol", "la_b", "si", "doo", "ree", "mii_q"],
  Hegaz: ["re", "mi_b", "fa_d", "sol", "la", "si_b", "doo", "ree"],
  Rast: ["do", "re", "mi_q", "fa", "sol", "la", "si_q", "doo"],
  Kurd: ["re", "mi_b", "fa", "sol", "la", "si_b", "doo", "ree"],
};

export const maqamsScaleLists = {
  Saba: ["Saba_0"],
  Nahawand: ["Nahawand_0"],
  Agam: ["Agam_0"],
  Bayaty: ["Bayaty_0"],
  Sika: ["Sika_0"],
  Hegaz: ["Hegaz_0"],
  Rast: ["Rast_0"],
  Kurd: ["Kurd_0"],
};

export const maqamsExamplesLists = {
  Saba: ["sabaExample_0", "sabaExample_1"],
  Nahawand: ["nahawandExample_0", "nahawandExample_1"],
  Agam: ["agamExample_0", "agamExample_1"],
  Bayaty: ["bayatyExample_0", "bayatyExample_1"],
  Sika: ["sikaExample_0", "sikaExample_1"],
  Hegaz: ["hegazExample_0", "hegazExample_1"],
  Rast: ["rastExample_0", "rastExample_1"],
  Kurd: ["kurdExample_0", "kurdExample_1"],
};

export const scalesNamesMap = {
  Saba: "صبا",
  Nahawand: "نهاوند",
  Agam: "عجم",
  Bayaty: "بياتي",
  Sika: "سيكا",
  Hegaz: "حجاز",
  Rast: "راست",
  Kurd: "كرد",
};

export const pianoSounds = require.context(
  "../assets/sounds/piano/",
  false,
  /\.mp3$/
);
export const oudSounds = require.context(
  "../assets/sounds/oud/",
  false,
  /\.mp3$/
);

export const maqamsPianoSounds = require.context(
  "../assets/sounds/piano/maqams",
  false,
  /\.mp3$/
);
export const maqamsOudSounds = require.context(
  "../assets/sounds/oud/maqams",
  false,
  /\.mp3$/
);

export const examplesPianoSounds = require.context(
  "../assets/sounds/piano/examples",
  false,
  /\.mp3$/
);
export const examplesOudSounds = require.context(
  "../assets/sounds/oud/examples",
  false,
  /\.mp3$/
);

export const dictaionPianoSounds = require.context(
  "../assets/sounds/piano/dictaion",
  false,
  /\.mp3$/
);
export const dictationOudSounds = require.context(
  "../assets/sounds/oud/dictaion",
  false,
  /\.mp3$/
);

export const soundFolders: { [key: string]: RequireContext } = {
  piano: pianoSounds,
  oud: oudSounds,
};
export const maqamsSoundFolders: { [key: string]: RequireContext } = {
  piano: maqamsPianoSounds,
  oud: maqamsOudSounds,
};
export const examplesSoundFolders: { [key: string]: RequireContext } = {
  piano: examplesPianoSounds,
  oud: examplesOudSounds,
};
export const dictationSoundFolders: { [key: string]: RequireContext } = {
  piano: dictaionPianoSounds,
  oud: dictationOudSounds,
};

export const maqamsSections = {
  SabaSection1: ["re", "mi_q", "fa", "sol_b"],
  SabaSection2: ["la", "si_b", "doo", "ree_b"],
  Saba: ["re", "mi_q", "fa", "sol_b", "la", "si_b", "doo", "ree_b"],

  NahawandSection1: ["do", "re", "mi_b", "fa"],
  NahawandSection2: ["sol", "la_b", "si", "doo"],
  Nahawand: ["do", "re", "mi_b", "fa", "sol", "la_b", "si", "doo"],

  AgamSection1: ["do", "re", "mi", "fa"],
  AgamSection2: ["sol", "la", "si", "doo"],
  Agam: ["do", "re", "mi", "fa", "sol", "la", "si", "doo"],

  BayatySection1: ["re", "mi_q", "fa", "sol"],
  BayatySection2: ["la", "si_b", "doo", "ree"],
  Bayaty: ["re", "mi_q", "fa", "sol", "la", "si_b", "doo", "ree"],

  SikaSection1: ["mi_q", "fa", "sol"],
  SikaSection2: ["la_b", "si", "doo", "ree", "mii_q"],
  Sika: ["mi_q", "fa", "sol", "la_b", "si", "doo", "ree", "mii_q"],

  HegazSection1: ["re", "mi_b", "fa_d", "sol"],
  HegazSection2: ["la", "si_b", "doo", "ree"],
  Hegaz: ["re", "mi_b", "fa_d", "sol", "la", "si_b", "doo", "ree"],

  RastSection1: ["do", "re", "mi_q", "fa"],
  RastSection2: ["sol", "la", "si_q", "doo"],
  Rast: ["do", "re", "mi_q", "fa", "sol", "la", "si_q", "doo"],

  KurdSection1: ["re", "mi_b", "fa", "sol"],
  KurdSection2: ["la", "si_b", "doo", "ree"],
  Kurd: ["re", "mi_b", "fa", "sol", "la", "si_b", "doo", "ree"],
};

export const trainigLevels = [
  {
    id: "1",
    scale: "Agam",
    levelChoices: maqamsSections.AgamSection1,
    label: "section1",
  },
  {
    id: "2",
    scale: "Agam",
    levelChoices: maqamsSections.AgamSection2,
    label: "section2",
  },
  {
    id: "3",
    scale: "Agam",
    levelChoices: maqamsSections.Agam,
    label: "section3",
  },
  {
    id: "4",
    scale: "Rast",
    levelChoices: maqamsSections.RastSection1,
    label: "section1",
  },
  {
    id: "5",
    scale: "Rast",
    levelChoices: maqamsSections.RastSection2,
    label: "section2",
  },
  {
    id: "6",
    scale: "Rast",
    levelChoices: maqamsSections.Rast,
    label: "section3",
  },
  {
    id: "7",
    scale: "Saba",
    levelChoices: maqamsSections.SabaSection1,
    label: "section1",
  },
  {
    id: "8",
    scale: "Saba",
    levelChoices: maqamsSections.SabaSection2,
    label: "section2",
  },
  {
    id: "9",
    scale: "Saba",
    levelChoices: maqamsSections.Saba,
    label: "section3",
  },
  {
    id: "10",
    scale: "Bayaty",
    levelChoices: maqamsSections.BayatySection1,
    label: "section1",
  },
  {
    id: "11",
    scale: "Bayaty",
    levelChoices: maqamsSections.BayatySection2,
    label: "section2",
  },
  {
    id: "12",
    scale: "Bayaty",
    levelChoices: maqamsSections.Bayaty,
    label: "section3",
  },
  {
    id: "13",
    scale: "Nahawand",
    levelChoices: maqamsSections.NahawandSection1,
    label: "section1",
  },
  {
    id: "14",
    scale: "Nahawand",
    levelChoices: maqamsSections.NahawandSection2,
    label: "section2",
  },
  {
    id: "15",
    scale: "Nahawand",
    levelChoices: maqamsSections.Nahawand,
    label: "section3",
  },
  {
    id: "16",
    scale: "Hegaz",
    levelChoices: maqamsSections.HegazSection1,
    label: "section1",
  },
  {
    id: "17",
    scale: "Hegaz",
    levelChoices: maqamsSections.HegazSection2,
    label: "section2",
  },
  {
    id: "18",
    scale: "Hegaz",
    levelChoices: maqamsSections.Hegaz,
    label: "section3",
  },
  {
    id: "19",
    scale: "Sika",
    levelChoices: maqamsSections.SikaSection1,
    label: "section1",
  },
  {
    id: "20",
    scale: "Sika",
    levelChoices: maqamsSections.SikaSection2,
    label: "section2",
  },
  {
    id: "21",
    scale: "Sika",
    levelChoices: maqamsSections.Sika,
    label: "section3",
  },
  {
    id: "22",
    scale: "Kurd",
    levelChoices: maqamsSections.KurdSection1,
    label: "section1",
  },
  {
    id: "23",
    scale: "Kurd",
    levelChoices: maqamsSections.KurdSection2,
    label: "section2",
  },
  {
    id: "24",
    scale: "Kurd",
    levelChoices: maqamsSections.Kurd,
    label: "section3",
  },
];

export const dictaionsLevels = [
  {
    id: "1",
    scale: "Saba",
  },
  {
    id: "2",
    scale: "Nahawand",
  },
  {
    id: "3",
    scale: "Agam",
  },
  {
    id: "4",
    scale: "Bayaty",
  },
  {
    id: "4",
    scale: "Sika",
  },
  {
    id: "6",
    scale: "Hegaz",
  },

  {
    id: "7",
    scale: "Rast",
  },

  {
    id: "8",
    scale: "Kurd",
  },
];
