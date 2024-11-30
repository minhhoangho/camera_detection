import React, { useState, useEffect } from 'react';

export const ImageWithTimeout = ({
  src,
  timeoutDuration,
  alt,
}: {
  src: string;
  timeoutDuration: number;
  alt: string
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    // Start the timeout
    const id = setTimeout(() => {
      setIsLoading(false);
      setHasError(true);
    }, timeoutDuration);

    setTimeoutId(id);

    // Cleanup function to clear the timeout
    return () => clearTimeout(id);
  }, [timeoutDuration]);

  const handleLoad = () => {
    clearTimeout(timeoutId);
    setIsLoading(false);
  };

  const handleError = () => {
    clearTimeout(timeoutId);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {hasError && (
        <p style={{ color: 'red' }}>Failed to load image or timed out.</p>
      )} {
      !hasError && (<img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading || hasError ? 'none' : 'block' }}
      />)
    }

    </div>
  );
};
