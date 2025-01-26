import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormStep from '@/components/FormStep';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const AdditionalPartyThree = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const role = localStorage.getItem('roleInTransaction') || '';
  const partyType = role === 'buyer' ? 'Buyer' : 'Seller';
  
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem('additionalParty3_fullName') || '',
    dateOfBirth: localStorage.getItem('additionalParty3_dateOfBirth') || '',
    ssn: localStorage.getItem('additionalParty3_ssn') || '',
    maritalStatus: localStorage.getItem('additionalParty3_maritalStatus') || '',
    hasMoreParties: localStorage.getItem('additionalParty3_hasMoreParties') || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    localStorage.setItem(`additionalParty3_${name}`, value);
  };

  const handleSelectChange = (value: string, field: 'maritalStatus' | 'hasMoreParties') => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    localStorage.setItem(`additionalParty3_${field}`, value);
  };

  const handlePrevious = () => {
    navigate('/additional-party-two');
  };

  const handleNext = () => {
    // Validate required fields
    if (!formData.fullName || !formData.dateOfBirth || !formData.ssn || !formData.maritalStatus || !formData.hasMoreParties) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Save all form data to localStorage
    Object.entries(formData).forEach(([key, value]) => {
      localStorage.setItem(`additionalParty3_${key}`, value);
    });

    // Navigate based on whether there are more parties
    if (formData.hasMoreParties === 'yes') {
      navigate('/additional-party-four');
    } else {
      navigate('/property-management'); // or whatever the next page should be
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

        <FormStep
          title={`Additional ${partyType} #3`}
          currentStep={3}
          totalSteps={4}
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
                placeholder="Enter full name"
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
              />
            </div>

            <div>
              <Label htmlFor="ssn">Social Security Number</Label>
              <Input
                id="ssn"
                name="ssn"
                type="password"
                value={formData.ssn}
                onChange={handleInputChange}
                placeholder="Enter SSN"
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

            <div className="pt-6 border-t">
              <Label htmlFor="hasMoreParties">{`Are there additional ${partyType}s?`}</Label>
              <Select
                value={formData.hasMoreParties}
                onValueChange={(value) => handleSelectChange(value, 'hasMoreParties')}
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
      </div>
    </div>
  );
};

export default AdditionalPartyThree;
