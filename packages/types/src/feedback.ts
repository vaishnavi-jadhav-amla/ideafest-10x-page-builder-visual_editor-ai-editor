export interface IFeedbackResponse {
    success: boolean;
  }
export interface IFeedbackFormValues {
    firstName?: string;
    lastName?: string;
    emailId?: string;
    city?: string;
    state?: string;
    comments?: string;
    allowSharingWithCustomers?: boolean;
    // Add other form fields as needed
  }