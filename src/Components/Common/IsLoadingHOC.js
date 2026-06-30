import React, { useState } from "react";
import { ClipLoader } from "react-spinners";

// Loader component using react-spinners
const Loading = () => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-50">
      <ClipLoader color="#ffffff" size={60} />
    </div>
  );
};

// Higher-Order Component for managing loading state
const IsLoadingHOC = (WrappedComponent) => {
  const HOC = (props) => {
    const [isLoading, setLoading] = useState(false);

    const setLoadingState = (loadingState) => {
      setLoading(loadingState);
    };

    return (
      <>
        {isLoading && <Loading />}
        <WrappedComponent
          {...props}
          isLoading={isLoading}
          setLoading={setLoadingState}
        />
      </>
    );
  };

  return HOC;
};

export default IsLoadingHOC;
