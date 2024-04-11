"use client";

import React, {PropsWithChildren, useContext, useMemo, useRef, useTransition} from "react";
import {Button} from "./button";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {Handler, useWizard as useWiz, Wizard as Wiz} from "react-use-wizard";
import {toast} from "sonner";
import {Spinner} from "./spinner";

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

interface WizardProps extends PropsWithChildren {
    finishHandler: () => void;
}

const Wizard: React.FC<WizardProps> = ({ children, finishHandler }) => {
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
            <Wiz
                footer={<WizardStepper nextClick={nextClickHandler} finishHandler={finishHandler} />}
                wrapper={<div className="pb-3" />}
            >
                {children}
            </Wiz>
        </WizardContext.Provider>
    );
};

interface WizardPageProps extends PropsWithChildren {
    title: string;
}

const WizardPage: React.FC<WizardPageProps> = ({children, title}) => {
    const {isLoading} = useWiz();

    return (
        <>
            <h1 className="text-center text-2xl pb-3">{title}</h1>
            <div className="relative h-full w-full flex justify-center items-center">
                <div className="w-full">
                    {children}
                </div>
                {isLoading && (
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-sm">
                        <Spinner className="w-12 h-12" />
                    </div>
                )}
            </div>
        </>
    );
}

interface WizardStepperProps {
    nextClick: React.MutableRefObject<NextClickHandler | null>;
    finishHandler: () => void;
}

function WizardStepper({nextClick, finishHandler}: WizardStepperProps) {
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

    const [isFinishing, startTransition] = useTransition();
    const loading = useMemo(() => isLoading || isFinishing, [isLoading, isFinishing]);

    async function onNextClick() {
        if (isLastStep) {
            // nextStep will not trigger anything when the last step is reached. Instead, call custom finish handler
            startTransition(finishHandler);
            return;
        }

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
            <Button variant={continueButtonVariant} onClick={onNextClick} disabled={loading}>
                {isLastStep ? "Fertig" : "Weiter"}
                <ArrowRight />
            </Button>
        </div>
    );
}

export { Wizard, useWizard, WizardPage };