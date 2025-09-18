import React, { createContext, useReducer, useContext, ReactNode } from "react";
import en from "../locales/en";
import ar from "../locales/ar";
import fa from "../locales/fa";
import tr from "../locales/tr";

type State = {
  language: "en" | "ar" | "fa" | "tr";

  darkMode: boolean;
  toneLabel: string;
  labels: typeof en;
  instrument: string;
  autoQuestionJump: boolean;
  backToTonic: boolean;
  trainingParams: {
    id: string;
    scale: string;
    levelChoices: string[];
    label: string;
  };
  gameParams: {
    levelChoices: number[];
    maqamSection: number;
  };
};

type Action =
  | { type: "SET_LANGUAGE"; payload: "en" | "ar" | "fa" | "tr" }
  | { type: "TOGGLE_THEME" }
  | { type: "UPDATE_TONE_LABEL"; payload: string }
  | { type: "SET_INSTRUMENT"; payload: string }
  | { type: "SET_AUTOQUESTIONJUMP"; payload: boolean }
  | { type: "SET_BACKTOTONIC"; payload: boolean }
  | {
      type: "SET_TRAINING_PARAMS";
      payload: {
        id: string;
        scale: string;
        levelChoices: string[];
        label: string;
      };
    }
  | {
      type: "SET_GAME_PARAMS";
      payload: {
        levelChoices: number[];
        maqamSection: number;
      };
    };

const initialState: State = {
  language: "en",
  darkMode: false,
  toneLabel: "DoReMi",
  labels: en,
  instrument: "piano",
  autoQuestionJump: false,
  backToTonic: false,
  trainingParams: {
    id: "",
    scale: "",
    levelChoices: [],
    label: "",
  },
  gameParams: {
    levelChoices: [],
    maqamSection: 0,
  },
};

const SettingsContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

const settingsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_LANGUAGE":
      return {
        ...state,
        language: action.payload,
        labels:
          action.payload === "en"
            ? en
            : action.payload === "ar"
            ? ar
            : action.payload === "fa"
            ? fa
            : tr,
      };
    case "TOGGLE_THEME":
      return { ...state, darkMode: !state.darkMode };
    case "UPDATE_TONE_LABEL":
      return { ...state, toneLabel: action.payload };
    case "SET_INSTRUMENT":
      return { ...state, instrument: action.payload };
    case "SET_AUTOQUESTIONJUMP":
      return { ...state, autoQuestionJump: action.payload };
    case "SET_BACKTOTONIC":
      return { ...state, backToTonic: action.payload };

    case "SET_TRAINING_PARAMS":
      return {
        ...state,
        trainingParams: action.payload,
      };

    case "SET_GAME_PARAMS":
      return {
        ...state,
        gameParams: action.payload,
      };

    default:
      return state;
  }
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
