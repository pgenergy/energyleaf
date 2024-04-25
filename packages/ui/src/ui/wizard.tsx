"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { type PropsWithChildren, useContext, useMemo, useRef, useTransition } from "react";
import { type Handler, Wizard as Wiz, useWizard as useWiz } from "react-use-wizard";
import { Button } from "./button";
import { Spinner } from "./spinner";

type NextClickHandler = (onSuccess: () => Promise<void>) => Promise<void>;

type WizardContextType = {
    handleNextClick: (handler: NextClickHandler) => void;
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

    const handleNextClick = useRef((handler: NextClickHandler) => {
        nextClickHandler.current = handler;
    });
    const handleStep = useRef((handler: Handler) => {
        const { handleStep: hs } = useWiz();
        hs(handler);
    });

    const contextValue = useMemo(
        () => ({
            handleNextClick: handleNextClick.current,
            handleStep: handleStep.current,
        }),
        [],
    );

    return (
        <WizardContext.Provider value={contextValue}>
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
    description?: string;
}

const WizardPage: React.FC<WizardPageProps> = ({ children, title, description }) => {
    const { isLoading } = useWiz();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="pb-3 text-center font-bold text-2xl">{title}</h1>
            {description && <p>{description}</p>}
            <div className="relative flex h-full w-full items-center justify-center">
                <div className="w-full">{children}</div>
                {isLoading && (
                    <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center backdrop-blur-sm">
                        <Spinner className="h-12 w-12" />
                    </div>
                )}
            </div>
        </div>
    );
};

interface WizardStepperProps {
    nextClick: React.MutableRefObject<NextClickHandler | null>;
    finishHandler: () => void;
}

function WizardStepper({ nextClick, finishHandler }: WizardStepperProps) {
    const { nextStep, previousStep, isLoading, isFirstStep, isLastStep, activeStep, stepCount } = useWiz();

    const continueButtonVariant = useMemo(() => (isLastStep ? "default" : "outline"), [isLastStep]);

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
            await nextStep();
            nextClick.current = null;
        });
    }

    function onPreviousClick() {
        previousStep();
        nextClick.current = null;
    }

    return (
        <div className="grid grid-cols-3 items-center justify-center">
            <Button variant="outline" onClick={onPreviousClick} disabled={isFirstStep || isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
            </Button>
            <div className="flex flex-row items-center justify-center gap-2">
                {[...Array(stepCount)].map((_, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <WizardStepDot key={index} isActive={index === activeStep} />
                ))}
            </div>
            <Button variant={continueButtonVariant} onClick={onNextClick} disabled={loading}>
                {isLastStep ? "Fertig" : "Weiter"}
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
}

interface WizardStepDotProps {
    isActive: boolean;
}

function WizardStepDot({ isActive }: WizardStepDotProps) {
    if (isActive) {
        return <div className="h-2 w-2 rounded-full bg-primary" />;
    }

    return <div className="h-1 w-1 rounded-full bg-card-foreground" />;
}

export { Wizard, useWizard, WizardPage };
