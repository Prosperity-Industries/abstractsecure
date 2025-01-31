import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormStep from '@/components/FormStep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
const AdditionalPartyTwo = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const role = localStorage.getItem('roleInTransaction') || '';
    const partyType = role === 'buyer' ? 'Buyer' : 'Seller';
    const [formData, setFormData] = useState({
        fullName: localStorage.getItem('additionalParty2_fullName') || '',
        dateOfBirth: localStorage.getItem('additionalParty2_dateOfBirth') || '',
        ssn: localStorage.getItem('additionalParty2_ssn') || '',
        maritalStatus: localStorage.getItem('additionalParty2_maritalStatus') || '',
        hasMoreParties: localStorage.getItem('additionalParty2_hasMoreParties') || ''
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        localStorage.setItem(`additionalParty2_${name}`, value);
    };
    const handleSelectChange = (value, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        localStorage.setItem(`additionalParty2_${field}`, value);
    };
    const handlePrevious = () => {
        navigate('/additional-party-one');
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
            localStorage.setItem(`additionalParty2_${key}`, value);
        });
        // Navigate based on whether there are more parties
        if (formData.hasMoreParties === 'yes') {
            navigate('/additional-party-three');
        }
        else {
            navigate('/property-management'); // or whatever the next page should be
        }
    };
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white", children: _jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("img", { src: "/ProsperityAbstract-logo_1972x564.png", alt: "Prosperity Abstract Logo", className: "w-64 mx-auto mb-8" }), _jsx(FormStep, { title: `Additional ${partyType} #2`, currentStep: 3, totalSteps: 4, onNext: handleNext, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "fullName", children: "Full Name" }), _jsx(Input, { id: "fullName", name: "fullName", value: formData.fullName, onChange: handleInputChange, placeholder: "Enter full name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dateOfBirth", children: "Date of Birth" }), _jsx(Input, { id: "dateOfBirth", name: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: handleInputChange })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ssn", children: "Social Security Number" }), _jsx(Input, { id: "ssn", name: "ssn", type: "password", value: formData.ssn, onChange: handleInputChange, placeholder: "Enter SSN" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "maritalStatus", children: "Marital Status" }), _jsxs(Select, { value: formData.maritalStatus, onValueChange: (value) => handleSelectChange(value, 'maritalStatus'), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select marital status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "single", children: "Single" }), _jsx(SelectItem, { value: "married", children: "Married" }), _jsx(SelectItem, { value: "divorced", children: "Divorced" }), _jsx(SelectItem, { value: "widowed", children: "Widowed" })] })] })] }), _jsxs("div", { className: "pt-6 border-t", children: [_jsx(Label, { htmlFor: "hasMoreParties", children: `Are there additional ${partyType}s?` }), _jsxs(Select, { value: formData.hasMoreParties, onValueChange: (value) => handleSelectChange(value, 'hasMoreParties'), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select yes or no" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "yes", children: "Yes" }), _jsx(SelectItem, { value: "no", children: "No" })] })] })] })] }) })] }) }));
};
export default AdditionalPartyTwo;
