import React from "react";
import "./TimesheetTable.css";
import { BsHourglassSplit } from "react-icons/bs";
import moment from "moment";
import Pagination from "../main/Pagination";

const TimesheetTable = (props) => {
  const {
    headers,
    timesheetReportList,
    currentPage,
    totalPages,
    onPageChange,
    showPerPage,
    onPerPageChange,
  } = props;
  return (
    <>
      <div className="table-container">
        <table className="timesheet-table">
          <thead>
            <tr>
              {headers?.map((header, index) => (
                <th key={`${index}-header`}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timesheetReportList?.map((entry, index) => {
              const { date, status, timesheet, leave, holiday, absent } = entry;
              const timesheetData = timesheet ? entry?.data?.timesheetData : {};
              const leaveData = leave ? entry?.data?.leaveData : {};
              const holidayData = holiday ? entry?.data?.holidayData : {};

              if (status === "Half Leave") {
                return (
                  <>
                    <tr key={`${index}-timesheet`}>
                      <td>
                        {moment(date).format("YYYY-MM-DD")} (
                        {moment(date).format("ddd")})
                      </td>
                      <td>{status}</td>
                      <td>
                        {timesheetData?.clockinTime?.length > 0
                          ? timesheetData?.clockinTime?.map((clock, i) => (
                              <div key={i} className="clock-entry">
                                <span className="time">
                                  {moment(clock?.clockIn).format("LT")} |{" "}
                                </span>
                                <span className="clockout">
                                  {clock.clockOut ? (
                                    moment(clock?.clockOut).format("LT")
                                  ) : (
                                    <BsHourglassSplit />
                                  )}
                                </span>
                                <span className="total-timing">
                                  {" "}
                                  | ({clock?.totalTiming})
                                </span>
                              </div>
                            ))
                          : "-"}
                      </td>
                      <td>{timesheetData?.totalHours || "-"}</td>
                      <td>{timesheetData?.overTime || "-"}</td>
                    </tr>

                    <tr key={`${index}-leave`}>
                      <td colSpan={headers.length} className="leave-entry">
                        {leave
                          ? `${leaveData?.selectionDuration}: ${
                              leaveData?.reasonOfLeave || "N/A"
                            }`
                          : ""}
                      </td>
                    </tr>
                  </>
                );
              }

              if (!timesheet && (holiday || absent || leave)) {
                return (
                  <tr key={index}>
                    <td>
                      {moment(date).format("YYYY-MM-DD")} (
                      {moment(entry.date).format("ddd")})
                    </td>
                    <td colSpan={headers.length - 1}>
                      {holiday ? ` Holiday : ${holidayData.occasion}` : ""}
                      {leave ? ` Leave : ${leaveData.reasonOfLeave}` : ""}
                      {absent ? ` Absent` : ""}
                    </td>
                  </tr>
                );
              }

              if (timesheet) {
                return (
                  <tr key={index}>
                    <td>
                      {moment(date).format("YYYY-MM-DD")} (
                      {moment(date).format("ddd")})
                    </td>
                    <td>{status}</td>
                    <td>
                      {timesheetData?.clockinTime?.length > 0
                        ? timesheetData?.clockinTime?.map((clock, i) => (
                            <div key={i} className="clock-entry">
                              <span className="time">
                                {moment(clock?.clockIn).format("LT")} |{" "}
                              </span>
                              <span className="clockout">
                                {clock.clockOut ? (
                                  moment(clock?.clockOut).format("LT")
                                ) : (
                                  <BsHourglassSplit />
                                )}
                              </span>
                              <span className="total-timing">
                                {" "}
                                | ({clock?.totalTiming})
                              </span>
                            </div>
                          ))
                        : "-"}
                    </td>
                    <td>{timesheetData?.totalHours || "-"}</td>
                    <td>{timesheetData?.overTime || "-"}</td>
                  </tr>
                );
              }
              return [];
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showPerPage={showPerPage}
        onPerPageChange={onPerPageChange}
      />
    </>
  );
};

export default TimesheetTable;
