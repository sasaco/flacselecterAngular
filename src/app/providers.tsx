'use client';

import React from 'react';
import { InputDataProvider } from "../context/InputDataContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <InputDataProvider>{children}</InputDataProvider>;
}
