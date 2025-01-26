import React, { useState, useEffect } from 'react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  interestedInPropertyManagement: string;
  interestedInInsuranceQuote: string;
  isRefi?: boolean;
  hasAdditionalTransactionParties?: string;
}

const DataCollectionForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem('roleInTransaction') || '');
  const [currentStep, setCurrentStep] = useState(() => {
    // If we have a role in localStorage, we're coming from TransactionInformation
    // so we should start at the personal information step
    const savedRole = localStorage.getItem('roleInTransaction');
    return savedRole ? 2 : 0;
  });
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
      interestedInPropertyManagement: '',
      interestedInInsuranceQuote: '',
      isRefi: undefined,
      hasAdditionalTransactionParties: ''
    };
  });

  const [addressConfirmation, setAddressConfirmation] = useState<'yes' | 'no' | null>(null);

  // Update role when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newRole = localStorage.getItem('roleInTransaction');
      if (newRole !== role) {
        setRole(newRole || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [role]);

  // Check localStorage on mount and when returning to the page
  useEffect(() => {
    const newRole = localStorage.getItem('roleInTransaction');
    if (newRole !== role) {
      setRole(newRole || '');
      // If we get a role, move to step 2
      if (newRole && currentStep < 2) {
        setCurrentStep(2);
      }
    }
  }, []);

  const totalSteps = 9;

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

  const handleSelectChange = (value: string, field: keyof FormData) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
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

        if (!response.ok) {
          throw new Error(`Failed to fetch address information: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data) {
          setFormData(prev => ({
            ...prev,
            propertyAddress: data.Title || '',
            isRefi: false
          }));
          setCurrentStep(1);
        } else {
          throw new Error('No data received from address lookup');
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    } 
    // Handle address confirmation step
    else if (currentStep === 1) {
      if (!addressConfirmation) {
        toast({
          title: "Error",
          description: "Please select yes or no",
          variant: "destructive",
        });
        return;
      }
      
      if (addressConfirmation === 'yes') {
        navigate('/transaction-information');
      } else if (addressConfirmation === 'no') {
        setCurrentStep(0);
        setFormData(prev => ({
          ...prev,
          propertyAddress: '',
          titleOrderNumber: '',
          titleFileNumber: ''
        }));
        setAddressConfirmation(null);
      }
      return;
    }
    // Handle personal information step
    else if (currentStep === 2) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.ssn || !formData.maritalStatus) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Save the form data to localStorage
      const personalInfo = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        ssn: formData.ssn,
        maritalStatus: formData.maritalStatus
      };
      localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
      
      // Navigate to additional parties page
      navigate('/additional-parties');
      return;
    }
    
    // For other steps, just proceed
    setCurrentStep(prev => prev + 1);
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
        interestedInPropertyManagement: '',
        interestedInInsuranceQuote: '',
        isRefi: undefined,
        hasAdditionalTransactionParties: ''
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
                <Label htmlFor="titleFileNumber">Title File Number</Label>
                <Input
                  id="titleFileNumber"
                  name="titleFileNumber"
                  value={formData.titleFileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your title file number"
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
            onNext={handleNext}
            onPrevious={handlePrevious}
            nextButtonText="Next"
          >
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Property Address:</h3>
                <p className="text-lg bg-gray-100 p-4 rounded-md">
                  {formData.propertyAddress}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Is this the correct address for your transaction? <span className="text-red-500">*</span></h3>
                <RadioGroup 
                  value={addressConfirmation || ''} 
                  onValueChange={(value) => setAddressConfirmation(value as 'yes' | 'no')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Yes, this is correct</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">No, this is not correct</Label>
                  </div>
                </RadioGroup>
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
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ssn">Social Security Number</Label>
                <Input
                  id="ssn"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  placeholder="Enter your SSN"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => handleSelectChange(value, 'maritalStatus')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hasAdditionalTransactionParties">
                  {`Are there additional ${role === 'buyer' ? 'Buyers' : 'Sellers'}?`}
                </Label>
                <Select
                  value={formData.hasAdditionalTransactionParties}
                  onValueChange={(value) => handleSelectChange(value, 'hasAdditionalTransactionParties')}
                >
                  <SelectTrigger>
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
        )}
        
        {/* Rest of your form steps */}
        {/* ... */}
      </div>
    </div>
  );
};

export default DataCollectionForm;
