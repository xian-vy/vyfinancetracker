import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./redux/store.ts";
import React from "react";
import { AccountTypeProvider } from "./contextAPI/AccountTypeContext.tsx";
import { CategoryProvider } from "./contextAPI/CategoryContext.tsx";
import { IncomeSourcesProvider } from "./contextAPI/IncomeSourcesContext.tsx";
import { TransactionLogsProvider } from "./contextAPI/TransactionLogsContext.tsx";

function displayUpdateNotification() {
  window.confirm("A new update is available! Please refresh page.");
  window.location.reload();
}
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Check if the Web Crypto API is supported
if (!(window.crypto && window.crypto.subtle)) {
  window.alert(
    "Your browser does not support the required cryptographic features. Please update your browser or use a different one."
  );
  throw new Error("Your browser does not support the required cryptographic features.");
}
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <CategoryProvider>
      <AccountTypeProvider>
        <IncomeSourcesProvider>
          <TransactionLogsProvider>
            <App />
          </TransactionLogsProvider>
        </IncomeSourcesProvider>
      </AccountTypeProvider>
    </CategoryProvider>
  </Provider>

  // </React.StrictMode>
);

reportWebVitals();

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/sw.js").then((registration) => {
//       // Listen for updates
//       if ("BroadcastChannel" in window) {
//         const updateChannel = new BroadcastChannel("workbox");
//         updateChannel.addEventListener("message", (event) => {
//           if (event.data.type === "CACHE_UPDATED") {
//             const { updatedURL } = event.data.payload;
//             console.log(`A newer version of ${updatedURL} is available!`);
//             // Show a notification to the user
//             displayUpdateNotification();
//           }
//         });
//       }
//     });

//     let refreshing;
//     navigator.serviceWorker.addEventListener("controllerchange", () => {
//       if (refreshing) return;
//       refreshing = true;
//       displayUpdateNotification();
//     });
//   });
// }
