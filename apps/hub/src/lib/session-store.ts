"use client";

import { useEffect, useState } from "react";

export interface ConsultantProfile {
  name: string;
  role: string;
  companyName: string;
  citiesCount: string;
  volumeSold: string;
}

const STORAGE_KEY = "domus_consultant_profile_v1";

export const DEFAULT_PROFILE: ConsultantProfile = {
  name: "Consultor Especialista Domus",
  role: "Estrategista de Planejamento Imobiliário",
  companyName: "Domus",
  citiesCount: "Curitiba e Região",
  volumeSold: "100% Ética e Transparência",
};

export function useConsultantProfile() {
  const [profile, setProfile] = useState<ConsultantProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      }
    } catch {
      // ignore storage errors
    }
    setLoaded(true);
  }, []);

  const updateProfile = (next: Partial<ConsultantProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...next };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  return { profile, updateProfile, loaded };
}
