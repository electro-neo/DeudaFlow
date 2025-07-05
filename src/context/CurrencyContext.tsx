import { createContext, useContext, useState, ReactNode } from "react";

interface CurrencyContextType {
  currency: "COP" | "USD";
  setCurrency: (currency: "COP" | "USD") => void;
  rate: number;
  setRate: (rate: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency debe usarse dentro de CurrencyProvider");
  return ctx;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");
  const [rate, setRate] = useState<number>(4000); // Valor por defecto

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, setRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};
