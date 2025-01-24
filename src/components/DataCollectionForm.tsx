import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormStep from './FormStep';
import { useToast } from "@/components/ui/use-toast";
import AddressInput from './AddressInput';
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
  titleFileNumber: string;
  roleInTransaction: string;
  fullName: string;
  email: string;
  systemAddress: string;
  dateOfBirth: string;
  ssn: string;
  maritalStatus: string;
  hasAdditionalParties: string;
  additionalParties: AdditionalParty[];
  interestedInPropertyManagement: string;
  interestedInInsuranceQuote: string;
}

const DataCollectionForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
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
      titleFileNumber: '',
      roleInTransaction: '',
      fullName: '',
      email: '',
      systemAddress: '',
      dateOfBirth: '',
      ssn: '',
      maritalStatus: '',
      hasAdditionalParties: '',
      additionalParties: [],
      interestedInPropertyManagement: '',
      interestedInInsuranceQuote: ''
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = formData.hasAdditionalParties === 'yes' 
    ? 7 + formData.additionalParties.length
    : 7;

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

  const handleAddressChange = (address: FormData['systemAddress']) => {
    setFormData(prev => ({
      ...prev,
      systemAddress: address
    }));
    
    localStorage.setItem('formData', JSON.stringify({
      ...formData,
      systemAddress: address
    }));
  };

  const handleNext = async () => {
    if (isSubmitting) {
      return;
    }

    // Validate current step
    if (currentStep === 1) {
      if (!formData.titleFileNumber) {
        toast({
          title: "Error",
          description: "Please enter a title file number",
          variant: "destructive",
        });
        return;
      }

      // Send initial data to webhook and wait for response
      try {
        setIsSubmitting(true);
        console.log('Sending data to webhook:', {
          titleFileNumber: formData.titleFileNumber,
        });

        const response = await fetch('https://hook.us2.make.com/kwq1swnwft87fv4fxclyxbq2x5wcu5pt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            titleFileNumber: formData.titleFileNumber,
          }),
          credentials: 'omit' // Explicitly disable sending credentials
        });

        console.log('Response headers:', {
          contentType: response.headers.get('content-type'),
          cors: response.headers.get('access-control-allow-origin')
        });
        console.log('Webhook response status:', response.status);
        const data = await response.json();
        console.log('Webhook response data:', data);

        if (data && data.Title) {
          setFormData(prev => ({
            ...prev,
            systemAddress: data.Title
          }));
          
          toast({
            title: "Success",
            description: "Address found for the title file",
          });
          
          setCurrentStep(prev => prev + 1);
        } else {
          throw new Error('No address received from webhook');
        }
        
        setIsSubmitting(false);
      } catch (error) {
        console.error('Webhook error:', error);
        setIsSubmitting(false);
        toast({
          title: "Error",
          description: error.message === 'No address received from webhook' 
            ? "No address found for this title file number. Please verify the number and try again."
            : "Failed to verify file number. Please try again.",
          variant: "destructive",
        });
        return;
      }
      return;
    }

    // Address verification step
    if (currentStep === 2) {
      if (!formData.systemAddress) {
        toast({
          title: "Error",
          description: "No address available for verification",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(prev => prev + 1);
      return;
    }

    // If we're on the final step (insurance quote), handle submission
    if (currentStep === totalSteps) {
      handleSubmit();
      return;
    }

    // For additional parties question page
    if (currentStep === 4) {
      if (!formData.hasAdditionalParties) {
        toast({
          title: "Error",
          description: "Please select whether there are additional parties",
          variant: "destructive",
        });
        return;
      }

      if (formData.hasAdditionalParties === 'yes') {
        setCurrentStep(5); // Go to first additional party
      } else {
        setCurrentStep(totalSteps - 2); // Skip to property management page
      }
      return;
    }

    // If we're on an additional party page
    if (currentStep > 4 && currentStep < totalSteps - 2) {
      const currentPartyIndex = currentStep - 5;
      
      // Validate current party's required fields
      const currentParty = formData.additionalParties[currentPartyIndex];
      if (!currentParty.name || !currentParty.email || !currentParty.phone || 
          !currentParty.dateOfBirth || !currentParty.ssn || !currentParty.maritalStatus) {
        toast({
          title: "Error",
          description: "Please fill in all required fields for the additional party",
          variant: "destructive",
        });
        return;
      }

      // If there are more parties to add
      if (currentPartyIndex < formData.additionalParties.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // If no more parties needed, go to property management
        setCurrentStep(totalSteps - 2);
      }
      return;
    }

    // For property management page
    if (currentStep === totalSteps - 2) {
      setCurrentStep(totalSteps - 1); // Go to insurance quote
      return;
    }

    // For all other steps (1, 2, 3)
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Prepare the data for submission
      const submissionData = {
        titleFileNumber: formData.titleFileNumber,
        propertyInformation: {
          address: formData.systemAddress,
          roleInTransaction: formData.roleInTransaction
        },
        personalInformation: {
          fullName: formData.fullName,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          ssn: formData.ssn,
          maritalStatus: formData.maritalStatus
        },
        additionalParties: formData.hasAdditionalParties === 'yes' ? formData.additionalParties : [],
        services: {
          interestedInPropertyManagement: formData.interestedInPropertyManagement === 'yes',
          interestedInInsuranceQuote: formData.interestedInInsuranceQuote === 'yes'
        }
      };

      console.log('Sending final submission:', submissionData);

      const response = await fetch('https://hook.us2.make.com/cyfieepev3dizzls4cmkty4nj0nyw9tk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your information has been submitted successfully.",
      });

      // Reset form to initial state
      setFormData({
        titleFileNumber: '',
        roleInTransaction: '',
        fullName: '',
        email: '',
        systemAddress: '',
        dateOfBirth: '',
        ssn: '',
        maritalStatus: '',
        hasAdditionalParties: '',
        additionalParties: [],
        interestedInPropertyManagement: '',
        interestedInInsuranceQuote: ''
      });

      // Return to first step
      setCurrentStep(1);
      setIsSubmitting(false);

    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const addNewAdditionalParty = () => {
    setFormData(prev => ({
      ...prev,
      additionalParties: [
        ...prev.additionalParties,
        {
          name: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          ssn: '',
          maritalStatus: ''
        }
      ]
    }));
  };

  const renderAdditionalPartyForm = (index: number) => {
    const partyNumber = index + 1;
    return (
      <FormStep
        title={`Additional Party #${partyNumber}`}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onPrevious={handlePrevious}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`party${partyNumber}Name`}>Additional Party #{partyNumber} Name</Label>
            <Input
              id={`party${partyNumber}Name`}
              value={formData.additionalParties[index]?.name || ''}
              onChange={(e) => handleAdditionalPartyChange(index, 'name', e.target.value)}
              placeholder="Enter full name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`party${partyNumber}Phone`}>Additional Party #{partyNumber} Phone</Label>
            <Input
              id={`party${partyNumber}Phone`}
              value={formData.additionalParties[index]?.phone || ''}
              onChange={(e) => handleAdditionalPartyChange(index, 'phone', e.target.value)}
              placeholder="Enter phone number"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`party${partyNumber}Email`}>Additional Party #{partyNumber} Email</Label>
            <Input
              id={`party${partyNumber}Email`}
              type="email"
              value={formData.additionalParties[index]?.email || ''}
              onChange={(e) => handleAdditionalPartyChange(index, 'email', e.target.value)}
              placeholder="Enter email address"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`party${partyNumber}DOB`}>Additional Party #{partyNumber} DOB</Label>
            <Input
              id={`party${partyNumber}DOB`}
              type="date"
              value={formData.additionalParties[index]?.dateOfBirth || ''}
              onChange={(e) => handleAdditionalPartyChange(index, 'dateOfBirth', e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`party${partyNumber}SSN`}>Additional Party #{partyNumber} SSN</Label>
            <Input
              id={`party${partyNumber}SSN`}
              type="password"
              value={formData.additionalParties[index]?.ssn || ''}
              onChange={(e) => handleAdditionalPartyChange(index, 'ssn', e.target.value)}
              placeholder="Enter SSN"
              className="w-full"
              required
              maxLength={9}
              pattern="\d{9}"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`party${partyNumber}MaritalStatus`}>Additional Party #{partyNumber} Marital Status</Label>
            <Select 
              onValueChange={(value) => handleAdditionalPartyChange(index, 'maritalStatus', value)} 
              value={formData.additionalParties[index]?.maritalStatus || ''}
            >
              <SelectTrigger className="w-full">
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

          {partyNumber < 4 && (
            <div className="space-y-2">
              <Label htmlFor="moreParties">Is there an additional party?</Label>
              <Select 
                onValueChange={(value) => {
                  if (value === 'yes' && formData.additionalParties.length < 3) {
                    addNewAdditionalParty();
                  }
                  handleSelectChange(value, 'hasAdditionalParties');
                }} 
                value={formData.hasAdditionalParties}
              >
                <SelectTrigger className="w-full" disabled={formData.additionalParties.length >= 3}>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </FormStep>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStep
            title="Title File Number"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titleFileNumber">Title File Number</Label>
                <Input
                  id="titleFileNumber"
                  name="titleFileNumber"
                  value={formData.titleFileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your title file number"
                  className="w-full"
                  required
                />
              </div>
            </div>
          </FormStep>
        );
      case 2:
        return (
          <FormStep
            title="Address Verification"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={handlePrevious}
            hideNextButton
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Is this the correct property address?</Label>
                <div className="text-lg font-medium mb-4">
                  {formData.systemAddress}
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    variant="default"
                    className="flex-1"
                  >
                    Yes, this is correct
                  </Button>
                  <Button 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        titleFileNumber: '',
                        systemAddress: ''
                      }));
                      setCurrentStep(prev => prev - 1);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    No, go back
                  </Button>
                </div>
              </div>
            </div>
          </FormStep>
        );
      case 3:
        return (
          <FormStep
            title="Transaction Information"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleInTransaction">Role in Transaction</Label>
                <Select onValueChange={(value) => handleSelectChange(value, 'roleInTransaction')} value={formData.roleInTransaction}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormStep>
        );
      case 4:
        return (
          <FormStep
            title="Personal Information"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ssn">SSN</Label>
                <Input
                  id="ssn"
                  name="ssn"
                  type="password"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  placeholder="Enter your SSN"
                  className="w-full"
                  required
                  maxLength={9}
                  pattern="\d{9}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select onValueChange={(value) => handleSelectChange(value, 'maritalStatus')} value={formData.maritalStatus}>
                  <SelectTrigger className="w-full">
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
            </div>
          </FormStep>
        );
      case 5:
        return (
          <FormStep
            title="Additional Parties"
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hasAdditionalParties">
                  Are there additional parties as {formData.roleInTransaction}?
                </Label>
                <Select 
                  onValueChange={(value) => {
                    if (value === 'yes') {
                      addNewAdditionalParty();
                    }
                    handleSelectChange(value, 'hasAdditionalParties');
                  }} 
                  value={formData.hasAdditionalParties}
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
        );
      default:
        if (currentStep > 5 && currentStep < totalSteps - 2) {
          return renderAdditionalPartyForm(currentStep - 6);
        } else if (currentStep === totalSteps - 2) {
          return (
            <FormStep
              title="Property Management"
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="interestedInPropertyManagement">Would you be interested in our property management services?</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'interestedInPropertyManagement')} 
                    value={formData.interestedInPropertyManagement}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormStep>
          );
        } else if (currentStep === totalSteps - 1) {
          return (
            <FormStep
              title="Insurance Quote"
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleSubmit}
              onPrevious={handlePrevious}
              submitButton
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="interestedInInsuranceQuote">Would you like a quote for insurance?</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'interestedInInsuranceQuote')} 
                    value={formData.interestedInInsuranceQuote}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormStep>
          );
        }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-2xl">
        <img 
          src="/lovable-uploads/b5f84e95-837e-4ccc-ace0-b9ff6ad926ec.png" 
          alt="Prosperity Abstract Logo" 
          className="w-full max-w-md mx-auto mb-12"
        />
        
        <p className="text-center text-lg text-blue-700 font-light mb-12 leading-relaxed">
          Welcome to Prosperity Abstract's secure web page. The information submitted here will be encrypted and stored in our systems with care.
        </p>

        <div className="form-container">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default DataCollectionForm;
