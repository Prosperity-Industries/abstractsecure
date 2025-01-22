import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FormData {
  hasAdditionalParties: string;
  additionalParties: Array<{
    name: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    ssn: string;
    maritalStatus: string;
  }>;
}

interface FormStepProps {
  title: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  formData: FormData;
}

const FormStep: React.FC<FormStepProps> = ({
  title,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  formData
}) => {
  return (
    <Card className="w-full p-6 space-y-6 bg-white/90 backdrop-blur-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <div className="h-2 w-full bg-secondary rounded-full">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button onClick={onNext}>
          {currentStep === totalSteps && formData.hasAdditionalParties !== 'yes' ? "Submit" : "Next"}
        </Button>
      </div>
    </Card>
  );
};

export default FormStep;