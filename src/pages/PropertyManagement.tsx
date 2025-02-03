import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import FormStep from '@/components/FormStep';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PropertyManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interestedInPropertyManagement, setInterestedInPropertyManagement] = useState('');

  const handlePrevious = () => {
    navigate('/additional-parties');
  };

  const handleNext = () => {
    if (!interestedInPropertyManagement) {
      toast({
        title: "Error",
        description: "Please select yes or no",
        variant: "destructive",
      });
      return;
    }

    // Save the choice to localStorage
    localStorage.setItem('interestedInPropertyManagement', interestedInPropertyManagement);

    // Navigate to the insurance page
    navigate('/insurance');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-2xl">
        <img 
          src="/static/ProsperityAbstract-logo_1972x564.png" 
          alt="Prosperity Abstract Logo" 
          className="w-64 mx-auto mb-8"
        />

        <FormStep
          title="Property Management Services"
          currentStep={4}
          totalSteps={5}
          onNext={handleNext}
          onPrevious={handlePrevious}
          nextButtonText="Next"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="interestedInPropertyManagement" className="text-lg block text-center mb-4">
                Would you like to learn more about our No Stress Property Management Services?
              </Label>
              <Select
                value={interestedInPropertyManagement}
                onValueChange={setInterestedInPropertyManagement}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormStep>
      </div>
    </div>
  );
};

export default PropertyManagement;
