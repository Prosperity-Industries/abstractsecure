// TEMPORARY TEST DATA - REMOVE BEFORE PRODUCTION
// This file contains mock data for testing purposes only
// DO NOT USE IN PRODUCTION
export const testFormData = {
    titleFileNumber: 'PA6969',
    roleInTransaction: 'Buyer',
    fullName: 'Stephen Barth',
    email: 'Spbr@novonordisk.com',
    systemAddress: '931 S 59th St, Philadelphia, PA 19143',
    dateOfBirth: '1980-09-04',
    ssn: '123456789',
    maritalStatus: 'single',
    hasAdditionalParties: 'no',
    additionalParties: [],
    interestedInPropertyManagement: '',
    interestedInInsuranceQuote: ''
};
// Function to load test data (development only)
export const loadTestData = () => {
    if (import.meta.env.MODE === 'development') { // ✅ Fix for Vite
        return testFormData;
    }
    return null;
};
