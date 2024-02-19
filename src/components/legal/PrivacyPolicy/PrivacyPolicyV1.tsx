import React from "react";
import ReactMarkdown from "react-markdown";
import WestIcon from "@mui/icons-material/West";
import { Container, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { HOME } from "../../../constants/routes";

const markdown = `# Vy Finance Tracker Privacy Policy
**Last updated: February 08, 2024 **

## Summary
- **Data Collection:** We collect essential information such as the Unique User Identifier (UID) for account identification and user-provided financial data to enable our services.
- **Third-Party Services:** We utilize Google Firebase services for secure authentication, robust database management, and insightful analytics. These services use cookies and collect data to enhance user experience and service functionality.
- **Cookies and Advertising:** Google AdSense provides advertising on our platform, using cookies to deliver personalized ads. Users have the option to opt out of personalized advertising.

Welcome to Vy Finance Tracker. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Progressive Web App (PWA). We are committed to protecting your personal information and your right to privacy.

If you have any questions or concerns about our policy or our practices regarding your personal information, please contact us at vyfinanceapp@gmail.com.


## Collection and Use of User Data

### Information We Collect

In the course of using the Vy Finance Tracker, we collect and store certain information that can be used to identify you ("Personal Data"), as well as other types of data that enhance your user experience. The types of data we may collect and process include:

- **Unique User Identifier (UID)**: Provided by Google Firebase Authentication when you sign in to our application, used solely for the purpose of identifying your user account within our services.
- **User-Provided Financial Data**: This includes any data that you manually enter into the Vy Finance Tracker, such as expenses, budget, income, savings, and savings contributions. We collect this data to provide you with personalized financial tracking and management services.
- **Local Storage Data**: We use local storage to save certain preferences and data to enhance your experience with the Vy Finance Tracker. This may include:
  - **Dark Mode Theme**: Your preference for a dark or light interface, to ensure a consistent visual experience.
  - **Power Saving Mode**: Your preference for enabling/disabling animations.
  - **LastModified Date**: The date and time you last modified data per transaction. This is used to help you track changes and updates to your financial data and to optimize and perform queries in our Firestore database to retrieve the latest data efficiently.
  - **Favorites**: Your selected shortcuts for transaction categories, allowing for quicker and more convenient entry of recurring transactions.
  - **PendingWritesCount**: The number of unsynced changes made while offline, which helps track any pending updates that need to be synchronized when you are back online.

We do not collect any personal information beyond what is necessary for the functionality of our services. All financial data is associated with your UID. Local storage data is used solely for improving your user experience and is not transmitted to our servers or shared with third parties.

We are committed to ensuring the confidentiality and security of all the information you provide to us, including the data stored in local storage.

### How We Use Your Information

The information we collect is used for the following purposes:

- **Unique User Identifier (UID)**: 
  - Enable you to access and use the Vy Finance Tracker services.
  - Maintain and improve the functionality of our services.
  - Monitor the usage of our services.
  - Detect, prevent, and address technical issues.

- **User-Provided Financial Data**:
  - Provide personalized financial tracking and management services.
  - Generate reports and insights based on your financial activity.
  - Assist you in budgeting.

- **Local Storage Data**:
  - Preserve your preferences, such as dark or light theme, to enhance your user experience each time you use the service.
  - Utilize the LastModified Date to perform efficient queries in our Firestore database, ensuring you have the most up-to-date information.
  - Allow for quick access to your favorite transaction categories through the Favorites feature.
  - Keep track of any unsynced changes with PendingWritesCount to ensure all your data is up-to-date once you reconnect to the internet.

We are committed to using your information to improve the Vy Finance Tracker and to provide you with the best possible service while respecting your privacy and data security.


### Your Privacy Rights

You have certain rights regarding the personal information we hold about you. These may include the right to access, modify, or delete the personal information we have collected about you. For more information about these rights, or if you have any questions or concerns about our privacy practices, please contact us at vyfinanceapp@gmail.com

### Google Firebase Services

We use the following Firebase services in the Vy Finance Tracker:

- **Firebase Authentication**: This service is used to authenticate users and manage user sessions. It provides the UID that we use as an identifier in our Firestore database.
- **Firebase Firestore**: This is our primary database where we store data related to your financial transactions. We do not store any personal information other than the UID provided by Firebase Authentication.
- **Firebase Analytics**: We use Firebase Analytics to collect anonymous usage data to help us understand how our services are used and to improve user experience. This data may include information such as how often you use the application, the events that occur within the application, aggregated usage, performance data, and from where the application was downloaded.

### Third-Party Services

We may provide links to third-party web pages that provide additional information about the data collection and use practices of our third-party service providers, including Google and Firebase. For more information about how Google collects and processes data, please visit [Google's Privacy & Terms](https://policies.google.com/privacy).


### Advertising and Google AdSense

Vy Finance Tracker displays advertisements to support our services. We have implemented Google AdSense, a service provided by Google that serves ads to users based on their visit to our site and other sites on the Internet.


#### Google AdSense and Cookies

- Google AdSense uses cookies to serve ads based on a user's prior visits to our website and other websites.
- Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
- Users may opt out of personalized advertising by visiting [Google's Ads Settings](https://www.google.com/settings/ads). Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting [www.aboutads.info](http://www.aboutads.info/).

#### Data Collection by Google AdSense

- Google AdSense may collect data for advertising purposes, including collecting data about user interactions with ads, measuring the number of ads displayed and their performance, and providing ads that are more relevant to the user.
- We do not provide any personally identifiable information to advertisers or to third-party sites that display our interest-based ads. However, advertisers and other third-parties (including the ad networks, ad-serving companies, and other service providers they may use) may assume that users who interact with or click on a personalized ad or content are part of the group that the ad or content is directed towards.

#### User Control and Privacy

- We respect your privacy and give you an option to disable cookies and personalized ads. You can choose to disable cookies through your individual browser options. More detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.
- For more information on how Google uses data when you use our partners' sites or apps, please visit [Google's Privacy & Terms](https://policies.google.com/technologies/partner-sites).

By using Vy Finance Tracker, you consent to the use of cookies and the collection and use of data for advertising purposes as outlined above. If you have any questions or concerns about our use of Google AdSense or our advertising practices, please contact us at vyfinanceapp@gmail.com.


### Use of Cookies

Vy Finance Tracker uses "cookies" to enhance the user experience. A cookie is a small piece of data stored on the user's device by the web browser while browsing a website. We use cookies in conjunction with Firebase services to enable certain functions of our service, to provide analytics, to store your preferences, and to enable advertisements delivery, including behavioral advertising.

The cookies used by Firebase services are essential for the operation of our application and include, but are not limited to:

- **Authentication Cookies**: These are necessary for Firebase Authentication to enable you to sign in to our application and to remember your sign-in information for your next visit.
- **Analytics Cookies**: Essential for Firebase Analytics to track user interactions with our application, which helps us understand usage patterns and improve our services.
- **Security Cookies**: Critical for enabling and supporting our security features, and to help us detect malicious activity.

Please note that these essential cookies are required to use our service. While you may set your browser to block or alert you about these cookies, some parts of the service will not function without them. Non-essential cookies, such as those used for advertising and non-critical analytics, can be managed through your browser settings, and you may choose to accept or refuse these cookies. Be aware that if you choose to refuse non-essential cookies, it may affect your experience and the availability of certain features within our service.


### Your Choices Regarding Cookies

If you prefer to avoid the use of cookies on the Vy Finance Tracker, you can first disable the use of cookies in your browser and then delete the cookies saved in your browser associated with this website. You may use these options to prevent the use of cookies at any time.

However, if you do not accept cookies, you may not be able to use some parts of our website. For more information about managing cookies with specific web browsers, it is recommended to refer to the browsers' respective websites.

By using the Vy Finance Tracker, you consent to the use of cookies in accordance with this privacy policy.


## Data Retention

### User Data Retention by Vy Finance Tracker

Vy Finance Tracker collects only the essential Personal Data needed to provide our services to you. This includes the unique user identifier (UID) provided by Firebase Authentication, which is used solely for the purpose of identifying your user account within our services. We do not store sensitive personal data independently of Google Firebase services.

### Account Authentication 
When you sign in to Vy Finance Tracker, we create a unique sign-in record to keep your account secure and personalize your experience. This record is essential for ensuring that only you have access to your account and preferences.


### Local Storage Data Retention

Vy Finance Tracker stores certain non-sensitive data in local storage on your device to enhance your user experience. This data is retained indefinitely or until you choose to clear your browser's local storage. It includes:

- Your preference for dark or light theme
- The LastModified Date for transactions
- Your favorites
- The count of pending writes

You have full control over this data and can clear it at any time using your browser's settings. Please note that clearing local storage data may affect your user experience and require you to reconfigure your preferences.

### Retention by Google Firebase

The retention of data collected and stored by Google Firebase services, including the UID, is governed by Google's own data retention policies. For detailed information about how long Google retains different types of user data collected via Firebase services, please refer to the document "Privacy and Security in Firebase."

For more information about Google's data retention practices and how they may apply to the data collected through Vy Finance Tracker, please visit [Google's Privacy & Terms](https://policies.google.com/privacy).

If you have any questions about data retention in relation to Vy Finance Tracker, or if you wish to inquire about the deletion of your Personal Data, please contact Google Firebase directly, as they manage the data retention for services used by Vy Finance Tracker.


## Changes to This Privacy Policy

We reserve the right to update or change our Privacy Policy at any time. Any changes to this Privacy Policy will be posted within the Vy Finance Tracker app and, where appropriate, we will provide a notice within the app informing you of any significant changes. We encourage you to periodically review the Privacy Policy for any updates while using our app.

Your continued use of the Vy Finance Tracker after any modifications to the Privacy Policy will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.

If we make any material changes to this Privacy Policy, we will notify you through an in-app announcement or update the "Last updated" date at the top of this Privacy Policy.


`;
const PrivacyPolicy = ({ isPublic = true }: { isPublic?: boolean }) => {
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

export default PrivacyPolicy;
