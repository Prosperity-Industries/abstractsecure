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
}

const DataCollectionForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    propertyAddress: '',
    dateOfBirth: '',
    ssn: '',
    maritalStatus: '',
    roleInTransaction: '',
    hasAdditionalParties: '',
    additionalParties: [],
    interestedInPropertyManagement: '',
  });

  const totalSteps = formData.hasAdditionalParties === 'yes' 
    ? 4 + formData.additionalParties.length
    : 4;

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

  const handleAdditionalPartyInputChange = (index: number, field: keyof AdditionalParty, value: string) => {
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
      
      // If changing hasAdditionalParties to yes, add a new party if needed
      if (field === 'hasAdditionalParties' && value === 'yes' && prev.additionalParties.length < 4) {
        if (prev.additionalParties.length === 0 || 
            (prev.additionalParties.length > 0 && 
             prev.additionalParties[prev.additionalParties.length - 1].name !== '')) {
          newData.additionalParties = [
            ...prev.additionalParties,
            {
              name: '',
              phone: '',
              email: '',
              dateOfBirth: '',
              ssn: '',
              maritalStatus: ''
            }
          ];
        }
      }
      
      return newData;
    });
    
    localStorage.setItem('formData', JSON.stringify({
      ...formData,
      [field]: value
    }));
  };

  const handleAdditionalPartySelectChange = (index: number, value: string, field: keyof AdditionalParty) => {
    handleAdditionalPartyInputChange(index, field, value);
  };

  const handleNext = () => {
    // If we're on an additional party page
    if (currentStep > 3 && currentStep < totalSteps) {
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
      } 
      // If they don't want more parties or reached max, go to property management page
      else {
        setCurrentStep(totalSteps);
      }
    }
    // If we're on the final step (property management)
    else if (currentStep === totalSteps) {
      handleSubmit();
    }
    // For all other steps
    else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    toast({
      title: "Success!",
      description: "Your information has been submitted successfully.",
    });
    localStorage.removeItem('formData');
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
              onChange={(e) => handleAdditionalPartyInputChange(index, 'name', e.target.value)}
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
              onChange={(e) => handleAdditionalPartyInputChange(index, 'phone', e.target.value)}
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
              onChange={(e) => handleAdditionalPartyInputChange(index, 'email', e.target.value)}
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
              onChange={(e) => handleAdditionalPartyInputChange(index, 'dateOfBirth', e.target.value)}
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
              onChange={(e) => handleAdditionalPartyInputChange(index, 'ssn', e.target.value)}
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
              onValueChange={(value) => handleAdditionalPartySelectChange(index, value, 'maritalStatus')} 
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

          {currentStep > 3 && currentStep < totalSteps && formData.hasAdditionalParties === 'yes' && 
            renderAdditionalPartyForm(currentStep - 4)}

          {currentStep === totalSteps && (
            <FormStep
              title="Property Management Services"
              currentStep={currentStep}
              totalSteps={totalSteps}
              onNext={handleSubmit}
              onPrevious={handlePrevious}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyManagement">
                    Would you be interested in hearing about our property management services?
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
        </div>
      </div>
    </div>
  );
};

export default DataCollectionForm;
