# Make.com Webhook Integration Reference

## Overview
This document outlines the webhook integration between Abstract Secure and Make.com for processing insurance quote requests.

## Endpoint Details
- **URL**: `https://hook.us2.make.com/nhgztmrpk5hjrzy7kbzkqsxvgu7q86kn`
- **Method**: POST
- **Protocol**: HTTPS (required for security)
- **Content-Type**: application/json

## Expected Data Structure
```typescript
interface WebhookPayload {
  '1': {
    services: {
      insuranceQuote: boolean;
    };
    titleFileNumber: string;
    additionalParties: Array<{
      name: string;
      phone: string;
      email: string;
      dateOfBirth: string;
      ssn: string;
      maritalStatus: string;
    }>;
    personalInformation: {
      fullName: string;
      dateOfBirth: string;
      ssn: string;
      maritalStatus: string;
      roleInTransaction: string;
    };
    propertyInformation: {
      address: string;
      titleOrderNumber: string;
    };
  };
  submissionTimestamp: string; // ISO 8601 format
  formType: 'insurance_quote';
}
```

## Data Validation Rules
1. All personal information fields are required
2. SSN must be in XXX-XX-XXXX format
3. Dates must be in ISO 8601 format
4. Title file number must be present
5. Property address is required
6. Additional parties array can be empty but if present must contain valid entries

## Error Codes & Handling
- 400: Bad Request - Invalid data structure or missing required fields
- 401: Unauthorized - Invalid or missing authentication
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Make.com processing error

## Implementation Location
- Primary Implementation: `src/pages/Insurance.tsx`
- Data Collection: `src/components/DataCollectionForm.tsx`
- Validation Utils: `src/utils/validation.ts`

## Testing
1. Test with valid complete data
2. Test with missing required fields
3. Test with invalid data formats
4. Test with empty additional parties
5. Test with multiple additional parties

## Security Considerations
1. All sensitive data (SSN, DOB) must be transmitted over HTTPS
2. Implement rate limiting on the client side
3. Validate all data before sending
4. Log errors without exposing sensitive information

## Changelog
- v1.0 (2025-01-25): Initial documentation
  - Defined data structure
  - Added validation rules
  - Specified error handling
  - Added security considerations
