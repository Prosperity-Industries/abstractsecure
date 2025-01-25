import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormStep from './FormStep';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadTestData } from '@/utils/tempTestData';

interface AdditionalParty {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  ssn: string;
  maritalStatus: string;
}

interface FormData {
  titleOrderNumber: string;
  titleFileNumber: string;
  fullName: string;
  propertyAddress: string;
  dateOfBirth: string;
  ssn: string;
  maritalStatus: string;
  roleInTransaction: string;
  hasAdditionalParties: string;
  additionalParties: AdditionalParty[];
  interestedInPropertyManagement: string;
  interestedInInsuranceQuote: string;
  isRefi?: boolean;
}

const DataCollectionForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      return JSON.parse(savedData);
    }

    // If no saved data, check for test data in development
    const testData = loadTestData();
    if (testData) {
      return testData;
    }

    // If no saved or test data, use empty values
    return {
      titleOrderNumber: '',
      titleFileNumber: '',
      fullName: '',
      propertyAddress: '',
      dateOfBirth: '',
      ssn: '',
      maritalStatus: '',
      roleInTransaction: '',
      hasAdditionalParties: '',
      additionalParties: [],
      interestedInPropertyManagement: '',
      interestedInInsuranceQuote: '',
      isRefi: undefined
    };
  });

  const totalSteps = formData.hasAdditionalParties === 'yes' 
    ? 9 + formData.additionalParties.length
    : 9;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    localStorage.setItem('formData', JSON.stringify({
      ...formData,
      [name]: value
    }));
  };

  const handleAdditionalPartyChange = (index: number, field: keyof AdditionalParty, value: string) => {
    setFormData(prev => {
      const updatedParties = [...prev.additionalParties];
      updatedParties[index] = {
        ...updatedParties[index] || {
          name: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          ssn: '',
          maritalStatus: ''
        },
        [field]: value
      };
      return {
        ...prev,
        additionalParties: updatedParties
      };
    });
  };

  const handleSelectChange = (value: string, field: keyof FormData) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // If changing hasAdditionalParties
      if (field === 'hasAdditionalParties') {
        if (value === 'yes' && prev.additionalParties.length === 0) {
          // Add first additional party if selecting 'yes'
          newData.additionalParties = [
            {
              name: '',
              phone: '',
              email: '',
              dateOfBirth: '',
              ssn: '',
              maritalStatus: ''
            }
          ];
        } else if (value === 'no') {
          // Clear additional parties if selecting 'no'
          newData.additionalParties = [];
        }
      }
      
      return newData;
    });
    
    localStorage.setItem('formData', JSON.stringify({
      ...formData,
      [field]: value
    }));
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    // Handle the title order number step
    if (currentStep === 0) {
      if (!formData.titleFileNumber) {
        toast({
          title: "Error",
          description: "Please enter a Title File Number",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsSubmitting(true);

        const response = await fetch('https://hook.us2.make.com/kwq1swnwft87fv4fxclyxbq2x5wcu5pt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title_file: formData.titleFileNumber.trim()
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('Failed to fetch address information');
        }

        // Check if we received valid address data
        if (data && 
            data.street_number && 
            data.street_name && 
            data.city && 
            data.state && 
            data.zip) {
          
          // Format the address
          const address = `${data.street_number} ${data.street_name}, ${data.city}, ${data.state} ${data.zip}`;
          setFormData(prev => ({
            ...prev,
            propertyAddress: address,
            isRefi: data.refi === true // Set refi flag if it exists
          }));
        } else {
          // If we don't get valid address data, set an error message
          setFormData(prev => ({
            ...prev,
            propertyAddress: "Title File Not Found"
          }));
        }

        setIsSubmitting(false);
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        setIsSubmitting(false);
        console.error('Error:', error);
        
        // Set error message in the address field
        setFormData(prev => ({
          ...prev,
          propertyAddress: "Title File Not Found"
        }));
        
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // For all other steps, just advance to the next step
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Show loading toast
      toast({
        title: "Submitting...",
        description: "Please wait while we process your information.",
      });

      // Prepare the data for submission
      const submissionData = {
        titleFileNumber: formData.titleFileNumber
      };

      // Send data to webhook
      const response = await fetch('https://hook.us2.make.com/kwq1swnwft87fv4fxclyxbq2x5wcu5pt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your information has been submitted successfully.",
        variant: "default"
      });

      // Clear form data from localStorage
      localStorage.removeItem('formData');

      // Reset form to initial state
      setFormData({
        titleOrderNumber: '',
        titleFileNumber: '',
        fullName: '',
        propertyAddress: '',
        dateOfBirth: '',
        ssn: '',
        maritalStatus: '',
        roleInTransaction: '',
        hasAdditionalParties: '',
        additionalParties: [],
        interestedInPropertyManagement: '',
        interestedInInsuranceQuote: '',
        isRefi: undefined
      });

      // Return to first step
      setCurrentStep(0);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAddressConfirm = () => {
    // Navigate to the Transaction Information webform
    navigate('/transaction-information');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-2xl">
        <img 
          src="/lovable-uploads/b5f84e95-837e-4ccc-ace0-b9ff6ad926ec.png" 
          alt="Prosperity Abstract Logo" 
          className="w-64 mx-auto mb-8"
        />

        {currentStep === 0 && (
          <FormStep
            title="Enter Title Order Number"
            currentStep={1}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={() => {}}
            nextButtonText={isSubmitting ? "Loading..." : "Next"}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="titleOrderNumber">Title Order Number</Label>
                <Input
                  id="titleOrderNumber"
                  name="titleOrderNumber"
                  value={formData.titleOrderNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your title order number"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </FormStep>
        )}

        {currentStep === 1 && (
          <FormStep
            title="Address Verification"
            currentStep={2}
            totalSteps={totalSteps}
            onNext={handleAddressConfirm}
            onPrevious={handlePrevious}
            nextButtonText="Confirm Address"
          >
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Is this the correct address for your transaction?</h3>
                <p className="text-lg bg-gray-100 p-4 rounded-md">
                  {formData.propertyAddress}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      propertyAddress: '',
                      titleOrderNumber: ''
                    }));
                    setCurrentStep(0);
                  }}
                >
                  No, Wrong Address
                </button>
              </div>
            </div>
          </FormStep>
        )}

        {currentStep === 2 && (
          <FormStep
            title="Personal Information"
            currentStep={3}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            nextButtonText="Next"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="roleInTransaction">Role in Transaction</Label>
                <Select
                  value={formData.roleInTransaction}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      roleInTransaction: value
                    }));
                    localStorage.setItem('formData', JSON.stringify({
                      ...formData,
                      roleInTransaction: value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormStep>
        )}
        
        {/* Rest of your form steps */}
        {/* ... */}
      </div>
    </div>
  );
};

export default DataCollectionForm;
