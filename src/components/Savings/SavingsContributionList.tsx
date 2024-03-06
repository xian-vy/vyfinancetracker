import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import { Box, CircularProgress, Divider, IconButton, List, Stack, Typography } from "@mui/material";
import { useAccountTypeContext } from "../../contextAPI/AccountTypeContext";
import { getCategoryAndAccountTypeDescription } from "../../firebase/utils";
import { TimestamptoDate } from "../../helper/date";
import { formatNumberWithoutCurrency } from "../../helper/utils";
import SavingGoalsContributionModel from "../../models/SavingGoalsContribution";

interface Props {
  isFetching: boolean;
  loading: boolean;
  matchingContributions: SavingGoalsContributionModel[];
  onDelete: (contribution: SavingGoalsContributionModel) => void;
}
const SavingsContributionList = ({ isFetching, loading, matchingContributions, onDelete }: Props) => {
  const { accountType: accountTypeContext } = useAccountTypeContext();

  return (
    <>
      {isFetching || loading ? (
        <Box
          sx={{
            maxHeight: "245px",
            overflowY: "auto",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress size={20} />
        </Box>
      ) : (
        <>
          {matchingContributions.length > 0 && (
            <Typography variant="body1" textAlign="center">
              Contributions
            </Typography>
          )}
          <Box sx={{ maxHeight: "245px", overflowY: "auto" }}>
            {matchingContributions.map((contribution, index) => {
              const accountType = getCategoryAndAccountTypeDescription(contribution.account_id, accountTypeContext);
              return (
                <List sx={{ py: 0.5 }} key={index}>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="column">
                      <Typography variant="body1">{formatNumberWithoutCurrency(contribution.amount)}</Typography>
                      <Typography variant="caption">{TimestamptoDate(contribution.date, "MMM dd, yyyy")}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" alignItems="center">
                      <Typography variant="body1">{accountType}</Typography>
                      <IconButton onClick={() => onDelete(contribution)}>
                        <HighlightOffOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Divider />
                </List>
              );
            })}
          </Box>
        </>
      )}
    </>
  );
};

export default SavingsContributionList;
