import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormStep from './FormStep';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatSSN, validateSSN } from '../../utils/validation';
import { Button } from "@/components/ui/button";
// import { uploadToGoogleDrive, initializeGoogleAuth } from '@/utils/googleDrive';
import { uploadToGoogleDrive } from '@/utils/googleDrive';
// Marital status constants
const MARITAL_STATUS = {
    SINGLE: { value: 'single', id: 1 },
    MARRIED: { value: 'married', id: 2 },
    WIDOWED: { value: 'widowed', id: 3 },
    DIVORCED: { value: 'divorced', id: 4 }
};
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
    const [formData, setFormData] = useState(() => {
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
    const [addressConfirmation, setAddressConfirmation] = useState(null);
    const [additionalParties, setAdditionalParties] = useState([]);
    const [currentPartyIndex, setCurrentPartyIndex] = useState(0);
    const [additionalParty, setAdditionalParty] = useState({
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
    const [photoIdPreview, setPhotoIdPreview] = useState('');
    const fileInputRef = React.createRef();
    const additionalPartyFileInputRef = React.createRef();
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
        const handlePopState = (event) => {
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
        initializeGoogleAuth().catch((error) => {
            console.error('Error initializing Google Auth:', error);
            toast({
                title: "Error",
                description: "Failed to initialize Google Drive integration. Some features may not work.",
                variant: "destructive",
            });
        });
    }, []);
    const totalSteps = 8;
    const handleInputChange = (e) => {
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
        }
        catch (error) {
            // If SSN formatting fails, just set the raw value
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    const handleSelectChange = (field, value) => {
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
        if (isSubmitting)
            return;
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
                    propertyAddress: data.property_address || data.Title || '',
                };
                setFormData(updatedFormData);
                // Save the updated form data including property address
                localStorage.setItem('formData', JSON.stringify(updatedFormData));
                setCurrentStep(prev => prev + 1);
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch property information. Please try again.",
                    variant: "destructive",
                });
            }
            finally {
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
        if (isSubmitting)
            return;
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
                    propertyAddress: data.property_address || data.Title || '',
                };
                setFormData(updatedFormData);
                // Save the updated form data including property address
                localStorage.setItem('formData', JSON.stringify(updatedFormData));
                setCurrentStep(prev => prev + 1);
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch property information. Please try again.",
                    variant: "destructive",
                });
            }
            finally {
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
            }
            else {
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
            }
            else {
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
                const formatDateForWebhook = (dateString) => {
                    if (!dateString)
                        return '';
                    const [year, month, day] = dateString.split('-');
                    return `${day}/${month}/${year}`;
                };
                // Helper function to convert marital status to integer
                const getMaritalStatusValue = (status) => {
                    const statusMap = {
                        [MARITAL_STATUS.SINGLE.value]: MARITAL_STATUS.SINGLE.id,
                        [MARITAL_STATUS.MARRIED.value]: MARITAL_STATUS.MARRIED.id,
                        [MARITAL_STATUS.WIDOWED.value]: MARITAL_STATUS.WIDOWED.id,
                        [MARITAL_STATUS.DIVORCED.value]: MARITAL_STATUS.DIVORCED.id
                    };
                    return statusMap[status.toLowerCase()] || MARITAL_STATUS.SINGLE.id;
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
                    console.log(typeof additionalPartiesData, additionalPartiesData);
                    webhookData.has_additional_parties = !!additionalPartiesData;
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
                }
                else {
                    throw new Error('Submission was not successful');
                }
            }
            catch (error) {
                console.error('Submission error:', error); // Debug log
                toast({
                    title: "Error",
                    description: "Failed to submit form. Please try again.",
                    variant: "destructive",
                });
            }
            finally {
                setIsSubmitting(false);
            }
            return;
        }
        // For other steps, just proceed
        setCurrentStep(prev => prev + 1);
    };
    const getCurrentPartyNumber = () => currentPartyIndex + 1;
    const isLastAdditionalParty = () => getCurrentPartyNumber() === MAX_ADDITIONAL_PARTIES;
    const handlePhotoIdUpload = async (event) => {
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
                const mimeType = "application/pdf";
                const filePath = URL.createObjectURL(file);
                const url = await uploadToGoogleDrive(filePath, fileName, mimeType);
                // Update form data with URL
                setFormData(prev => ({ ...prev, photoIdUrl: url }));
                toast({
                    title: "Photo ID Uploaded",
                    description: "Your photo ID has been successfully uploaded to Google Drive.",
                });
            }
            catch (error) {
                console.error('Error uploading photo ID:', error);
                toast({
                    title: "Upload Error",
                    description: "Failed to upload photo ID. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };
    const handleAdditionalPartyPhotoIdUpload = async (event) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Update additional party data with file
                setAdditionalParty(prev => ({ ...prev, photoId: file }));
                // Upload to Google Drive
                const fileName = `${additionalParty.name.replace(/\s+/g, '_')}_ID${file.name.substring(file.name.lastIndexOf('.'))}`;
                const mimeType = "application/pdf";
                const filePath = URL.createObjectURL(file);
                const url = await uploadToGoogleDrive(filePath, fileName, mimeType);
                // Update additional party data with URL
                setAdditionalParty(prev => ({ ...prev, photoIdUrl: url }));
                toast({
                    title: "Photo ID Uploaded",
                    description: "The additional party's photo ID has been successfully uploaded to Google Drive.",
                });
            }
            catch (error) {
                console.error('Error uploading additional party photo ID:', error);
                toast({
                    title: "Upload Error",
                    description: "Failed to upload photo ID. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };
    const triggerFileInput = (isAdditionalParty = false) => {
        if (isAdditionalParty) {
            additionalPartyFileInputRef.current?.click();
        }
        else {
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
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white", children: _jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("img", { src: "/lovable-uploads/b5f84e95-837e-4ccc-ace0-b9ff6ad926ec.png", alt: "Prosperity Abstract Logo", className: "w-64 mx-auto mb-8" }), currentStep === 0 && (_jsx(FormStep, { title: "Enter Title Order Number", currentStep: 1, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: () => { }, nextButtonText: isSubmitting ? "Loading..." : "Next", children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "titleFileNumber", children: "Title File Number" }), _jsx(Input, { id: "titleFileNumber", name: "titleFileNumber", value: formData.titleFileNumber, onChange: handleInputChange, placeholder: "Enter your title file number", disabled: isSubmitting })] }) }) })), currentStep === 1 && (_jsx(FormStep, { title: "Address Verification", currentStep: 2, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Property Address:" }), _jsx("p", { className: "text-lg bg-gray-100 p-4 rounded-md", children: formData.propertyAddress })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Is this the correct address for your transaction? ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(RadioGroup, { value: addressConfirmation || '', onValueChange: (value) => setAddressConfirmation(value), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "yes", id: "yes" }), _jsx(Label, { htmlFor: "yes", children: "Yes, this is correct" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "no", id: "no" }), _jsx(Label, { htmlFor: "no", children: "No, this is not correct" })] })] })] })] }) })), currentStep === 2 && (_jsx(FormStep, { title: "Transaction Information", currentStep: 3, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsx("div", { className: "space-y-4 mb-20", children: _jsxs("div", { children: [_jsxs(Label, { htmlFor: "roleInTransaction", children: ["What is your role in this transaction? ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(Select, { value: formData.roleInTransaction, onValueChange: (value) => handleSelectChange('roleInTransaction', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select your role" }) }), _jsxs(SelectContent, { className: "bg-white border shadow-md p-2 rounded-md", children: [_jsx(SelectItem, { value: "buyer", children: "Buyer" }), _jsx(SelectItem, { value: "seller", children: "Seller" })] })] })] }) }) })), currentStep === 3 && (_jsx(FormStep, { title: "Personal Information", currentStep: 4, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "fullName", children: "Full Name" }), _jsx(Input, { id: "fullName", name: "fullName", value: formData.fullName, onChange: handleInputChange, placeholder: "Enter your full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dateOfBirth", children: "Date of Birth" }), _jsx(Input, { id: "dateOfBirth", name: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: handleInputChange })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ssn", children: "Social Security Number" }), _jsx(Input, { id: "ssn", name: "ssn", type: "text", value: formData.ssn, onChange: handleInputChange, placeholder: "Enter your SSN (XXX-XX-XXXX)" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "maritalStatus", children: "Marital Status" }), _jsxs(Select, { value: formData.maritalStatus, onValueChange: (value) => handleSelectChange('maritalStatus', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select marital status" }) }), _jsxs(SelectContent, { className: "bg-white border shadow-md p-2 rounded-md", children: [_jsx(SelectItem, { value: MARITAL_STATUS.SINGLE.value, children: "Single" }), _jsx(SelectItem, { value: MARITAL_STATUS.MARRIED.value, children: "Married" }), _jsx(SelectItem, { value: MARITAL_STATUS.DIVORCED.value, children: "Divorced" }), _jsx(SelectItem, { value: MARITAL_STATUS.WIDOWED.value, children: "Widowed" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Photo ID" }), _jsx("input", { type: "file", ref: fileInputRef, accept: "image/*", capture: "environment", className: "hidden", onChange: handlePhotoIdUpload }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => triggerFileInput(false), className: "w-full", children: "Upload Photo ID" }), photoIdPreview && (_jsxs("div", { className: "relative mt-2", children: [_jsx("img", { src: photoIdPreview, alt: "ID Preview", className: "max-w-full h-auto rounded-lg" }), _jsx(Button, { type: "button", variant: "destructive", size: "sm", className: "absolute top-2 right-2", onClick: () => {
                                                            setPhotoIdPreview('');
                                                            setFormData(prev => ({ ...prev, photoId: undefined }));
                                                        }, children: "Remove" })] }))] })] })] }) })), currentStep === 4 && (_jsx(FormStep, { title: "Additional Parties", currentStep: 5, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Are there any additional parties involved in this transaction? ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(RadioGroup, { value: formData.hasAdditionalParties || '', onValueChange: (value) => handleSelectChange('hasAdditionalParties', value), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "yes", id: "hasAdditionalYes" }), _jsx(Label, { htmlFor: "hasAdditionalYes", children: "Yes" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "no", id: "hasAdditionalNo" }), _jsx(Label, { htmlFor: "hasAdditionalNo", children: "No" })] })] })] }) }) })), currentStep === 5 && formData.hasAdditionalParties === 'yes' && (_jsx(FormStep, { title: `Additional Party #${getCurrentPartyNumber()}`, currentStep: 6, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalPartyName", children: "Full Name" }), _jsx(Input, { id: "additionalPartyName", name: "name", value: additionalParty.name, onChange: (e) => {
                                            setAdditionalParty(prev => ({ ...prev, name: e.target.value }));
                                        }, placeholder: "Enter full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalPartyPhone", children: "Phone Number" }), _jsx(Input, { id: "additionalPartyPhone", name: "phone", value: additionalParty.phone, onChange: (e) => {
                                            setAdditionalParty(prev => ({ ...prev, phone: e.target.value }));
                                        }, placeholder: "Enter phone number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalPartyEmail", children: "Email" }), _jsx(Input, { id: "additionalPartyEmail", name: "email", type: "email", value: additionalParty.email, onChange: (e) => {
                                            setAdditionalParty(prev => ({ ...prev, email: e.target.value }));
                                        }, placeholder: "Enter email address" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalPartyDOB", children: "Date of Birth" }), _jsx(Input, { id: "additionalPartyDOB", name: "dateOfBirth", type: "date", value: additionalParty.dateOfBirth, onChange: (e) => {
                                            setAdditionalParty(prev => ({ ...prev, dateOfBirth: e.target.value }));
                                        } })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalPartySSN", children: "Social Security Number" }), _jsx(Input, { id: "additionalPartySSN", name: "ssn", type: "text", maxLength: 11, value: additionalParty.ssn, onChange: (e) => {
                                            try {
                                                const input = e.target.value.replace(/[^\d-]/g, '');
                                                const formattedSSN = formatSSN(input.replace(/-/g, ''));
                                                setAdditionalParty(prev => ({ ...prev, ssn: formattedSSN }));
                                            }
                                            catch (error) {
                                                const cleanInput = e.target.value.replace(/[^\d-]/g, '');
                                                setAdditionalParty(prev => ({ ...prev, ssn: cleanInput }));
                                            }
                                        }, onBlur: (e) => {
                                            if (e.target.value && !validateSSN(e.target.value)) {
                                                toast({
                                                    title: "Invalid SSN",
                                                    description: "Please enter a valid 9-digit Social Security Number",
                                                    variant: "destructive",
                                                });
                                            }
                                        }, placeholder: "Enter SSN (XXX-XX-XXXX)" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "additionalPartyMaritalStatus", children: "Marital Status" }), _jsxs(Select, { value: additionalParty.maritalStatus, onValueChange: (value) => {
                                            setAdditionalParty(prev => ({ ...prev, maritalStatus: value }));
                                        }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select marital status" }) }), _jsxs(SelectContent, { className: "bg-white border shadow-md p-2 rounded-md", children: [_jsx(SelectItem, { value: MARITAL_STATUS.SINGLE.value, children: "Single" }), _jsx(SelectItem, { value: MARITAL_STATUS.MARRIED.value, children: "Married" }), _jsx(SelectItem, { value: MARITAL_STATUS.DIVORCED.value, children: "Divorced" }), _jsx(SelectItem, { value: MARITAL_STATUS.WIDOWED.value, children: "Widowed" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Photo ID" }), _jsx("input", { type: "file", ref: additionalPartyFileInputRef, accept: "image/*", capture: "environment", className: "hidden", onChange: handleAdditionalPartyPhotoIdUpload }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => triggerFileInput(true), className: "w-full", children: "Upload Photo ID" }), additionalParty.photoId && (_jsxs("div", { className: "relative mt-2", children: [_jsx("img", { src: URL.createObjectURL(additionalParty.photoId), alt: "ID Preview", className: "max-w-full h-auto rounded-lg" }), _jsx(Button, { type: "button", variant: "destructive", size: "sm", className: "absolute top-2 right-2", onClick: () => {
                                                            setAdditionalParty(prev => ({ ...prev, photoId: undefined }));
                                                        }, children: "Remove" })] }))] })] }), !isLastAdditionalParty() && (_jsxs("div", { className: "mt-8", children: [_jsx(Label, { htmlFor: "hasMoreParties", children: "Are there additional parties?" }), _jsxs(Select, { value: additionalParty.hasMoreParties || '', onValueChange: (value) => {
                                            setAdditionalParty(prev => ({ ...prev, hasMoreParties: value }));
                                        }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select yes or no" }) }), _jsxs(SelectContent, { className: "bg-white border shadow-md p-2 rounded-md", children: [_jsx(SelectItem, { value: "yes", children: "Yes" }), _jsx(SelectItem, { value: "no", children: "No" })] })] })] }))] }) })), currentStep === 6 && (_jsx(FormStep, { title: "Property Management", currentStep: 7, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Would you like information about our property management services? ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(RadioGroup, { value: formData.interestedInPropertyManagement || '', onValueChange: (value) => handleSelectChange('interestedInPropertyManagement', value), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "yes", id: "propertyManagementYes" }), _jsx(Label, { htmlFor: "propertyManagementYes", children: "Yes" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "no", id: "propertyManagementNo" }), _jsx(Label, { htmlFor: "propertyManagementNo", children: "No" })] })] })] }) }) })), currentStep === 7 && (_jsx(FormStep, { title: "Insurance Quote", currentStep: 8, totalSteps: totalSteps, onNext: handleNextUpdated, onPrevious: handlePrevious, nextButtonText: "Submit", children: _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Would you like a quote for homeowner's insurance? ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs(RadioGroup, { value: formData.interestedInInsuranceQuote || '', onValueChange: (value) => handleSelectChange('interestedInInsuranceQuote', value), children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "yes", id: "insuranceYes" }), _jsx(Label, { htmlFor: "insuranceYes", children: "Yes" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: "no", id: "insuranceNo" }), _jsx(Label, { htmlFor: "insuranceNo", children: "No" })] })] })] }) }) }))] }) }));
};
export default DataCollectionForm;
