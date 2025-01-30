interface AddressInputProps {
    value: {
        street: string;
        unit?: string;
        city: string;
        state: string;
        zipCode: string;
    };
    onChange: (address: {
        street: string;
        unit?: string;
        city: string;
        state: string;
        zipCode: string;
    }) => void;
    className?: string;
}
export default function AddressInput({ value, onChange, className }: AddressInputProps): import("react/jsx-runtime").JSX.Element;
export {};
