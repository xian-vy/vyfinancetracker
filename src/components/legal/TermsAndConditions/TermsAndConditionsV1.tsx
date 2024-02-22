import React from "react";
import ReactMarkdown from "react-markdown";
import WestIcon from "@mui/icons-material/West";
import { Container, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { HOME } from "../../../constants/routes";

const markdown = `
# Vy Finance Tracker Terms of Use

Welcome to Vy Finance Tracker. These Terms of Use ("Terms") govern your use of the Vy Finance Tracker app and website, and any related services provided by Vy Finance Tracker. By accessing or using the Vy Finance Tracker, you agree to be bound by these Terms. If you do not agree to all the terms of Use, then you may not access or use the services.

## Acceptance of Terms

By using the Vy Finance Tracker, you confirm that you have read, understood, and agree to be bound by these Terms. If you are using the services on behalf of an organization, you are agreeing to these Terms for that organization and promising that you have the authority to bind that organization to these terms.

## IMPORTANT NOTICE

### Secret Recovery Phrase

Your Secret Recovery Phrase is a critical piece of information that is uniquely generated for you and is anonymous to anyone else. It is the only way access your data.
 **Please store it securely and do not share it with anyone.**

Failure to keep your Secret Recovery Phrase secure will result in the loss of access to your data.
By using our service, you acknowledge and agree that you are solely responsible for the security of your Secret Recovery Phrase.

## Scope of Services

Vy Finance Tracker is a free financial management application designed to help users track and manage their personal finances. The services provided by Vy Finance Tracker include, but are not limited to:

- **Expense Tracking**: Users can record and categorize their expenses to monitor spending habits.
- **Budget Management**: The app allows users to set up custom budgets for different categories and track progress towards these budget goals.
- **Income Tracking**: Users can log their income sources and amounts to keep track of earnings.
- **Savings Management**: The app provides tools to help users plan and track their savings and savings contributions.
- **Financial Reporting**: Vy Finance Tracker offers reports and visualizations to help users understand their financial situation and trends over time.
- **Data Synchronization**: The app synchronizes data across devices to provide a consistent user experience.
- **Data Import**: Users have the option to upload Excel files to import their expense data. Instructions for the required file formats and structures are provided within the app, accessible via a question mark icon next to the import feature. We take precautions to ensure the security of data uploaded to our services. However, users are responsible for the accuracy and integrity of the data contained in the files they upload.
- **Data Export**: Users have the option to export their financial data, such as expense and income lists, in an Excel format suitable for backup or transfer to other financial management systems. This feature allows users to easily download their data and maintain a copy outside of the app. **Please note that the exported data is not encrypted and the user is responsible for the security of the exported data.**
- **Transaction History**: The app maintains logs of certain transaction events, including the creation, deletion, and any modifications to expenses, budgets, income, savings, and savings contributions. This transaction history is displayed to users as recent transactions within the app to provide a clear overview of financial activities. While these logs are not currently used to generate financial reports, they may be utilized for this purpose in the future to enhance the services offered by Vy Finance Tracker.
- **Deletion**:Users have the option to delete their account through the settings within the app. This includes the ability to remove all personal data and transaction history associated with the account. Please note that deleting your account requires an active network connection, as it involves removing data both locally on your device and from our servers.
- **Authentication**: Vy Finance Tracker uses Google Firebase Authentication to securely manage user accounts. This service provides a robust and secure authentication system that supports various sign-in methods, including Google and Anonymous sign in.
- **Secure Connections**: All data transmissions between Vy Finance Tracker and its users are secured using HTTPS or SSL/TLS protocols. These secure connections encrypt the data in transit, preventing unauthorized access and ensuring the integrity of the information exchanged.
- **End-to-End Encryption**: Vy Finance Tracker utilizes end-to-end encryption (E2EE) with AES-256 encryption standard to securely encrypt user data. This ensures that only the user can access their data, and it is protected from unauthorized access, even if the data is intercepted during transmission.

The services are intended for personal and non-commercial use. Vy Finance Tracker is not a financial advisor, and the services provided should not be considered professional financial advice. Users are responsible for the accuracy of the data they enter into the app and for making financial decisions that are best for their individual circumstances.

While we strive to offer a comprehensive financial tracking tool, we do not guarantee the availability or accuracy of any particular feature, and services may be modified, suspended, or discontinued at our discretion without notice.

By using Vy Finance Tracker, you acknowledge and agree to the scope of services as described above.

## User Responsibilities

By using Vy Finance Tracker, you agree to the following responsibilities:

- **Lawful Use**: You must use the Vy Finance Tracker in compliance with all applicable local, state, national, and international laws and regulations.
- **Account Security**: You are responsible for maintaining the confidentiality of your account login information and for all activities that occur under your account.
- **Data Export Security**: Please note that any data exported from the app is not encrypted. You are responsible for securing any exported data to prevent unauthorized access.
- **Backup and Synchronization**: While Vy Finance Tracker automatically backs up and synchronizes your data, you are responsible for ensuring that the app is opened and connected to a network regularly to facilitate this process. This helps prevent data loss and ensures that your financial information is up-to-date across all your devices.

## Termination

You may terminate your use of Vy Finance Tracker at any time by:
- Discontinuing your use of the service.
- Deleting your account through the settings within the app.

### Limitation of Liability

Information provided through the Vy Finance Tracker is for informational purposes only and should not be considered as financial advice. While we strive to provide accurate and up-to-date information, we make no representations or warranties as to the accuracy, completeness, reliability, suitability, or availability of the Vy Finance Tracker or the information, products, services, or related graphics contained on the Vy Finance Tracker for any purpose. Any reliance you place on such information is therefore strictly at your own risk.

In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of the Vy Finance Tracker.

By using the Vy Finance Tracker, you acknowledge that you have read and agree to these terms.

`;
const TermsAndConditions = ({ isPublic = true }: { isPublic?: boolean }) => {
  return (
    <Container style={{ height: "100vh", padding: isPublic ? 16 : 0 }}>
      {isPublic && (
        <Stack direction="row" alignItems="center" justifyContent="center" my={2}>
          <WestIcon sx={{ fontSize: "14px" }} />
          <Link component={RouterLink} to={HOME} ml={0.5} variant="caption" color="inherit">
            Home
          </Link>
        </Stack>
      )}

      <article>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </Container>
  );
};

export default TermsAndConditions;
