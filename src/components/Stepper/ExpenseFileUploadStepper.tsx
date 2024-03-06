import CloseIcon from "@mui/icons-material/Close";
import {
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import React from "react";

const accounts = ["Bank", "Cash", "Credit"];
const categories = ["Groceries", "Utilities", "Meals", "Dining", "Snacks"];

const dateFormats = [
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "yyyy/MM/dd",
  "MM-dd-yyyy",
  "dd-MM-yyyy",
  "dd-MMM-yy",
  "yyyy-MM-dd",
  "MMMM dd, yyyy",
  "EEE, MMMM dd, yyyy",
  "EEEE, MMMM dd, yyyy",
  "MMM dd, yyyy",
  "MMMM dd, yyyy 'at' hh:mm:ss a",
  "EEEE, MMMM dd, yyyy 'at' hh:mm:ss a",
  "EEE, MMMM dd, yyyy 'at' hh:mm:ss a",
  "MMM dd, yyyy 'at' hh:mm:ss a",
];

const generateRandomDate = () => {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const generateSampleData = () => {
  return dateFormats.map((dateFormat, index) => ({
    description: `Expense ${index + 1}`,
    amount: (Math.random() * 1000).toFixed(2),
    account: accounts[Math.floor(Math.random() * accounts.length)],
    date: generateRandomDate(),
    category: categories[Math.floor(Math.random() * categories.length)],
    dateFormat: dateFormat,
  }));
};

const sampleData = generateSampleData();

export default function ExpenseFileUploadStepper({ closeForm }: { closeForm: () => void }) {
  return (
    <div style={{ position: "relative" }}>
      <Box sx={{ width: "100%", height: "100%", px: 1 }}>
        <Stack direction="row" justifyContent="flex-end">
          <CloseIcon onClick={() => closeForm()} sx={{ cursor: "pointer" }} />
        </Stack>
        <Typography variant="body2" gutterBottom mt={1}>
          {`1) Limit 500 expenses per upload, only accepts excel files.`}
        </Typography>
        <Typography variant="body2" gutterBottom mt={1}>
          {`2) description,account and category are optional`}
        </Typography>
        <Typography variant="body2" my={1}>
          {`3) Headers must be [ description, amount, account, date, category ] in no particular order.`}
        </Typography>
        <Divider>
          <Typography textAlign="center">Example with Allowed Date Formats</Typography>
        </Divider>
        <TableContainer>
          <Table aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body1">description</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1">amount</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1">account</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1">date</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1">category</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" noWrap>
                      {row.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">{row.amount}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">{row.account}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" noWrap>
                      {format(row.date, dateFormats[index % dateFormats.length])}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" noWrap>
                      {row.category}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
}
