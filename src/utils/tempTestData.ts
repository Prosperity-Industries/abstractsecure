// TEMPORARY TEST DATA - REMOVE BEFORE PRODUCTION
// This file contains mock data for testing purposes only
// DO NOT USE IN PRODUCTION

import { FormData } from '@/types/form';

export const testFormData: FormData = {
  // Property Information
  fullName: 'John Test Smith',
  propertyAddress: '123 Test Street, Columbus, OH 43215',
  roleInTransaction: 'owner',
  
  // Personal Information
  dateOfBirth: '1985-06-15',
  ssn: '123-45-6789',
  maritalStatus: 'married',
  
  // Additional Parties
  hasAdditionalParties: 'yes',
  additionalParties: [
    {
      name: 'Jane Test Smith',
      phone: '614-555-0123',
      email: 'jane.test@example.com',
      dateOfBirth: '1987-08-20',
      ssn: '987-65-4321',
      maritalStatus: 'married'
    },
    {
      name: 'Bob Test Jones',
      phone: '614-555-0124',
      email: 'bob.test@example.com',
      dateOfBirth: '1990-03-10',
      ssn: '456-78-9012',
      maritalStatus: 'single'
    }
  ],
  
  // Services
  interestedInPropertyManagement: 'yes',
  interestedInInsuranceQuote: 'yes'
};

// Function to load test data (development only)
export const loadTestData = () => {
  if (process.env.NODE_ENV === 'development') {
    return testFormData;
  }
  return null;
};
