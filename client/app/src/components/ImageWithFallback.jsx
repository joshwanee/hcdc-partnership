import { useState } from "react";

export default function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={
        !error
          ? src
          : "https://via.placeholder.com/800x600?text=Image+Unavailable"
      }
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
