import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormStep from './FormStep';
import { useToast } from "@/components/ui/use-toast";
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
      fullName: '',
      propertyAddress: '',
      dateOfBirth: '',
      ssn: '',
      maritalStatus: '',
      roleInTransaction: '',
      hasAdditionalParties: '',
      additionalParties: [],
      interestedInPropertyManagement: '',
      interestedInInsuranceQuote: ''
    };
  });

  const totalSteps = formData.hasAdditionalParties === 'yes' 
    ? 5 + formData.additionalParties.length
    : 5;

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

  const handleNext = () => {
    // If we're on the final step (insurance quote), handle submission
    if (currentStep === totalSteps) {
      handleSubmit();
      return;
    }

    // If we're on the initial additional party question (step 3)
    if (currentStep === 3) {
      if (formData.hasAdditionalParties === 'yes') {
        setCurrentStep(4); // Go to first additional party
      } else {
        setCurrentStep(totalSteps - 1); // Go to property management
      }
      return;
    }

    // If we're on an additional party page
    if (currentStep > 3 && currentStep < totalSteps - 1) {
      const currentPartyIndex = currentStep - 4;
      
      // Validate current party's required fields
      const currentParty = formData.additionalParties[currentPartyIndex];
      if (!currentParty?.name) {
        toast({
          title: "Required Field",
          description: "Please enter the additional party's name.",
          variant: "destructive"
        });
        return;
      }

      // If they want more parties and we haven't reached the max
      if (formData.hasAdditionalParties === 'yes' && currentPartyIndex < 3) {
        // Add a new party if we don't already have one for the next step
        if (!formData.additionalParties[currentPartyIndex + 1]) {
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
        }
        setCurrentStep(prev => prev + 1);
      } else {
        // If no more parties needed, go to property management
        setCurrentStep(totalSteps - 1);
      }
      return;
    }

    // For property management page
    if (currentStep === totalSteps - 1) {
      setCurrentStep(totalSteps); // Go to insurance quote
      return;
    }

    // For all other steps (1, 2)
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
        propertyInformation: {
          fullName: formData.fullName,
          propertyAddress: formData.propertyAddress,
          roleInTransaction: formData.roleInTransaction
        },
        personalInformation: {
          dateOfBirth: formData.dateOfBirth,
          ssn: formData.ssn,
          maritalStatus: formData.maritalStatus
        },
        additionalParties: formData.hasAdditionalParties === 'yes' 
          ? formData.additionalParties.map(party => ({
              name: party.name,
              phone: party.phone,
              email: party.email,
              dateOfBirth: party.dateOfBirth,
              ssn: party.ssn,
              maritalStatus: party.maritalStatus
            }))
          : [],
        services: {
          interestedInPropertyManagement: formData.interestedInPropertyManagement,
          interestedInInsuranceQuote: formData.interestedInInsuranceQuote
        },
        metadata: {
          submissionDate: new Date().toISOString(),
          formVersion: "1.0.0"
        }
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
        fullName: '',
        propertyAddress: '',
        dateOfBirth: '',
        ssn: '',
        maritalStatus: '',
        roleInTransaction: '',
        hasAdditionalParties: '',
        additionalParties: [],
        interestedInPropertyManagement: '',
        interestedInInsuranceQuote: ''
      });

      // Return to first step
      setCurrentStep(1);

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
          {currentStep === 1 && (
            <FormStep
              title="Property Information"
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
                  <Label htmlFor="propertyAddress">Address of Property Being Sold</Label>
                  <Input
                    id="propertyAddress"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    placeholder="Enter the property address"
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
          )}

          {currentStep === 2 && (
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
          )}

          {currentStep === 3 && (
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
          )}

          {currentStep > 3 && currentStep < totalSteps - 1 && (
            <FormStep
              title={`Additional Party #${currentStep - 3}`}
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.additionalParties[currentStep - 4]?.name || ''}
                    onChange={(e) => handleAdditionalPartyChange(currentStep - 4, 'name', e.target.value)}
                    placeholder="Enter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.additionalParties[currentStep - 4]?.phone || ''}
                    onChange={(e) => handleAdditionalPartyChange(currentStep - 4, 'phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.additionalParties[currentStep - 4]?.email || ''}
                    onChange={(e) => handleAdditionalPartyChange(currentStep - 4, 'email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-base">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    value={formData.additionalParties[currentStep - 4]?.dateOfBirth || ''}
                    onChange={(e) => handleAdditionalPartyChange(currentStep - 4, 'dateOfBirth', e.target.value)}
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ssn" className="text-base">
                    Social Security Number
                  </Label>
                  <Input
                    id="ssn"
                    value={formData.additionalParties[currentStep - 4]?.ssn || ''}
                    onChange={(e) => handleAdditionalPartyChange(currentStep - 4, 'ssn', e.target.value)}
                    placeholder="XXX-XX-XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus" className="text-base">
                    Marital Status
                  </Label>
                  <Select 
                    onValueChange={(value) => handleAdditionalPartyChange(currentStep - 4, 'maritalStatus', value)}
                    value={formData.additionalParties[currentStep - 4]?.maritalStatus || ''}
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

                {currentStep - 4 < 3 && (
                  <div className="space-y-2">
                    <Label htmlFor="hasAdditionalParties" className="text-base">
                      Would you like to add another party?
                    </Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange(value, 'hasAdditionalParties')}
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
                )}
              </div>
            </FormStep>
          )}

          {currentStep === totalSteps - 1 && (
            <FormStep
              title="Property Management Services"
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="interestedInPropertyManagement">
                    Are you interested in our property management services?
                  </Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'interestedInPropertyManagement')} 
                    value={formData.interestedInPropertyManagement}
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
          )}

          {currentStep === totalSteps && (
            <FormStep
              title="Insurance Quote"
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleNext}
              onPrevious={handlePrevious}
              nextButtonText="Submit"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="interestedInInsuranceQuote" className="text-base">
                    Prosperity National Insurance Agency is our sister company and provides highly competitive rates and coverages. Would you like a free, no obligation property insurance quote?
                  </Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange(value, 'interestedInInsuranceQuote')} 
                    value={formData.interestedInInsuranceQuote}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCollectionForm;
