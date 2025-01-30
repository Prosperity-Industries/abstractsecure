export const formatSSN = (ssn) => {
    // Remove all non-numeric characters
    const numbers = ssn.replace(/\D/g, '');
    // Check if we have exactly 9 digits
    if (numbers.length !== 9) {
        throw new Error('SSN must contain exactly 9 digits');
    }
    // Format as XXX-XX-XXXX
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`;
};
export const validateSSN = (ssn) => {
    try {
        const formatted = formatSSN(ssn);
        const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
        return ssnRegex.test(formatted);
    }
    catch {
        return false;
    }
};
export const validateISODate = (date) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return isoDateRegex.test(date);
};
export const validateWebhookPayload = (data) => {
    const errors = [];
    // Check module '1' exists
    if (!data['1']) {
        errors.push({ field: 'module', message: 'Missing module 1' });
        return errors;
    }
    // Validate services
    if (!data['1'].services?.insuranceQuote === undefined) {
        errors.push({ field: 'services.insuranceQuote', message: 'Insurance quote preference is required' });
    }
    // Validate title file number
    if (!data['1'].titleFileNumber) {
        errors.push({ field: 'titleFileNumber', message: 'Title file number is required' });
    }
    // Validate personal information
    const personalInfo = data['1'].personalInformation;
    if (!personalInfo) {
        errors.push({ field: 'personalInformation', message: 'Personal information is required' });
    }
    else {
        if (!personalInfo.fullName)
            errors.push({ field: 'fullName', message: 'Full name is required' });
        if (!personalInfo.dateOfBirth)
            errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
        if (!personalInfo.ssn) {
            errors.push({ field: 'ssn', message: 'SSN is required' });
        }
        else if (!validateSSN(personalInfo.ssn)) {
            errors.push({ field: 'ssn', message: 'Invalid SSN format' });
        }
        if (!personalInfo.maritalStatus)
            errors.push({ field: 'maritalStatus', message: 'Marital status is required' });
        if (!personalInfo.roleInTransaction)
            errors.push({ field: 'roleInTransaction', message: 'Role in transaction is required' });
    }
    // Validate property information
    const propertyInfo = data['1'].propertyInformation;
    if (!propertyInfo) {
        errors.push({ field: 'propertyInformation', message: 'Property information is required' });
    }
    else {
        if (!propertyInfo.address)
            errors.push({ field: 'address', message: 'Property address is required' });
        if (!propertyInfo.titleOrderNumber)
            errors.push({ field: 'titleOrderNumber', message: 'Title order number is required' });
    }
    // Validate additional parties if present
    if (data['1'].additionalParties) {
        data['1'].additionalParties.forEach((party, index) => {
            if (!party.name)
                errors.push({ field: `additionalParties[${index}].name`, message: 'Additional party name is required' });
            if (!party.dateOfBirth)
                errors.push({ field: `additionalParties[${index}].dateOfBirth`, message: 'Additional party DOB is required' });
            if (party.ssn && !validateSSN(party.ssn)) {
                errors.push({ field: `additionalParties[${index}].ssn`, message: 'Invalid SSN format' });
            }
        });
    }
    return errors;
};
