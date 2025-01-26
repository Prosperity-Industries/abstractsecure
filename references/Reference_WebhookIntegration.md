# Webhook Integration Reference

## Insurance Quote Data Submission

### Webhook Details
- **Endpoint**: `https://hook.us2.make.com/nhgztmrpk5hjrzy7kbzkqsxvgu7q86kn`
- **Method**: POST
- **Content-Type**: application/json

### Data Structure
```json
{
  // Form data from localStorage
  "titleOrderNumber": "string",
  "titleFileNumber": "string",
  "fullName": "string",
  "propertyAddress": "string",
  "dateOfBirth": "string",
  "ssn": "string",
  "maritalStatus": "string",
  "roleInTransaction": "string",
  "interestedInPropertyManagement": "string",
  
  // Insurance page specific data
  "interestedInInsurance": "string",
  "submissionTimestamp": "string (ISO 8601)",
  "formType": "insurance_quote"
}
```

### Implementation Details
- Located in: `src/pages/Insurance.tsx`
- Triggered when: User submits the Insurance page form with a selection
- Data Source: Combines data from localStorage with insurance page selection
- Error Handling: Includes toast notifications for success/failure
- Loading State: Button shows loading state during submission

### Change Log
- v1.2 (2025-01-25): Moved webhook implementation to Insurance.tsx
  - Now triggers only on Insurance page submission
  - Added loading states and improved error handling
  - Combines localStorage data with insurance selection
- v1.1 (2025-01-25): Updated webhook URL
- v1.0 (2025-01-25): Initial implementation
  - Added webhook submission functionality
  - Added error handling and success notifications
  - Documented data structure and endpoint details
