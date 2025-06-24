import React, { useState, useEffect } from "react";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import moment from "moment";
import momentTimezone from "moment-timezone";
import "./ClockIn.css";
import { BsHourglassSplit } from "react-icons/bs";
import Loader from "../Helper/Loader";
import { isMobile } from "react-device-detect";
import { useSelector } from "react-redux";
import CommonTable from "../../SeparateCom/CommonTable";
import QrScanner from "qr-scanner";
import AssignClient from "../../SeparateCom/AssignClient";
import AssignLocation from "../../SeparateCom/AssignLocation";

const CheckIn = () => {
  const { PostCall } = useApiServices();
  const userId = useSelector((state) => state.userInfo.userInfo._id);
  const [startTime, setStartTime] = useState(null);
  const [timerOn, setTimerOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [totalWorkingTime, setTotalWorkingTime] = useState("0h 0m 0s");
  const [location, setLocation] = useState({ lat: null, long: null });
  const [isScannerVisible, setIsScannerVisible] = useState(true);
  const [openClientSelectModal, setOpenClientSelectModal] = useState(false);
  const [openLocationSelectModal, setOpenLocationSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const [Locationdata, setLocationdata] = useState([]);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const isWorkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );

  const requestCameraPermission = async () => {
    try {
      // Step 1: Request camera access
      let stream;
      // stream = await navigator.mediaDevices;
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // setHasCameraPermission(true);

      // Stop preview after permission is granted
      stream.getTracks().forEach((track) => track.stop());

      try {
        // Step 2: Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        // Step 3: Auto-select back camera
        if (videoDevices.length > 1) {
          const backCamera = videoDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          );
          // setCameraId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
        } else if (videoDevices.length === 1) {
          // setCameraId(videoDevices[0].deviceId);
        }
      } catch (deviceError) {
        console.error("Error enumerating devices:", deviceError);
      }
    } catch (err) {
      console.error("Camera permission denied:", err);
      // setHasCameraPermission(false);
    }
  };

  const scanner = () => {
    return new Promise((resolve, reject) => {
      try {
        if (!requestCameraPermission()) {
          showToast("Camera permission is required!", "error");
          reject("Camera permission denied");
          return;
        }
        setIsScannerVisible(true);
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "1000";

        const videoElement = document.createElement("video");
        videoElement.style.width = "80%";
        videoElement.style.maxWidth = "500px";
        videoElement.style.borderRadius = "10px";
        videoElement.style.boxShadow = "0px 4px 10px rgba(255, 255, 255, 0.5)";

        overlay.appendChild(videoElement);
        document.body.appendChild(overlay);

        const scanner = new QrScanner(
          videoElement,
          (result) => {
            // console.log("Scanned QR Code:", result.data);
            // setScanResult(result.data);
            scanner.stop();
            overlay.remove();
            resolve(result.data); // Return scanned result
          },
          {
            preferredCamera: "environment",
          }
        );

        scanner.start().catch((error) => {
          console.error("Scanner error:", error);
          reject(error);
        });

        overlay.addEventListener("click", () => {
          scanner.stop();
          overlay.remove();
          reject("User closed scanner");
        });
      } catch (error) {
        console.error("Scanner error:", error);
        reject(error);
      }
    });
  };

  const handleClockIn = async () => {
    console.log(selectedClientId, selectedLocationId);
    if (!selectedClientId && !isWorkFromOffice) {
      showToast("Please select Client.", "error");
      return;
    }
    if (!selectedLocationId && isWorkFromOffice) {
      showToast("Please select Location.", "error");
      return;
    }
    if (!location.lat || !location.long) {
      showToast(
        "Unable to fetch your location. Please check your location settings.",
        "error"
      );
      return;
    }

    let scanResult = "";
    if (isMobile) {
      try {
        scanResult = await scanner();
        // console.log("scanresult", scanResult);
      } catch (error) {
        console.error("Scanner error", error.message);
        return;
      }
    } else {
      // console.log("only mobile device detected.", scanResult);
    }
    if (
      (scanResult === "" || scanResult === null || scanResult === undefined) &&
      isMobile
    ) {
      showToast("Please Re-scanning QR.", "error");
      return;
    }
    // if (isMobile) {
    //   try {
    //     scanResult = await scanner();
    //     if (!scanResult) {
    //       showToast("QR code scan failed. Try again.", "error");
    //       return;
    //     }
    //     console.log("Scan result:", scanResult);
    //   } catch (error) {
    //     console.error("Scanner error:", error);
    //     return;
    //   }
    // }
    const body = {
      userId,
      location: {
        latitude: location.lat,
        longitude: location.long,
      },
      jobId: jobRoleId,
      qrValue: scanResult, // Include the scanned QR code result
      isMobile,
      [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
        ? selectedLocationId
        : selectedClientId,
    };
    // console.log("body", body);

    try {
      setLoading(true);
      const response = await PostCall(`/clockIn`, body);
      if (response?.data?.status === 200) {
        const { timesheet } = response?.data;
        const now = momentTimezone.tz("Europe/London");
        setStartTime(now);
        // setEndTime(null);
        setElapsedTime(0);
        startTimer(now);
        setTimeSheetData(timesheet?.clockinTime);
        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error during clock-in process:", error);
      showToast("Failed to clock in. Please try again.", "error");
    }
  };

  const handleClockOut = async () => {
    if (!selectedClientId && !isWorkFromOffice) {
      showToast("Please select Client.", "error");
      return;
    }
    if (!selectedLocationId && isWorkFromOffice) {
      showToast("Please select Location.", "error");
      return;
    }
    if (!location.lat || !location.long) {
      showToast(
        "Unable to fetch your location. Please check your location settings.",
        "error"
      );
      return;
    }

    let scanResult = "";
    if (isMobile) {
      try {
        scanResult = await scanner();
        // console.log("scanresult", scanResult);
      } catch (error) {
        console.error("Scanner error", error.message);
        return;
      }
    } else {
      // console.log("only mobile device detected.", scanResult);
    }

    if (
      (scanResult === "" || scanResult === null || scanResult === undefined) &&
      isMobile
    ) {
      showToast("Please Re-scanning QR.", "error");
      return;
    }

    const body = {
      userId,
      location: {
        latitude: location.lat,
        longitude: location.long,
      },
      jobId: jobRoleId,
      qrValue: scanResult,
      isMobile,
      [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
        ? selectedLocationId
        : selectedClientId,
    };
    try {
      setLoading(true);
      const response = await PostCall(`/clockOut`, body);
      if (response?.data?.status === 200) {
        const { timesheet } = response?.data;
        setElapsedTime(0);
        clearInterval(timerInterval);
        setTimerInterval(null);
        setTimeSheetData(timesheet.clockinTime);
        setTotalWorkingTime(timesheet.totalHours);
        localStorage.removeItem("startTime");
        localStorage.removeItem("elapsedTime");

        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error during clock-out process:", error);
      showToast("Failed to clock out. Please try again.", "error");
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const fetchTimesheet = async () => {
    try {
      setLoading(true);
      const response = await PostCall(`/getOwnTodaysTimesheet`, {
        jobId: jobRoleId,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocationId
          : selectedClientId,
      });

      if (response?.data?.status === 200) {
        const timesheet = response?.data?.timesheet;
        const clockinEntries = timesheet?.clockinTime || [];
        const isTimerOn = timesheet?.isTimerOn;
        const totalHours = timesheet?.totalHours;

        setTimeSheetData(clockinEntries);
        setTimerOn(isTimerOn);
        setTotalWorkingTime(totalHours);

        if (clockinEntries.length > 0 && isTimerOn) {
          // Get the last clock-in entry
          const lastClockIn =
            clockinEntries[clockinEntries.length - 1]?.clockIn;
          if (lastClockIn) {
            localStorage.setItem("startTime", lastClockIn);
          }
        }

        // Retrieve from localStorage and process
        const savedStartTime = localStorage.getItem("startTime");
        const savedElapsedTime =
          Number(localStorage.getItem("elapsedTime")) || 0;
        const savedTotalWorkingTime =
          Number(localStorage.getItem("totalWorkingTime")) || 0;

        if (savedStartTime) {
          const savedTime = momentTimezone.tz(savedStartTime, "Europe/London");
          const currentElapsed = savedTime.isValid()
            ? moment().diff(savedTime, "seconds") + savedElapsedTime
            : savedElapsedTime;

          setStartTime(savedTime);
          setElapsedTime(currentElapsed);
          startTimer(savedTime);
        }

        // setTotalWorkingTime(savedTotalWorkingTime);
      } else {
        // if (response?.data?.message !== "Record is not found!") {
        showToast(response?.data?.message, "error");
        // }
      }
      setLoading(false);
    } catch (error) {
      console.log("Error fetching timesheet:", error);
      setLoading(false);
    }
  };

  const startTimer = (start) => {
    const interval = setInterval(() => {
      const elapsedSeconds = moment().diff(start, "seconds"); // Get elapsed time in seconds
      setElapsedTime(elapsedSeconds);
    }, 1000);
    setTimerInterval(interval);
  };

  const GetClientdata = async () => {
    try {
      const response = await PostCall(`/getUsersAssignClients`, {
        jobId: jobRoleId,
      });

      if (response?.data?.status === 200) {
        const clients = response.data.assignClients;
        // console.log("job title", clients);
        setClientdata(clients);

        if (clients.length > 1) {
          setOpenClientSelectModal(false);
        } else {
          setSelectedClientId(clients[0]?.clientId);
          setOpenClientSelectModal(true);
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const GetLocationdata = async () => {
    try {
      const response = await PostCall(`/getUsersAssignLocations`, {
        jobId: jobRoleId,
      });

      if (response?.data?.status === 200) {
        const Locations = response.data.assignLocations;
        // console.log("job title", Locations);
        setLocationdata(Locations);

        if (Locations.length > 1) {
          setOpenLocationSelectModal(false);
        } else {
          console.log(Locations);
          setSelectedLocationId(Locations[0]?.locationId);
          setOpenLocationSelectModal(true);
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupClose = () => {
    setOpenClientSelectModal(true);
  };

  const handleClientSelect = (selectedTitle) => {
    console.log("Client id selected from selection", selectedTitle);
    setSelectedClientId(selectedTitle);
    setOpenClientSelectModal(true);
  };

  const handlePopupCloseForLocation = () => {
    setOpenLocationSelectModal(true);
  };

  const handleLocationSelect = (selectedLocation) => {
    console.log("Location id selected from selection", selectedLocation);
    setSelectedLocationId(selectedLocation);
    setOpenLocationSelectModal(true);
  };

  useEffect(() => {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      // console.log(result);
      if (result.state === "denied") {
        showToast(
          "Please enable location permission in your browser settings.",
          "error"
        );
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              long: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error fetching location:", error);
            showToast(
              "Unable to fetch location. Please check your location settings.",
              "error"
            );
          }
        );
      }
    });
  }, []);

  useEffect(() => {
    if (!isWorkFromOffice && jobRoleId) GetClientdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRoleId, isWorkFromOffice]);

  useEffect(() => {
    if (isWorkFromOffice && jobRoleId) GetLocationdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRoleId, isWorkFromOffice]);

  useEffect(() => {
    if (
      (!isWorkFromOffice && selectedClientId) ||
      (isWorkFromOffice && selectedLocationId)
    ) {
      fetchTimesheet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId, selectedLocationId, jobRoleId]);

  useEffect(() => {
    if (startTime) {
      localStorage.setItem("startTime", startTime);
      localStorage.setItem("elapsedTime", elapsedTime);
      localStorage.setItem("totalWorkingTime", totalWorkingTime);
    } else {
      localStorage.removeItem("startTime");
    }
  }, [startTime, elapsedTime, totalWorkingTime]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {!openClientSelectModal && !isWorkFromOffice && Clientdata.length > 1 && (
        <AssignClient
          onClose={handlePopupClose}
          Clientdata={Clientdata}
          onClientSelect={handleClientSelect}
        />
      )}

      {!openLocationSelectModal &&
        isWorkFromOffice &&
        Locationdata.length > 1 && (
          <AssignLocation
            onClose={handlePopupCloseForLocation}
            Locationdata={Locationdata}
            onLocationSelect={handleLocationSelect}
          />
        )}

      <h1 className="clock-in-h1 date-outside">{moment().format("llll")}</h1>

      {isMobile && isScannerVisible && <div id="scanner-visible"></div>}

      <div className="button-container">
        <button
          onClick={handleClockIn}
          className="clock-in-btn"
          disabled={timerOn}
        >
          Clock In
        </button>
        <h1 className="clock-in-h1 date-inside">{moment().format("llll")}</h1>
        {/* <span className="timer">Timer: {formatTime(elapsedTime)}</span> */}
        <button
          onClick={handleClockOut}
          className="clock-out-btn"
          disabled={!timerOn}
        >
          Clock Out
        </button>
      </div>
      {timeSheetData?.length > 0 ? (
        <div className="total-working-time">
          Total Working Time: <b>{totalWorkingTime}</b>
        </div>
      ) : (
        ""
      )}
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : timeSheetData?.length > 0 ? (
        <CommonTable
          headers={["ClockIn Time", "ClockOut Time", "Working Time"]}
          data={timeSheetData?.map((timeSheet) => ({
            _id: timeSheet._id,
            clockin: moment(timeSheet.clockIn).format("L LTS"),
            clockout: timeSheet.clockOut ? (
              moment(timeSheet.clockOut).format("L LTS")
            ) : (
              <b className="active">Active</b>
            ),
            workingTime:
              timeSheet.totalTiming !== "0" ? (
                timeSheet.totalTiming
              ) : (
                <BsHourglassSplit />
              ),
          }))}
          isPagination="false"
          isSearchQuery={false}
        />
      ) : (
        <div className="no-data-wrapper"></div>
      )}
    </div>
  );
};

export default CheckIn;
