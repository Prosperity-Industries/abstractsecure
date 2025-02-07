import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import FormStep from '@/components/FormStep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
const AdditionalParties = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [role, setRole] = useState(() => {
        // Try to load from history state first, then localStorage
        const historyState = window.history.state;
        if (historyState?.role) {
            return historyState.role;
        }
        return localStorage.getItem('roleInTransaction') || '';
    });
    const [hasAdditionalParties, setHasAdditionalParties] = useState(() => {
        // Try to load from history state first, then localStorage
        const historyState = window.history.state;
        if (historyState?.hasAdditionalParties) {
            return historyState.hasAdditionalParties;
        }
        return localStorage.getItem('hasAdditionalParties') || '';
    });
    useEffect(() => {
        // Save state to history whenever values change
        window.history.replaceState({
            role,
            hasAdditionalParties,
            formData: localStorage.getItem('formData')
        }, '');
    }, [role, hasAdditionalParties]);
    useEffect(() => {
        // Check if we have the required data
        const roleInTransaction = localStorage.getItem('roleInTransaction');
        const formData = localStorage.getItem('formData');
        if (!roleInTransaction || !formData) {
            toast({
                title: "Error",
                description: "Missing required information. Please start from the beginning.",
                variant: "destructive",
            });
            navigate('/');
            return;
        }
        setRole(roleInTransaction);
    }, [navigate, toast]);
    const handlePrevious = () => {
        // Always navigate back to personal information
        navigate('/personal-information');
    };
    const handleNext = () => {
        if (!hasAdditionalParties) {
            toast({
                title: "Error",
                description: "Please select yes or no",
                variant: "destructive",
            });
            return;
        }
        // Save the choice to localStorage
        localStorage.setItem('hasAdditionalParties', hasAdditionalParties);
        // Navigate to the next page based on the answer
        if (hasAdditionalParties === 'yes') {
            navigate('/additional-party-one');
        }
        else {
            navigate('/property-management'); // or whatever the next page should be
        }
    };
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white", children: _jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("img", { src: "/static/ProsperityAbstract-logo_1972x564.png", alt: "Prosperity Abstract Logo", className: "w-64 mx-auto mb-8" }), _jsx(FormStep, { title: "Additional Parties", currentStep: 3, totalSteps: 4, onNext: handleNext, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "hasAdditionalParties", children: `Are there additional ${role === 'buyer' ? 'Buyers' : 'Sellers'}?` }), _jsxs(Select, { value: hasAdditionalParties, onValueChange: setHasAdditionalParties, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select yes or no" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "yes", children: "Yes" }), _jsx(SelectItem, { value: "no", children: "No" })] })] })] }) }) })] }) }));
};
export default AdditionalParties;
