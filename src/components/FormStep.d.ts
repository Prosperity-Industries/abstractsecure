import React from 'react';
interface FormStepProps {
    title: string;
    children: React.ReactNode;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
    nextButtonText?: string;
}
declare const FormStep: React.FC<FormStepProps>;
export default FormStep;
