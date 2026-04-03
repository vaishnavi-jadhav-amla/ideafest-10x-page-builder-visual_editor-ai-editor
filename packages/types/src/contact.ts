export interface IContactResponse {
  errorMessage: string;
  success: boolean;
  hasError: string;
}

export interface IContactFormValues {
  firstName: string;
  lastName: string;
  emailId: string;
  companyName: string;
  phoneNumber: string;
  comments: string;
}
