import React, { useEffect, useState } from "react";
import "./ApplyJob.css";
import { useLocation } from "react-router";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import ApplyJobForm from "./ApplyJobForm";
import Loader from "../Helper/Loader";

const ApplyJob = () => {
  const { GetCall } = useApiServices();
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [jobDeleted, setJobDeleted] = useState(false);
  const [JobExpired, setJobExpired] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get("key");

  const GetJobDetails = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/job?key=${key}`);
      if (response?.data?.status === 200) {
        setJobDetails(response?.data?.jobDetails);
      } else if (response?.data?.status === 404) {
        showToast(response?.data?.message, "error");
        setJobDeleted(true);
      } else if (response?.data?.status === 410) {
        showToast(response?.data?.message, "error");
        setJobExpired(true);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetJobDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : jobDeleted || JobExpired ? (
        <div className="job-deleted-div">
          <div className="job-deleted-message">
            {jobDeleted && (
              <>
                <h2>Job post not found</h2>
                <p>The job you are trying to view has been removed.</p>
              </>
            )}
            {JobExpired && !jobDeleted && (
              <>
                <h2>Job applicaton expired</h2>
                <p>
                  This applicaton has expired and is no longer accepting
                  applications.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="job-div-flex">
          <h4>Job Openings</h4>
          <div className="Job-main-div">
            <div className="job-container">
              <div className="job-sidebar">
                <div className="apply-section">
                  {jobDetails?.jobPhoto && (
                    <img src={jobDetails.jobPhoto} alt="Job" />
                  )}
                  {jobDetails?.jobApplyTo && (
                    <p>
                      Apply to <strong>{jobDetails?.jobApplyTo}</strong>
                    </p>
                  )}
                  {jobDetails?.jobLocation && (
                    <p>
                      Location <strong> {jobDetails?.jobLocation} </strong>
                    </p>
                  )}
                  {jobDetails?.companyContactNumber && (
                    <p>
                      Contact Number
                      <strong> {jobDetails?.companyContactNumber} </strong>
                    </p>
                  )}
                </div>

                <div className="company-section">
                  {jobDetails?.companyWebSite && <h3>Company Website</h3>}
                  {jobDetails?.companyWebSite && (
                    <a
                      href={
                        jobDetails?.companyWebSite?.startsWith("http")
                          ? jobDetails.companyWebSite
                          : `https://${jobDetails.companyWebSite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {jobDetails?.companyWebSite}
                    </a>
                  )}
                </div>
              </div>

              <div className="job-details">
                {jobDetails?.jobTitle && <h1>{jobDetails.jobTitle}</h1>}
                <div className="info-row">
                  {jobDetails?.jobCategory && (
                    <span>
                      <strong>Category: </strong> {jobDetails.jobCategory}
                    </span>
                  )}
                  {jobDetails?.jobStatus && (
                    <span>
                      <strong>Status: </strong> {jobDetails.jobStatus}
                    </span>
                  )}
                </div>
                {jobDetails?.jobDescription && (
                  <>
                    <h2>Job Description</h2>
                    <p className="bold">{jobDetails?.jobDescription}</p>
                  </>
                )}
              </div>
            </div>
            <ApplyJobForm />
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyJob;
