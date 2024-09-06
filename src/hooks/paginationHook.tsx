import React from "react";

export function useTablePagination(initialPage = 0, initialRowsPerPage = 5) {
  const [page, setPage] = React.useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10)); //dont change value , it will break the pagination
    setPage(0);
  };

  return { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage };
}
