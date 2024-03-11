import PublishedWithChangesOutlinedIcon from "@mui/icons-material/PublishedWithChangesOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import SyncProblemOutlinedIcon from "@mui/icons-material/SyncProblemOutlined";
import { Stack, Tooltip, Typography } from "@mui/material";
import { Timestamp, collection, getDocsFromCache, query, waitForPendingWrites } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { collections as Col } from "../../constants/collections";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";
import { db } from "../../firebase";
import { getUserDocRef } from "../../firebase/UsersService";
import { RootState } from "../../redux/store";
import "./spin.css";
import { getLastSync, setLastSync } from "../../localstorage/lastsync";
const collections = [
  Col.Expenses,
  Col.Budgets,
  Col.Income,
  Col.SavingGoalsContributions,
  Col.SavingGoals,
  Col.AccountTypes,
  Col.Categories,
  Col.IncomeSources,
];

const PendingWrites = () => {
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const budgets = useSelector((state: RootState) => state.budget.budgets);
  const income = useSelector((state: RootState) => state.income.income);
  const savings = useSelector((state: RootState) => state.savings.savings);
  const savingsContribution = useSelector((state: RootState) => state.savingsContribution.contribution);
  const persistenceID = useSelector((state: RootState) => state.auth.persistentId);

  const [pendingWrites, setPendingWrites] = useState(
    parseInt(localStorage.getItem("pendingWritesCount" + persistenceID) || "0", 10)
  );

  const [lastSyncTimestamp, setLasySyncTimestamp] = useState(getLastSync(persistenceID));

  const { categories } = useCategoryContext();
  const { accountType } = useAccountTypeContext();
  const { incomeSource } = useIncomeSourcesContext();

  const [showSyncingAnimation, setShowSyncingAnimation] = useState(false);

  const startSyncing = () => {
    setShowSyncingAnimation(true);
    setTimeout(async () => {
      setShowSyncingAnimation(false);
    }, 1000);
  };

  const checkForUnsyncedDocuments = async () => {
    if (navigator.onLine) {
      await waitForPendingWrites(db);
    }
    const userDocRef = await getUserDocRef();
    let localPendingWrites = 0;

    for (const collectionName of collections) {
      const collectionRef = collection(userDocRef, collectionName);
      const q = query(collectionRef);

      try {
        const querySnapshot = await getDocsFromCache(q);
        querySnapshot.forEach((doc) => {
          if (doc.metadata.hasPendingWrites) {
            localPendingWrites++;
          }
        });
      } catch (error) {
        console.log(`Error getting cached documents for collection ${collectionName}:`, error);
      }
    }

    setPendingWrites(localPendingWrites);
    localStorage.setItem("pendingWritesCount" + persistenceID, localPendingWrites.toString());

    if (localPendingWrites > 0) {
      startSyncing();
    } else {
      //sync is up to date
      const now = Timestamp.now();
      setLasySyncTimestamp(now);
      setLastSync(now, persistenceID);
    }
  };

  const handleNetworkChange = async () => {
    if (navigator.onLine) {
      try {
        setShowSyncingAnimation(true);
        await waitForPendingWrites(db);
        checkForUnsyncedDocuments();
      } catch (error) {
        console.error("Error waiting for pending writes to complete: ", error);
      }
    }
  };
  useEffect(() => {
    startSyncing();

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    checkForUnsyncedDocuments();

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, [expenses, budgets, income, savings, savingsContribution, categories, accountType, incomeSource]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center" mt={1}>
        {showSyncingAnimation ? (
          <>
            <Typography variant="caption" mr={0.5}>
              Syncing in progress..
            </Typography>
            <SyncOutlinedIcon
              sx={{
                color: "green",
                animation: "spin 1s linear infinite",
                fontSize: "16px",
              }}
            />
          </>
        ) : (
          <>
            <Typography variant="caption" mr={0.5}>
              {pendingWrites > 0
                ? `${pendingWrites} unsynced data ${pendingWrites === 1 ? "change" : "changes"}`
                : "All transaction data synced"}
            </Typography>
            {pendingWrites > 0 ? (
              <Tooltip title="Open network to sync and backup data">
                <SyncProblemOutlinedIcon sx={{ color: "darkorange", fontSize: "16px" }} />
              </Tooltip>
            ) : (
              <PublishedWithChangesOutlinedIcon sx={{ color: "green", fontSize: "16px" }} />
            )}
          </>
        )}
      </Stack>
      <Stack mb={1} direction="column" alignItems="center" justifyContent="center">
        <Typography sx={{ fontSize: "0.65rem", color: "#999" }}>
          Last Synced at {lastSyncTimestamp ? lastSyncTimestamp.toDate().toLocaleString() : "Never"}
        </Typography>
      </Stack>
    </>
  );
};

export default React.memo(PendingWrites);
