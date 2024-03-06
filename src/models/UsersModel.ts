import { Timestamp } from "firebase/firestore";

interface UsersModel {
  id: string;
  accountCreationDate: Timestamp;
  agreementDetails: {
    hasAgreedToTermsOfUse?: boolean;
    hasAgreedToPrivacyPolicy?: boolean;
    agreementTimestamp?: Timestamp;
  };
  persistenceId?: string;
  salt?: string;
}

export default UsersModel;
