import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import FormStep from '@/components/FormStep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
const TransactionInformation = () => {
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
    // Save state to history whenever role changes
    useEffect(() => {
        window.history.replaceState({ role }, '');
    }, [role]);
    const handlePrevious = () => {
        // Clear the role from localStorage when going back
        localStorage.removeItem('roleInTransaction');
        // Navigate to the previous form
        navigate(-1);
    };
    const handleNext = () => {
        if (!role) {
            toast({
                title: "Error",
                description: "Please select your role in the transaction",
                variant: "destructive",
            });
            return;
        }
        localStorage.setItem('roleInTransaction', role);
        navigate('/additional-parties');
    };
    return (_jsx("div", { className: "min-h-screen flex flex-col items-center justify-start p-4 bg-gradient-to-b from-blue-50 to-white", children: _jsxs("div", { className: "w-full max-w-2xl", children: [_jsx("img", { src: "/ProsperityAbstract-logo_1972x564.png", alt: "Prosperity Abstract Logo", className: "w-64 mx-auto mb-8" }), _jsx(FormStep, { title: "Transaction Information", currentStep: 1, totalSteps: 2, onNext: handleNext, onPrevious: handlePrevious, nextButtonText: "Next", children: _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx(Label, { htmlFor: "roleInTransaction", children: "Role in Transaction" }), _jsxs(Select, { value: role, onValueChange: setRole, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select your role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "buyer", children: "Buyer" }), _jsx(SelectItem, { value: "seller", children: "Seller" })] })] })] }) }) })] }) }));
};
export default TransactionInformation;
