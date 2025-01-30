import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];
export default function AddressInput({ value, onChange, className }) {
    const handleChange = (field, newValue) => {
        onChange({
            ...value,
            [field]: newValue
        });
    };
    return (_jsxs("div", { className: className, children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "street", children: "Street Address" }), _jsx(Input, { id: "street", value: value.street, onChange: (e) => handleChange('street', e.target.value), placeholder: "123 Main St" })] }), _jsxs("div", { className: "space-y-2 mt-2", children: [_jsx(Label, { htmlFor: "unit", children: "Unit/Apt (optional)" }), _jsx(Input, { id: "unit", value: value.unit, onChange: (e) => handleChange('unit', e.target.value), placeholder: "Apt 4B" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "city", children: "City" }), _jsx(Input, { id: "city", value: value.city, onChange: (e) => handleChange('city', e.target.value), placeholder: "City" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "state", children: "State" }), _jsxs(Select, { value: value.state, onValueChange: (newValue) => handleChange('state', newValue), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "State" }) }), _jsx(SelectContent, { children: US_STATES.map((state) => (_jsx(SelectItem, { value: state, children: state }, state))) })] })] })] }), _jsxs("div", { className: "space-y-2 mt-2", children: [_jsx(Label, { htmlFor: "zipCode", children: "ZIP Code" }), _jsx(Input, { id: "zipCode", value: value.zipCode, onChange: (e) => handleChange('zipCode', e.target.value.slice(0, 5)), placeholder: "12345", maxLength: 5, pattern: "[0-9]*" })] })] }));
}
