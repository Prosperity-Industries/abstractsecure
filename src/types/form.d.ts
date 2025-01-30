export interface AdditionalParty {
    name: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    ssn: string;
    maritalStatus: string;
}
export interface FormData {
    fullName: string;
    email: string;
    propertyAddress: string;
    propertyPlaceId: string;
    dateOfBirth: string;
    ssn: string;
    maritalStatus: string;
    roleInTransaction: string;
    hasAdditionalParties: string;
    additionalParties: AdditionalParty[];
    interestedInPropertyManagement: string;
    interestedInInsuranceQuote: string;
}
