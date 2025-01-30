import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
const FormStep = ({ title, children, currentStep, totalSteps, onNext, onPrevious, nextButtonText = "Next" }) => {
    return (_jsxs(Card, { className: "w-full p-6 space-y-6 bg-white/90 backdrop-blur-sm", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: "text-2xl font-semibold text-foreground", children: title }), _jsx("div", { className: "h-2 w-full bg-secondary rounded-full", children: _jsx("div", { className: "h-full bg-primary rounded-full transition-all duration-500", style: { width: `${(currentStep / totalSteps) * 100}%` } }) })] }), _jsx("div", { className: "space-y-4", children: children }), _jsxs("div", { className: "flex justify-between pt-4", children: [_jsx(Button, { variant: "outline", onClick: onPrevious, disabled: currentStep === 1, children: "Previous" }), _jsx(Button, { onClick: onNext, children: nextButtonText })] })] }));
};
export default FormStep;
