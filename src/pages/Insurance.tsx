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

const Insurance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [interestedInInsurance, setInterestedInInsurance] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrevious = () => {
    navigate('/property-management');
  };

  const submitToWebhook = async () => {
    if (interestedInInsurance === 'yes') {
      try {
        const webhookUrl = 'https://hook.us2.make.com/nhgztmrpk5hjrzy7kbzkqsxvgu7q86kn';
        
        // Get all form data from localStorage
        const formData = localStorage.getItem('formData');
        const parsedFormData = formData ? JSON.parse(formData) : {};
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...parsedFormData,
            interestedInInsurance,
            submissionTimestamp: new Date().toISOString(),
            formType: 'insurance_quote'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit data to webhook');
        }

        return true;
      } catch (error) {
        console.error('Error submitting to webhook:', error);
        throw error;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!interestedInInsurance) {
      toast({
        title: "Error",
        description: "Please select yes or no",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save the choice to localStorage
      localStorage.setItem('interestedInInsurance', interestedInInsurance);

      // Submit to webhook if user is interested
      await submitToWebhook();

      // Show success message
      toast({
        title: "Success!",
        description: "Your information has been submitted successfully.",
        variant: "default",
      });

      // Navigate to completion or thank you page
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                >
                  Previous
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
