"use client";

import React, {PropsWithChildren, useContext, useMemo, useRef} from "react";
import {Button} from "./button";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {Handler, useWizard as useWiz, Wizard as Wiz} from "react-use-wizard";

type NextClickHandler = (onSuccess: () => Promise<void>) => Promise<void>;

type WizardContextType = {
    handleNextClick(handler: NextClickHandler): void;
    handleStep: (handler: Handler) => void;
} | null;

const WizardContext = React.createContext<WizardContextType>(null);

const useWizard = () => {
    const context = useContext(WizardContext);

    if (!context) {
        throw new Error("useWizardContext must be used within a WizardContext.Provider");
    }

    return context;
};

const Wizard: React.FC<PropsWithChildren> = ({children}) => {
    const nextClickHandler = useRef<NextClickHandler | null>(null);

    const handleNextClick = (handler: NextClickHandler) => {
        nextClickHandler.current = handler;
    };
    const handleStep = (handler: Handler) => {
        const { handleStep } = useWiz();
        handleStep(handler);
    }

    return (
        <WizardContext.Provider value={{handleNextClick, handleStep}}>
            <Wiz footer={<WizardStepper nextClick={nextClickHandler} />} wrapper={<div className="pb-3" />}>
                {children}
            </Wiz>
        </WizardContext.Provider>
    );
};

interface WizardPageProps extends PropsWithChildren {
    title: string;
}

const WizardPage: React.FC<WizardPageProps> = ({children, title}) => {
    return (
        <div>
            <h1 className="text-center text-2xl pb-3">{title}</h1>
            {children}
        </div>
    );
}

interface WizardStepperProps {
    nextClick: React.MutableRefObject<NextClickHandler | null>;
}

function WizardStepper({nextClick}: WizardStepperProps) {
    const {
        nextStep,
        previousStep,
        isLoading,
        isFirstStep,
        isLastStep,
        activeStep,
        stepCount
    } = useWiz();

    const continueButtonVariant = useMemo(() => isLastStep ? "default" : "ghost", [isLastStep]);

    async function onNextClick() {
        const currentNextClick = nextClick.current;
        if (!currentNextClick) {
            await nextStep();
            return;
        }

        await currentNextClick(async () => {
            await nextStep()
            nextClick.current = null;
        });
    }

    function onPreviousClick() {
        previousStep();
        nextClick.current = null;
    }

    return (
        <div className="grid grid-cols-3 items-center">
            <Button variant="ghost" onClick={onPreviousClick} disabled={isFirstStep || isLoading}>
                <ArrowLeft />
                Zurück
            </Button>
            <p className="flex justify-center">
                Schritt {activeStep + 1} von {stepCount}
            </p>
            <Button variant={continueButtonVariant} onClick={onNextClick} disabled={isLoading}>
                {isLastStep ? "Fertig" : "Weiter"}
                <ArrowRight />
            </Button>
        </div>
    );
}

export { Wizard, useWizard, WizardPage };