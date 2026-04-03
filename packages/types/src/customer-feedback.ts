export interface IFeedbackRequest {
    userId: number;
    comments: string;
    city: string;
    state: string;
    allowSharingWithCustomers: boolean;
    firstName: string;
    lastName: string;
    emailId: string;
    phoneNumber: string;
    
  }
  
export interface IContactUsRequest {
  firstName: string;
  lastName: string;
  companyName: string;
  emailId: string;
  phoneNumber: string;
  comments: string;
  }
  
