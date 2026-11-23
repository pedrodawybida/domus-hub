import type { CSSProperties } from "react";
import { ArrowDownRight, Info } from "lucide-react";

interface ScenarioComparisonGraphicProps {
  bankTotal: number;
  domusTotal: number;
  savings: number;
  formatValue: (value: number) => string;
}

/** A compact, data-led visual that turns the existing scenario totals into a clear comparison. */
export function ScenarioComparisonGraphic({
  bankTotal,
  domusTotal,
  savings,
  formatValue,
}: ScenarioComparisonGraphicProps) {
  const max = Math.max(bankTotal, domusTotal, 1);
  const bankScale = bankTotal / max;
  const domusScale = domusTotal / max;

  return (
    <div className="scenario-graphic" aria-label="Comparativo visual de custo total estimado">
      <div className="scenario-graphic__heading">
        <div>
          <span>VISÃO COMPARATIVA</span>
          <h3>O impacto do plano no custo total</h3>
        </div>
        <div className="scenario-graphic__saving">
          <ArrowDownRight size={18} aria-hidden="true" />
          <span>{formatValue(savings)}<small>economia estimada</small></span>
        </div>
      </div>

      <div className="scenario-graphic__rows">
        <div className="scenario-graphic__row">
          <div className="scenario-graphic__label"><span>Mercado tradicional</span><strong>{formatValue(bankTotal)}</strong></div>
          <div className="scenario-graphic__track"><span className="scenario-graphic__bar is-bank" style={{ "--bar-scale": bankScale } as CSSProperties} /></div>
        </div>
        <div className="scenario-graphic__row">
          <div className="scenario-graphic__label"><span>Planejamento Domus</span><strong>{formatValue(domusTotal)}</strong></div>
          <div className="scenario-graphic__track"><span className="scenario-graphic__bar is-domus" style={{ "--bar-scale": domusScale } as CSSProperties} /></div>
        </div>
      </div>

      <div className="scenario-graphic__footnote">
        <Info size={14} aria-hidden="true" />
        Estimativas calculadas para o crédito selecionado nesta apresentação.
      </div>
    </div>
  );
}
