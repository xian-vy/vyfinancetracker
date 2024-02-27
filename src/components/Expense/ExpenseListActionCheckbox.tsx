import { Checkbox, Link, Stack, Typography } from "@mui/material";
import React from "react";
import ExpenseModel from "../../models/ExpenseModel";

type Props = {
  filteredExpenses: ExpenseModel[];
  selectedExpenses: ExpenseModel[];
  onSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectAll: boolean;
  onMultipleEdit: () => void;
  onMultipleDelete: () => void;
};
const ExpenseListActionCheckbox = ({
  filteredExpenses,
  selectedExpenses,
  onSelectAllChange,
  selectAll,
  onMultipleEdit,
  onMultipleDelete,
}: Props) => {
  return (
    <div>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: { xs: 0.5, sm: 2, md: 3 }, mx: { xs: 0, sm: 1, md: 2 }, mt: 1 }}
      >
        <Stack direction="row" alignItems="center" sx={{ pl: selectAll ? 0 : 0.5 }}>
          {filteredExpenses.length > 0 && (
            <>
              <Checkbox edge="start" disableRipple onChange={(e) => onSelectAllChange(e)} checked={selectAll} />
              {!selectAll ? (
                <Typography variant="body1">Select All</Typography>
              ) : (
                <Typography variant="body1">{selectedExpenses.length} Selected</Typography>
              )}
            </>
          )}
        </Stack>
        <Stack direction="row" mr={{ xs: 0.5, sm: 1 }}>
          {selectAll && (
            <>
              <Link underline="hover" color="dodgerblue" style={{ cursor: "pointer" }} mx={2} onClick={onMultipleEdit}>
                Edit
              </Link>

              <Link underline="hover" color="salmon" style={{ cursor: "pointer" }} onClick={onMultipleDelete}>
                Delete
              </Link>
            </>
          )}
        </Stack>
      </Stack>
    </div>
  );
};

export default React.memo(ExpenseListActionCheckbox);
