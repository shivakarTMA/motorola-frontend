import { useState } from "react";
import DataTable from "react-data-table-component";

const customTableStyles = {
  table: {
    style: {
      backgroundColor: "#fff",
    },
  },

  headRow: {
    style: {
      minHeight: "40px",
      backgroundColor: "#fafafa",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: 600,
      fontSize: "13px",
    },
  },

  rows: {
    style: {
      minHeight: "45px",
      fontSize: "13px",
      borderBottom: "1px solid #f1f1f1",
      "&:hover": {
        backgroundColor: "#fafafa",
      },
    },
  },
  cells: {
    style: {
      backgroundColor: "transparent",
    },
  },

  pagination: {
    style: {
      borderTop: "1px solid #eee",
    },
  },
};

const CustomDataTable = ({
  columns,
  data,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  loading = false,
  selectableRows = false,
  pagination = true,
  fixedHeader = true,
  paginationTotalRows,
  //   height = "500px",
}) => {
  // 👇 automatically apply allowOverflow to every column
  const enhancedColumns = columns.map((col) => ({
    // allowOverflow: true,
    ...col, // any column-specific override still wins
  }));

  const tableData = pagination
    ? data
    : data?.slice(-10);

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <DataTable
        columns={enhancedColumns}
        data={tableData}
        progressPending={loading}
        responsive
        // highlightOnHover
        // striped
        // pointerOnHover
        pagination={pagination}
        paginationServer={pagination}
        paginationTotalRows={paginationTotalRows}
        paginationPerPage={rowsPerPage}
        onChangePage={setCurrentPage}
        selectableRows={selectableRows}
        fixedHeader={fixedHeader}
        persistTableHead
        paginationComponentOptions={{
          noRowsPerPage: true, // 👈 hides the dropdown
        }}
        noDataComponent={
          <div className="py-8 text-gray-500 text-sm">No data found.</div>
        }
        // fixedHeaderScrollHeight={height}
        customStyles={customTableStyles}
      />
    </div>
  );
};

export default CustomDataTable;
