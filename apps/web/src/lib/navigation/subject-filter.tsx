"use client";

import { createContext, useContext } from "react";

export const SubjectFilterContext = createContext("");

export function useSubjectFilter() {
  return useContext(SubjectFilterContext);
}
