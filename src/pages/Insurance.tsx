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
import { Button } from "@/components/ui/button";
import { validateWebhookPayload, formatSSN } from '@/utils/validation';

// Rate limiting configuration
const RATE_LIMIT_MS = 1000; // 1 second between submissions
let lastSubmissionTime = 0;

const Insurance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interestedInInsurance, setInterestedInInsurance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrevious = () => {
    navigate('/property-management');
  };

  const prepareWebhookData = (formData: any) => {
    // Format SSN for personal information and additional parties
    const formattedSSN = formData.ssn ? formatSSN(formData.ssn) : '';
    const formattedAdditionalParties = formData.additionalParties?.map((party: any) => ({
      ...party,
      ssn: party.ssn ? formatSSN(party.ssn) : ''
    })) || [];

    return {
      '1': {
        services: {
          insuranceQuote: interestedInInsurance === 'yes'
        },
        titleFileNumber: formData.titleFileNumber,
        additionalParties: formattedAdditionalParties,
        personalInformation: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          ssn: formattedSSN,
          maritalStatus: formData.maritalStatus,
          roleInTransaction: formData.roleInTransaction
        },
        propertyInformation: {
          address: formData.propertyAddress,
          titleOrderNumber: formData.titleOrderNumber
        }
      },
      submissionTimestamp: new Date().toISOString(),
      formType: 'insurance_quote'
    };
  };

  const submitToWebhook = async () => {
    if (interestedInInsurance === 'yes') {
      try {
        // Rate limiting check
        const now = Date.now();
        if (now - lastSubmissionTime < RATE_LIMIT_MS) {
          throw new Error('Please wait before submitting again');
        }
        lastSubmissionTime = now;

        setIsSubmitting(true);
        const webhookUrl = 'https://hook.us2.make.com/nhgztmrpk5hjrzy7kbzkqsxvgu7q86kn';
        
        // Get and parse form data
        const formData = localStorage.getItem('formData');
        const parsedFormData = formData ? JSON.parse(formData) : {};
        
        // Prepare webhook payload
        const webhookData = prepareWebhookData(parsedFormData);
        
        // Validate payload
        const validationErrors = validateWebhookPayload(webhookData);
        if (validationErrors.length > 0) {
          console.error('Validation errors:', validationErrors);
          throw new Error(validationErrors[0].message);
        }

        // Submit to webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }

        toast({
          title: "Success!",
          description: "Your insurance quote request has been submitted.",
          duration: 5000,
        });

        return true;
      } catch (error) {
        console.error('Webhook submission error:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to submit insurance quote request",
          variant: "destructive",
          duration: 5000,
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (interestedInInsurance === '') {
      toast({
        title: "Required Field",
        description: "Please select whether you're interested in an insurance quote",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const success = await submitToWebhook();
    if (success) {
      navigate('/review');
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-6">
              Insurance Quote
            </h1>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="interestedInInsurance" className="text-lg block text-center mb-4">
                  Would you like a free no obligation property insurance quote? We have highly competitive rates and top notch service.
                </Label>
                <Select
                  value={interestedInInsurance}
                  onValueChange={setInterestedInInsurance}
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

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
