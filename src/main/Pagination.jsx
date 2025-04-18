import React from "react";
import "./Pagination.css";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPerPage,
  onPerPageChange,
}) => {
  const handlePerPageChange = (e) => {
    onPerPageChange(e);
  };

  const maxVisiblePages = 5;
  let startPage, endPage;

  if (totalPages <= maxVisiblePages) {
    startPage = 1;
    endPage = totalPages;
  } else if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
    startPage = 1;
    endPage = maxVisiblePages;
  } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
    startPage = totalPages - maxVisiblePages + 1;
    endPage = totalPages;
  } else {
    startPage = currentPage - Math.floor(maxVisiblePages / 2);
    endPage = currentPage + Math.floor(maxVisiblePages / 2);
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="pagination-container">
      <div className="contracts-per-page">
        <select
          value={showPerPage}
          onChange={handlePerPageChange}
          className="Contract-select-data-input"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="Action-button"
      >
        <MdOutlineArrowBackIos />
      </button>

      {visiblePages?.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={currentPage === number ? "active" : "pagination-number"}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className="Action-button"
      >
        <MdOutlineArrowForwardIos />
      </button>
    </div>
  );
};

export default Pagination;
