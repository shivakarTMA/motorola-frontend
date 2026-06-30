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
      minHeight: "45px",
      backgroundColor: "#fafafa",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: 600,
      fontSize: "13px",
    },
  },

  rows: {
    style: {
      minHeight: "50px",
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
  //   height = "500px",
}) => {
  return (
    <div className="bg-white rounded-xl border">
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        responsive
        // highlightOnHover
        // striped
        pointerOnHover
        pagination={pagination}
        paginationPerPage={rowsPerPage}
        onChangePage={(page) => setCurrentPage(page)}
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
        selectableRows={selectableRows}
        fixedHeader={fixedHeader}
        // fixedHeaderScrollHeight={height}
        customStyles={customTableStyles}
      />
    </div>
  );
};

export default CustomDataTable;
