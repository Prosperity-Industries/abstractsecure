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
import { formatSSN, validateSSN } from '@/utils/validation';
import { Button } from "@/components/ui/button";
import { uploadToGoogleDrive, initializeGoogleAuth } from '@/utils/googleDrive';
import type { PhotoUploadResult } from '@/types';

interface AdditionalParty {
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  ssn: string;
  maritalStatus: string;
  hasMoreParties: string;
  photoId?: File;
  photoIdUrl?: string;
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
  interestedInPropertyManagement: string;
  interestedInInsuranceQuote: string;
  hasAdditionalParties: string;
  isRefi?: boolean;
  photoId?: File;
  photoIdUrl?: string;
}

// Marital status constants
const MARITAL_STATUS = {
  SINGLE: { value: 'single', id: 1 },
  MARRIED: { value: 'married', id: 2 },
  WIDOWED: { value: 'widowed', id: 3 },
  DIVORCED: { value: 'divorced', id: 4 }
} as const;

const DataCollectionForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState('');
  // Always start at step 0 (title order number)
  const [currentStep, setCurrentStep] = useState(0);

  // Clear any existing stored data on component mount
  useEffect(() => {
    localStorage.removeItem('formData');
    localStorage.removeItem('roleInTransaction');
  }, []);

  const [formData, setFormData] = useState<FormData>(() => {
    // Start with empty values
    return {
      titleOrderNumber: '',
      titleFileNumber: '',
      fullName: '',
      propertyAddress: '',
      dateOfBirth: '',
      ssn: '',
      maritalStatus: '',
      roleInTransaction: '',
      interestedInPropertyManagement: '',
      interestedInInsuranceQuote: '',
      hasAdditionalParties: '',
      isRefi: undefined,
      photoId: undefined,
      photoIdUrl: undefined
    };
  });

  const [addressConfirmation, setAddressConfirmation] = useState<'yes' | 'no' | null>(null);

  const [additionalParties, setAdditionalParties] = useState<AdditionalParty[]>([]);
  const [currentPartyIndex, setCurrentPartyIndex] = useState(0);
  const [additionalParty, setAdditionalParty] = useState<AdditionalParty>({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    ssn: '',
    maritalStatus: '',
    hasMoreParties: '',
    photoId: undefined,
    photoIdUrl: undefined
  });

  const MAX_ADDITIONAL_PARTIES = 4;

  const [photoIdPreview, setPhotoIdPreview] = useState<string>('');
  const fileInputRef = React.createRef<HTMLInputElement>();
  const additionalPartyFileInputRef = React.createRef<HTMLInputElement>();

  useEffect(() => {
    // Save form state to browser history
    const saveStateToHistory = () => {
      const state = {
        formData,
        currentStep,
        role,
        addressConfirmation,
        additionalParties,
        currentPartyIndex,
        additionalParty
      };
      window.history.replaceState(state, '');
    };

    // Save state whenever it changes
    saveStateToHistory();

    // Handle popstate (browser back/forward)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setFormData(event.state.formData);
        setCurrentStep(event.state.currentStep);
        setRole(event.state.role);
        setAddressConfirmation(event.state.addressConfirmation);
        setAdditionalParties(event.state.additionalParties);
        setCurrentPartyIndex(event.state.currentPartyIndex);
        setAdditionalParty(event.state.additionalParty);
        
        // Also update localStorage to keep it in sync
        localStorage.setItem('formData', JSON.stringify(event.state.formData));
        if (event.state.role) {
          localStorage.setItem('roleInTransaction', event.state.role);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [formData, currentStep, role, addressConfirmation, additionalParties, currentPartyIndex, additionalParty]);

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

  useEffect(() => {
    // Initialize Google Auth when component mounts
    initializeGoogleAuth().catch(error => {
      console.error('Error initializing Google Auth:', error);
      toast({
        title: "Error",
        description: "Failed to initialize Google Drive integration. Some features may not work.",
        variant: "destructive",
      });
    });
  }, []);

  const totalSteps = 8;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    try {
      // Format SSN if this is an SSN field
      if (name === 'ssn') {
        // Only attempt to format if we have enough digits
        const numbers = value.replace(/\D/g, '');
        if (numbers.length === 9) {
          const formattedSSN = formatSSN(value);
          setFormData(prev => ({ ...prev, [name]: formattedSSN }));
          return;
        }
      }
      
      // For all other fields or incomplete SSN
      setFormData(prev => ({ ...prev, [name]: value }));
    } catch (error) {
      // If SSN formatting fails, just set the raw value
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (field: keyof FormData, value: string) => {
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
        
        // Save to localStorage before proceeding
        localStorage.setItem('formData', JSON.stringify({
          ...formData,
          titleFileNumber: formData.titleFileNumber
        }));

        const response = await fetch('https://hook.us2.make.com/kwq1swnwft87fv4fxclyxbq2x5wcu5pt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title_file: formData.titleFileNumber.trim()
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Webhook response:', data); // Add logging to see response structure
        
        // Update form data with the received property address
        // Using property_address to match snake_case convention
        const updatedFormData = {
          ...formData,
          propertyAddress: (data as { property_address?: string; Title?: string }).property_address || data.Title || '',
        };
        
        setFormData(updatedFormData);
        // Save the updated form data including property address
        localStorage.setItem('formData', JSON.stringify(updatedFormData));
        
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch property information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate property address before proceeding from address confirmation
    if (currentStep === 1) {
      if (!formData.propertyAddress) {
        toast({
          title: "Error",
          description: "Property address is missing. Please go back and try again.",
          variant: "destructive",
        });
        return;
      }
      if (!addressConfirmation) {
        toast({
          title: "Error",
          description: "Please confirm if the address is correct",
          variant: "destructive",
        });
        return;
      }
      if (addressConfirmation === 'no') {
        toast({
          title: "Error",
          description: "Please contact support to correct the property address",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate transaction role before proceeding
    if (currentStep === 2) {
      if (!formData.roleInTransaction) {
        toast({
          title: "Error",
          description: "Please select your role in the transaction",
          variant: "destructive",
        });
        return;
      }
    }

    // Check for additional party selection
    if (currentStep === 4) {
      if (!formData.hasAdditionalParties) {
        toast({
          title: "Error",
          description: "Please select whether there are additional parties",
          variant: "destructive",
        });
        return;
      }
      
      // If they selected no, skip the additional party form
      if (formData.hasAdditionalParties === 'no') {
        setCurrentStep(prev => prev + 2); // Skip to property management
        return;
      }
    }

    // Check for additional party form validation
    if (currentStep === 5 && formData.hasAdditionalParties === 'yes') {
      if (!additionalParty.name) {
        toast({
          title: "Error",
          description: "Please enter the additional party's name",
          variant: "destructive",
        });
        return;
      }
      // Store additional party data in localStorage
      localStorage.setItem('additionalParty', JSON.stringify(additionalParty));
    }

    // For other steps, just proceed
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    // Validate required fields
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const resetForm = () => {
    // Clear form data
    const emptyForm = {
      titleOrderNumber: '',
      titleFileNumber: '',
      fullName: '',
      propertyAddress: '',
      dateOfBirth: '',
      ssn: '',
      maritalStatus: '',
      roleInTransaction: '',
      interestedInPropertyManagement: '',
      interestedInInsuranceQuote: '',
      hasAdditionalParties: '',
      isRefi: undefined,
      photoId: undefined,
      photoIdUrl: undefined
    };
    
    setFormData(emptyForm);
    setCurrentStep(0);
    setAddressConfirmation(null);
    setRole('');
    setAdditionalParties([]);
    setCurrentPartyIndex(0);
    setAdditionalParty({
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      ssn: '',
      maritalStatus: '',
      hasMoreParties: '',
      photoId: undefined,
      photoIdUrl: undefined
    });
    
    // Clear localStorage
    localStorage.removeItem('formData');
    localStorage.removeItem('roleInTransaction');
  };

  const handleNextUpdated = async () => {
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
        
        // Save to localStorage before proceeding
        localStorage.setItem('formData', JSON.stringify({
          ...formData,
          titleFileNumber: formData.titleFileNumber
        }));

        const response = await fetch('https://hook.us2.make.com/kwq1swnwft87fv4fxclyxbq2x5wcu5pt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title_file: formData.titleFileNumber.trim()
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log('Webhook response:', data); // Add logging to see response structure
        
        // Update form data with the received property address
        // Using property_address to match snake_case convention
        const updatedFormData = {
          ...formData,
          propertyAddress: (data as { property_address?: string; Title?: string }).property_address || data.Title || '',
        };
        
        setFormData(updatedFormData);
        // Save the updated form data including property address
        localStorage.setItem('formData', JSON.stringify(updatedFormData));
        
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch property information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Validate property address before proceeding from address confirmation
    if (currentStep === 1) {
      if (!formData.propertyAddress) {
        toast({
          title: "Error",
          description: "Property address is missing. Please go back and try again.",
          variant: "destructive",
        });
        return;
      }
      if (!addressConfirmation) {
        toast({
          title: "Error",
          description: "Please confirm if the address is correct",
          variant: "destructive",
        });
        return;
      }
      if (addressConfirmation === 'no') {
        toast({
          title: "Error",
          description: "Please contact support to correct the property address",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate transaction role before proceeding
    if (currentStep === 2) {
      if (!formData.roleInTransaction) {
        toast({
          title: "Error",
          description: "Please select your role in the transaction",
          variant: "destructive",
        });
        return;
      }
    }

    // Check for additional party selection
    if (currentStep === 4) {
      if (!formData.hasAdditionalParties) {
        toast({
          title: "Error",
          description: "Please select whether there are additional parties",
          variant: "destructive",
        });
        return;
      }
      
      // If they selected no, skip the additional party form
      if (formData.hasAdditionalParties === 'no') {
        setCurrentStep(prev => prev + 2); // Skip to property management
        return;
      }
    }

    // Check for additional party form validation
    if (currentStep === 5 && formData.hasAdditionalParties === 'yes') {
      if (!additionalParty.name) {
        toast({
          title: "Error",
          description: "Please enter the additional party's name",
          variant: "destructive",
        });
        return;
      }

      // Store the current additional party data
      const updatedParties = [...additionalParties];
      if (currentPartyIndex < updatedParties.length) {
        updatedParties[currentPartyIndex] = additionalParty;
      } else {
        updatedParties.push(additionalParty);
      }
      setAdditionalParties(updatedParties);

      // If this is the last additional party, move to property management
      if (getCurrentPartyNumber() === MAX_ADDITIONAL_PARTIES) {
        setCurrentStep(prev => prev + 1);
        return;
      }

      // Check if there are more parties to add
      if (additionalParty.hasMoreParties === 'yes') {
        // Reset the form for the next party
        setCurrentPartyIndex(prev => prev + 1);
        setAdditionalParty({
          name: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          ssn: '',
          maritalStatus: '',
          hasMoreParties: '',
          photoId: undefined,
          photoIdUrl: undefined
        });
        return; // Stay on the same step but with clean form
      } else {
        // No more parties, move to property management
        setCurrentStep(prev => prev + 1);
        return;
      }
    }

    // For final submission (insurance quote step)
    if (currentStep === 7) {
      if (!formData.interestedInInsuranceQuote) {
        toast({
          title: "Error",
          description: "Please select whether you would like an insurance quote",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsSubmitting(true);
        console.log('Submitting final form data:', formData); // Debug log

        // Helper function to format date from yyyy-mm-dd to dd/mm/yyyy
        const formatDateForWebhook = (dateString: string): string => {
          if (!dateString) return '';
          const [year, month, day] = dateString.split('-');
          return `${day}/${month}/${year}`;
        };

        // Helper function to convert marital status to integer
        const getMaritalStatusValue = (status: string): number => {
          const statusMap = {
            [MARITAL_STATUS.SINGLE.value]: MARITAL_STATUS.SINGLE.id,
            [MARITAL_STATUS.MARRIED.value]: MARITAL_STATUS.MARRIED.id,
            [MARITAL_STATUS.WIDOWED.value]: MARITAL_STATUS.WIDOWED.id,
            [MARITAL_STATUS.DIVORCED.value]: MARITAL_STATUS.DIVORCED.id
          };
          return (statusMap as Record<string, number>)[status.toLowerCase()] || MARITAL_STATUS.SINGLE.id;
        };

        // Make final submission API call to webhook2
        const webhookData = {
          "title_file": formData.titleFileNumber,
          "property_address": formData.propertyAddress,
          "full_name": formData.fullName,
          "date_of_birth": formatDateForWebhook(formData.dateOfBirth),
          "ssn": formData.ssn,
          "marital-status": getMaritalStatusValue(formData.maritalStatus),
          "role_in_transaction": formData.roleInTransaction,
          "has_additional_parties": formData.hasAdditionalParties === 'yes',
          "interested_in_property_management": formData.interestedInPropertyManagement === 'yes',
          "interested_in_insurance_quote": formData.interestedInInsuranceQuote === 'yes',
          "address_confirmation": addressConfirmation,
          "photo_id_url": formData.photoIdUrl || ''
        };

        // Add additional parties if they exist
        if (formData.hasAdditionalParties === 'yes' && additionalParties.length > 0) {
          const additionalPartiesData = additionalParties.reduce((acc, party, index) => ({
            ...acc,
            [`additional_party${index + 1}`]: {
              "full_name": party.name,
              "phone": party.phone,
              "email": party.email,
              "date_of_birth": formatDateForWebhook(party.dateOfBirth),
              "ssn": party.ssn,
              "marital-status": getMaritalStatusValue(party.maritalStatus),
              "photo_id_url": party.photoIdUrl || ''
            }
          }), {});

          webhookData.additional_parties = additionalPartiesData;
        }

        const response = await fetch('https://hook.us2.make.com/xohysh3bqv211obzpo3uo3kb4bkjgtws', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }

        const responseData = await response.json();
        console.log('Webhook2 response:', responseData); // Debug log

        if (responseData.status === 'success') {
          // Show success message from webhook
          toast({
            title: "Success",
            description: responseData.message || "Your information has been submitted successfully!",
            duration: 5000, // Show for 5 seconds to ensure user sees it
          });

          // Wait for 2 seconds to ensure user sees the success message
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Reset the form and return to beginning
          resetForm();
        } else {
          throw new Error('Submission was not successful');
        }
        
      } catch (error) {
        console.error('Submission error:', error); // Debug log
        toast({
          title: "Error",
          description: "Failed to submit form. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    // For other steps, just proceed
    setCurrentStep(prev => prev + 1);
  };

  const getCurrentPartyNumber = () => currentPartyIndex + 1;

  const isLastAdditionalParty = () => getCurrentPartyNumber() === MAX_ADDITIONAL_PARTIES;

  const handlePhotoIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Create preview
        const preview = URL.createObjectURL(file);
        setPhotoIdPreview(preview);
        
        // Update form data with file
        setFormData(prev => ({ ...prev, photoId: file }));

        // Upload to Google Drive
        const fileName = `${formData.fullName.replace(/\s+/g, '_')}_ID${file.name.substring(file.name.lastIndexOf('.'))}`;
        const url = await uploadToGoogleDrive(file, fileName);
        
        // Update form data with URL
        setFormData(prev => ({ ...prev, photoIdUrl: url }));
        
        toast({
          title: "Photo ID Uploaded",
          description: "Your photo ID has been successfully uploaded to Google Drive.",
        });
      } catch (error) {
        console.error('Error uploading photo ID:', error);
        toast({
          title: "Upload Error",
          description: "Failed to upload photo ID. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdditionalPartyPhotoIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Update additional party data with file
        setAdditionalParty(prev => ({ ...prev, photoId: file }));

        // Upload to Google Drive
        const fileName = `${additionalParty.name.replace(/\s+/g, '_')}_ID${file.name.substring(file.name.lastIndexOf('.'))}`;
        const url = await uploadToGoogleDrive(file, fileName);
        
        // Update additional party data with URL
        setAdditionalParty(prev => ({ ...prev, photoIdUrl: url }));
        
        toast({
          title: "Photo ID Uploaded",
          description: "The additional party's photo ID has been successfully uploaded to Google Drive.",
        });
      } catch (error) {
        console.error('Error uploading additional party photo ID:', error);
        toast({
          title: "Upload Error",
          description: "Failed to upload photo ID. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const triggerFileInput = (isAdditionalParty: boolean = false) => {
    if (isAdditionalParty) {
      additionalPartyFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    return () => {
      if (photoIdPreview) {
        URL.revokeObjectURL(photoIdPreview);
      }
    };
  }, [photoIdPreview]);

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
            onNext={handleNextUpdated}
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
            onNext={handleNextUpdated}
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
            title="Transaction Information"
            currentStep={3}
            totalSteps={totalSteps}
            onNext={handleNextUpdated}
            onPrevious={handlePrevious}
            nextButtonText="Next"
          >
            <div className="space-y-4 mb-20">
              <div>
                <Label htmlFor="roleInTransaction">What is your role in this transaction? <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.roleInTransaction}
                  onValueChange={(value) => handleSelectChange('roleInTransaction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-md p-2 rounded-md">
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormStep>
        )}

        {currentStep === 3 && (
          <FormStep
            title="Personal Information"
            currentStep={4}
            totalSteps={totalSteps}
            onNext={handleNextUpdated}
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
                  type="text"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  placeholder="Enter your SSN (XXX-XX-XXXX)"
                />
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) => handleSelectChange('maritalStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-md p-2 rounded-md">
                    <SelectItem value={MARITAL_STATUS.SINGLE.value}>Single</SelectItem>
                    <SelectItem value={MARITAL_STATUS.MARRIED.value}>Married</SelectItem>
                    <SelectItem value={MARITAL_STATUS.DIVORCED.value}>Divorced</SelectItem>
                    <SelectItem value={MARITAL_STATUS.WIDOWED.value}>Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photo ID Upload Section */}
              <div className="space-y-2">
                <Label>Photo ID</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoIdUpload}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => triggerFileInput(false)}
                    className="w-full"
                  >
                    Upload Photo ID
                  </Button>
                  {photoIdPreview && (
                    <div className="relative mt-2">
                      <img
                        src={photoIdPreview}
                        alt="ID Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPhotoIdPreview('');
                          setFormData(prev => ({ ...prev, photoId: undefined }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FormStep>
        )}
        
        {currentStep === 4 && (
          <FormStep
            title="Additional Parties"
            currentStep={5}
            totalSteps={totalSteps}
            onNext={handleNextUpdated}
            onPrevious={handlePrevious}
            nextButtonText="Next"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Are there any additional parties involved in this transaction? <span className="text-red-500">*</span></h3>
                <RadioGroup 
                  value={formData.hasAdditionalParties || ''} 
                  onValueChange={(value) => handleSelectChange('hasAdditionalParties', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="hasAdditionalYes" />
                    <Label htmlFor="hasAdditionalYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="hasAdditionalNo" />
                    <Label htmlFor="hasAdditionalNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </FormStep>
        )}

        {currentStep === 5 && formData.hasAdditionalParties === 'yes' && (
          <FormStep
            title={`Additional Party #${getCurrentPartyNumber()}`}
            currentStep={6}
            totalSteps={totalSteps}
            onNext={handleNextUpdated}
            onPrevious={handlePrevious}
            nextButtonText="Next"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="additionalPartyName">Full Name</Label>
                <Input
                  id="additionalPartyName"
                  name="name"
                  value={additionalParty.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAdditionalParty(prev => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="additionalPartyPhone">Phone Number</Label>
                <Input
                  id="additionalPartyPhone"
                  name="phone"
                  value={additionalParty.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAdditionalParty(prev => ({ ...prev, phone: e.target.value }));
                  }}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="additionalPartyEmail">Email</Label>
                <Input
                  id="additionalPartyEmail"
                  name="email"
                  type="email"
                  value={additionalParty.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAdditionalParty(prev => ({ ...prev, email: e.target.value }));
                  }}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="additionalPartyDOB">Date of Birth</Label>
                <Input
                  id="additionalPartyDOB"
                  name="dateOfBirth"
                  type="date"
                  value={additionalParty.dateOfBirth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAdditionalParty(prev => ({ ...prev, dateOfBirth: e.target.value }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="additionalPartySSN">Social Security Number</Label>
                <Input
                  id="additionalPartySSN"
                  name="ssn"
                  type="text"
                  maxLength={11}
                  value={additionalParty.ssn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    try {
                      const input = e.target.value.replace(/[^\d-]/g, '');
                      const formattedSSN = formatSSN(input.replace(/-/g, ''));
                      setAdditionalParty(prev => ({ ...prev, ssn: formattedSSN }));
                    } catch (error) {
                      const cleanInput = e.target.value.replace(/[^\d-]/g, '');
                      setAdditionalParty(prev => ({ ...prev, ssn: cleanInput }));
                    }
                  }}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.value && !validateSSN(e.target.value)) {
                      toast({
                        title: "Invalid SSN",
                        description: "Please enter a valid 9-digit Social Security Number",
                        variant: "destructive",
                      });
                    }
                  }}
                  placeholder="Enter SSN (XXX-XX-XXXX)"
                />
              </div>
              <div>
                <Label htmlFor="additionalPartyMaritalStatus">Marital Status</Label>
                <Select
                  value={additionalParty.maritalStatus}
                  onValueChange={(value) => {
                    setAdditionalParty(prev => ({ ...prev, maritalStatus: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-md p-2 rounded-md">
                    <SelectItem value={MARITAL_STATUS.SINGLE.value}>Single</SelectItem>
                    <SelectItem value={MARITAL_STATUS.MARRIED.value}>Married</SelectItem>
                    <SelectItem value={MARITAL_STATUS.DIVORCED.value}>Divorced</SelectItem>
                    <SelectItem value={MARITAL_STATUS.WIDOWED.value}>Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Additional Party Photo ID Upload Section */}
              <div className="space-y-2">
                <Label>Photo ID</Label>
                <input
                  type="file"
                  ref={additionalPartyFileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleAdditionalPartyPhotoIdUpload}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => triggerFileInput(true)}
                    className="w-full"
                  >
                    Upload Photo ID
                  </Button>
                  {additionalParty.photoId && (
                    <div className="relative mt-2">
                      <img
                        src={URL.createObjectURL(additionalParty.photoId)}
                        alt="ID Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setAdditionalParty(prev => ({ ...prev, photoId: undefined }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {!isLastAdditionalParty() && (
                <div className="mt-8">
                  <Label htmlFor="hasMoreParties">Are there additional parties?</Label>
                  <Select
                    value={additionalParty.hasMoreParties || ''}
                    onValueChange={(value) => {
                      setAdditionalParty(prev => ({ ...prev, hasMoreParties: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select yes or no" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-md p-2 rounded-md">
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </FormStep>
        )}

        {currentStep === 6 && (
          <FormStep
            title="Property Management"
            currentStep={7}
            totalSteps={totalSteps}
            onNext={handleNextUpdated}
            onPrevious={handlePrevious}
            nextButtonText="Next"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Would you like information about our property management services? <span className="text-red-500">*</span></h3>
                <RadioGroup 
                  value={formData.interestedInPropertyManagement || ''} 
                  onValueChange={(value) => handleSelectChange('interestedInPropertyManagement', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="propertyManagementYes" />
                    <Label htmlFor="propertyManagementYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="propertyManagementNo" />
                    <Label htmlFor="propertyManagementNo">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </FormStep>
        )}

        {currentStep === 7 && (
          <FormStep
            title="Insurance Quote"
            currentStep={8}
            totalSteps={totalSteps}
            onNext={handleNextUpdated}
            onPrevious={handlePrevious}
            nextButtonText="Submit"
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Would you like a quote for homeowner's insurance? <span className="text-red-500">*</span></h3>
                <RadioGroup 
                  value={formData.interestedInInsuranceQuote || ''} 
                  onValueChange={(value) => handleSelectChange('interestedInInsuranceQuote', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="insuranceYes" />
                    <Label htmlFor="insuranceYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="insuranceNo" />
                    <Label htmlFor="insuranceNo">No</Label>
                  </div>
                </RadioGroup>
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
