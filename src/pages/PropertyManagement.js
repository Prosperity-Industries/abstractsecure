import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import FormStep from '@/components/FormStep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
const PropertyManagement = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [interestedInPropertyManagement, setInterestedInPropertyManagement] = useState('');
    const handlePrevious = () => {
        navigate('/additional-parties');
    };
    const handleNext = () => {
        if (!interestedInPropertyManagement) {
            toast({
                title: "Error",
                description: "Please select yes or no",
                variant: "destructive",
            });
            return;
        }
        // Save the choice to localStorage
        localStorage.setItem('interestedInPropertyManagement', interestedInPropertyManagement);
        // Navigate to the insurance page
        navigate('/insurance');
    };
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white", children: _jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("img", { src: "/lovable-uploads/b5f84e95-837e-4ccc-ace0-b9ff6ad926ec.png", alt: "Prosperity Abstract Logo", className: "w-64 mx-auto mb-8" }), _jsx(FormStep, { title: "Property Management Services", currentStep: 4, totalSteps: 5, onNext: handleNext, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "interestedInPropertyManagement", className: "text-lg block text-center mb-4", children: "Would you like to learn more about our No Stress Property Management Services?" }), _jsxs(Select, { value: interestedInPropertyManagement, onValueChange: setInterestedInPropertyManagement, children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "Select yes or no" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "yes", children: "Yes" }), _jsx(SelectItem, { value: "no", children: "No" })] })] })] }) }) })] }) }));
};
export default PropertyManagement;
