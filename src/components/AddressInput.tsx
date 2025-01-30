import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function AddressInput({ value, onChange, className }: AddressInputProps) {
  const handleChange = (field: keyof typeof value, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          value={value.street}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('street', e.target.value)}
          placeholder="123 Main St"
        />
      </div>

      <div className="space-y-2 mt-2">
        <Label htmlFor="unit">Unit/Apt (optional)</Label>
        <Input
          id="unit"
          value={value.unit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('unit', e.target.value)}
          placeholder="Apt 4B"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={value.city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('city', e.target.value)}
            placeholder="City"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={value.state}
            onValueChange={(newValue) => handleChange('state', newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          value={value.zipCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('zipCode', e.target.value.slice(0, 5))}
          placeholder="12345"
          maxLength={5}
          pattern="[0-9]*"
        />
      </div>
    </div>
  );
}
