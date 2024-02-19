import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { useCategoryContext } from "../../contextAPI/CategoryContext";
import { useIncomeSourcesContext } from "../../contextAPI/IncomeSourcesContext";

import DoNotDisturbAltIcon from "@mui/icons-material/DoNotDisturbAlt";
import { formatNumberWithoutCurrency } from "../../Helper/utils";
import { iconSizeXS } from "../../constants/Sizes";
import { txn_types } from "../../constants/collections";
import { getCategoriesIDByDescription, getCategoryDetails, getIncomeSourceDetails } from "../../firebase/utils";

interface CategoryData {
  category: string | undefined;
  total: number;
  color: string;
}

interface icontype {
  name: string;
  icon: React.ReactElement;
}
interface FilteredChartData {
  date: string;
  categories: CategoryData[];
}

interface TrendTooltipProps {
  filteredChartData: FilteredChartData[];
  payload: any[];
  type: txn_types.Income | txn_types.Expenses | txn_types.Budget;
  formattedFilterOption: string;
  includeDateFilter: boolean;
}

function renderIcon(icon: React.ReactElement, color: string) {
  return React.cloneElement(icon, { style: { color: color, fontSize: iconSizeXS } });
}
const TrendByCategoryTooltip: React.FC<TrendTooltipProps> = ({
  payload,
  filteredChartData,
  type,
  formattedFilterOption,
  includeDateFilter,
}) => {
  const { categories } = useCategoryContext();
  const { incomeSource } = useIncomeSourcesContext();

  if (payload && payload.length > 0) {
    const date = payload[0].payload.date;

    let categoriesForDate = filteredChartData.find((data) => data.date === date)?.categories || [];
    // Sort categories by highest total
    categoriesForDate = categoriesForDate.sort((a, b) => b.total - a.total);

    const total = categoriesForDate.reduce((sum, category) => sum + category.total, 0);

    let formattedDate = date;
    if (includeDateFilter) {
      formattedDate = date + " " + formattedFilterOption;
    }

    return (
      <TableContainer component={Paper} sx={{ p: 1 }}>
        <Typography variant="h6" align="center">
          {formattedDate}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="body1">Category</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1">{type} </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriesForDate.map((categoryData, index) => {
              const totalByCategory = categoryData.total;
              let categoryID: string | undefined = "";
              let color: string | undefined = "";
              let categoryIcon: icontype | undefined = undefined;

              if (type === txn_types.Income) {
                categoryID = getCategoriesIDByDescription(categoryData.category || "", incomeSource);
                ({ color, categoryIcon } = getIncomeSourceDetails(incomeSource, categoryID || ""));
              } else if (type === txn_types.Expenses || type === txn_types.Budget) {
                categoryID = getCategoriesIDByDescription(categoryData.category || "", categories);
                ({ color, categoryIcon } = getCategoryDetails(categories, categoryID || ""));
              }
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Stack direction="row">
                      {renderIcon(categoryIcon?.icon || <DoNotDisturbAltIcon />, color || "")}
                      <Typography variant="body1" sx={{ ml: 0.5 }}>
                        {index + 1} {categoryData.category}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">{formatNumberWithoutCurrency(totalByCategory)}</Typography>
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow>
              <TableCell>
                <Typography variant="body1">Total</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body1">{formatNumberWithoutCurrency(total)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  return null;
};

export default React.memo(TrendByCategoryTooltip);
