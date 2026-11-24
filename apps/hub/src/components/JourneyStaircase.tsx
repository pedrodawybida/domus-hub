"use client";

import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";

export interface JourneyStaircaseStep {
  id: number;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
}

interface JourneyStaircaseProps {
  steps: JourneyStaircaseStep[];
  activeStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  completeLabel?: string;
}

export function JourneyStaircase({
  steps,
  activeStep,
  onStepChange,
  onComplete,
  completeLabel = "Rever jornada",
}: JourneyStaircaseProps) {
  const current = steps.find((step) => step.id === activeStep) ?? steps[0];
  const CurrentIcon = current.icon;

  return (
    <div className="journey-staircase" aria-label="Etapas da jornada imobiliária">
      <div className="journey-staircase__heading">
        <div>
          <span className="journey-staircase__eyebrow">O caminho, passo a passo</span>
          <h3>Uma jornada clara, do primeiro plano à conquista.</h3>
        </div>
        <span className="journey-staircase__count" aria-live="polite">
          {String(activeStep).padStart(2, "0")} <span>/ {String(steps.length).padStart(2, "0")}</span>
        </span>
      </div>

      <div className="journey-staircase__viewport">
        <div className="journey-staircase__steps" role="group" aria-label="Selecione uma etapa">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isComplete = step.id < activeStep;

            return (
              <button
                key={step.id}
                type="button"
                aria-current={isActive ? "step" : undefined}
                aria-label={`Etapa ${step.id}: ${step.title}`}
                onClick={() => onStepChange(step.id)}
                className={`journey-staircase__step${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                style={{ "--step-order": step.id } as CSSProperties}
              >
                <span className="journey-staircase__step-icon">
                  {isComplete ? <Check size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
                </span>
                <span className="journey-staircase__step-number">{String(step.id).padStart(2, "0")}</span>
                <span className="journey-staircase__step-title">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="journey-staircase__progress" aria-label={`Progresso: ${activeStep} de ${steps.length}`}>
        <span style={{ transform: `scaleX(${activeStep / steps.length})` }} />
      </div>

      <article className="journey-staircase__focus" key={current.id} aria-live="polite">
        <div className="journey-staircase__focus-icon"><CurrentIcon size={22} aria-hidden="true" /></div>
        <div className="journey-staircase__focus-copy">
          <span>Etapa {String(current.id).padStart(2, "0")}</span>
          <h4>{current.title}</h4>
          <p>{current.description}</p>
          <p className="journey-staircase__detail">{current.detail}</p>
        </div>
        <button
          type="button"
          className="journey-staircase__next"
          onClick={() => {
            if (activeStep < steps.length) onStepChange(activeStep + 1);
            else if (onComplete) onComplete();
            else onStepChange(1);
          }}
          aria-label={activeStep < steps.length ? "Avançar para a próxima etapa" : completeLabel}
        >
          <span>{activeStep < steps.length ? "Próxima etapa" : completeLabel}</span>
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </article>
    </div>
  );
}
