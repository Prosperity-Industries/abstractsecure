import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface PersonalInfoFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  ssn: string;
  maritalStatus: string;
}

const SecurePersonalInformation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PersonalInfoFormData>({
    defaultValues: {
      fullName: localStorage.getItem('fullName') || '',
      phone: localStorage.getItem('phone') || '',
      email: localStorage.getItem('email') || '',
      dateOfBirth: localStorage.getItem('dateOfBirth') || '',
      ssn: localStorage.getItem('ssn') || '',
      maritalStatus: localStorage.getItem('maritalStatus') || '',
    }
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    // Save to localStorage
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Navigate to next page
    navigate('/next-page'); // Update this with your next page route
  };

  // Custom handler for Select component since it doesn't work directly with register
  const handleMaritalStatusChange = (value: string) => {
    setValue('maritalStatus', value);
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold mb-6">Secure Personal Information</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            {...register('fullName', { required: 'Full name is required' })}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^\d{10}$/,
                message: 'Please enter a valid 10-digit phone number'
              }
            })}
            placeholder="1234567890"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            })}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth', { required: 'Date of birth is required' })}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ssn">Social Security Number</Label>
          <Input
            id="ssn"
            {...register('ssn', {
              required: 'SSN is required',
              pattern: {
                value: /^\d{9}$/,
                message: 'Please enter a valid 9-digit SSN'
              }
            })}
            placeholder="123456789"
            type="password"
          />
          {errors.ssn && (
            <p className="text-red-500 text-sm">{errors.ssn.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select onValueChange={handleMaritalStatusChange} defaultValue={watch('maritalStatus')}>
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
          {errors.maritalStatus && (
            <p className="text-red-500 text-sm">{errors.maritalStatus.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button type="submit">
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecurePersonalInformation;
