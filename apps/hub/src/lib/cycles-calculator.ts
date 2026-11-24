export interface CycleStep {
  cycleNumber: number;
  creditAmount: number;
  installment: number;
  entryUsed: number;
  propertyValueAfterAppreciation: number;
  monthlyRent: number;
  netCashflowMonthly: number;
  accumulatedPatrimony: number;
  accumulatedMonthlyRent: number;
  PropertiesCount: number;
}

export interface CyclesSimulationResult {
  monthlyInvestment: number;
  initialEntry: number;
  numCycles: number;
  initialCredit: number;
  initialInstallment: number;
  totalPatrimony: number;
  totalMonthlyPassiveIncome: number;
  totalInvestedOutOfPocket: number;
  patrimonyMultiplier: number;
  cycles: CycleStep[];
}

/**
 * Calcula a progressão patrimonial por ciclos imobiliários (autoquitação via locação),
 * reproduzindo a lógica apresentada na tela "Ciclos" da 1ª Reunião.
 */
export function calculateCycles(
  monthlyInvestment: number,
  initialEntry: number,
  numCycles: number,
  options?: {
    reducedInstallmentFactor?: number; // Ex: 0.00458166 (R$ 4.581,66 para cada R$ 1.000.000 de crédito)
    postContemplationFactor?: number; // Ex: 0.0056 (parcela após contemplação)
    monthlyRentalYield?: number; // Ex: 0.0085 (0,85% a.m. em locação estratégica / temporada)
    appreciationPerCycle?: number; // Ex: 0.20 (20% de valorização imobiliária + INCC durante o ciclo)
    avgMonthsToContemplate?: number; // Ex: 24 meses de desembolso até contemplar cada ciclo
  }
): CyclesSimulationResult {
  const safeMonthly = Math.max(0, monthlyInvestment || 0);
  const safeEntry = Math.max(0, initialEntry || 0);
  const safeCycles = Math.min(5, Math.max(1, Math.round(numCycles || 3)));

  // Na apresentação original: R$ 3.000/mês gera aprox. R$ 650.000 de crédito inicial na parcela reduzida
  // (fator ~0,00458166: R$ 1M = R$ 4.581,66/mês; ou ~R$ 2.290/mês para R$ 500k)
  const installmentFactor = options?.reducedInstallmentFactor ?? 0.00458166;
  const postFactor = options?.postContemplationFactor ?? 0.0055;
  const rentalYield = options?.monthlyRentalYield ?? 0.0085;
  const appreciation = options?.appreciationPerCycle ?? 0.18;
  const monthsToContemplate = options?.avgMonthsToContemplate ?? 24;

  const baseCreditFromMonthly = safeMonthly > 0 ? safeMonthly / installmentFactor : 0;
  // Entrada potencializa o poder de compra / lance do 1º ciclo
  const initialCredit = Math.round((baseCreditFromMonthly + safeEntry * 1.5) / 1000) * 1000;

  const cycles: CycleStep[] = [];
  let accumulatedPatrimony = 0;
  let accumulatedMonthlyRent = 0;
  let previousNetSurplus = 0;

  for (let i = 1; i <= safeCycles; i++) {
    // A cada novo ciclo, o cliente pode somar o aporte mensal original + o excedente líquido dos imóveis anteriores
    const availableMonthlyBudget = safeMonthly + Math.max(0, previousNetSurplus * 0.85);
    const cycleEntry = i === 1 ? safeEntry : 0;

    // Escalonamento da carta a cada ciclo
    const rawCredit =
      i === 1
        ? initialCredit
        : availableMonthlyBudget / installmentFactor;

    const creditAmount = Math.round(rawCredit / 5000) * 5000;
    const installment = Math.round(creditAmount * installmentFactor);
    const postInstallment = Math.round(creditAmount * postFactor);

    // Valor do imóvel adquirido + valorização no ciclo
    const propertyValueAfterAppreciation = Math.round(
      creditAmount * (1 + appreciation * (1 + (i - 1) * 0.12))
    );

    // Receita de locação mensal do imóvel deste ciclo
    const monthlyRent = Math.round(propertyValueAfterAppreciation * rentalYield);

    // Saldo líquido mensal deste imóvel (Aluguel - Parcela pós-contemplação)
    const netCashflowMonthly = monthlyRent - postInstallment;

    accumulatedPatrimony += propertyValueAfterAppreciation;
    accumulatedMonthlyRent += monthlyRent;
    previousNetSurplus += Math.max(0, netCashflowMonthly);

    cycles.push({
      cycleNumber: i,
      creditAmount,
      installment,
      entryUsed: cycleEntry,
      propertyValueAfterAppreciation,
      monthlyRent,
      netCashflowMonthly,
      accumulatedPatrimony,
      accumulatedMonthlyRent,
      PropertiesCount: i,
    });
  }

  // Desembolso real do bolso (basicamente no 1º ciclo até contemplar + entrada, pois depois os imóveis se pagam)
  const totalInvestedOutOfPocket =
    safeMonthly * monthsToContemplate + safeEntry;

  const patrimonyMultiplier =
    totalInvestedOutOfPocket > 0
      ? Number((accumulatedPatrimony / totalInvestedOutOfPocket).toFixed(1))
      : 0;

  return {
    monthlyInvestment: safeMonthly,
    initialEntry: safeEntry,
    numCycles: safeCycles,
    initialCredit: cycles[0]?.creditAmount ?? 0,
    initialInstallment: cycles[0]?.installment ?? 0,
    totalPatrimony: accumulatedPatrimony,
    totalMonthlyPassiveIncome: accumulatedMonthlyRent,
    totalInvestedOutOfPocket,
    patrimonyMultiplier,
    cycles,
  };
}

/**
 * Calcula quantos anos o cliente demoraria guardando o valor da parcela mensal
 * (aplicado a uma taxa real líquida descontada a valorização do imóvel) para juntar o valor à vista.
 */
export function calculateSavingYearsVsConsorcio(
  targetCredit: number,
  monthlySaving: number,
  monthlyRealNetRate = 0.0045 // ~0,45% a.m. real acima do INCC/valorização imobiliária
) {
  if (monthlySaving <= 0 || targetCredit <= 0) {
    return { monthsToSave: 0, yearsToSave: 0 };
  }
  let balance = 0;
  let months = 0;
  while (balance < targetCredit && months < 600) {
    balance = balance * (1 + monthlyRealNetRate) + monthlySaving;
    months++;
  }
  return {
    monthsToSave: months,
    yearsToSave: Math.round((months / 12) * 10) / 10,
  };
}

export function formatBRL(value: number, showCents = false): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value || 0);
}

