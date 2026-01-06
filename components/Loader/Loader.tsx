import React from "react";

const ScreenLoader = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <div
        className="spinner-border"
        role="status"
        style={{
          width: "3rem",
          height: "3rem",
          borderWidth: "5px",
          borderColor: "#fe4a55",
          borderTopColor: "white",
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p style={{ color: "black", marginTop: "1rem", fontWeight: "bold" }}>
        Loading course details...
      </p>
    </div>
  );
};

export default ScreenLoader;
