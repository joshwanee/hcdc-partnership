import { useState } from "react";
import noImage from "../assets/no_image.webp";

export default function ImageWithFallback({ src, alt, className, ...rest }) {
  const [error, setError] = useState(false);

  const resolved = !error && src ? src : noImage;

  return (
    <img
      src={resolved}
      alt={alt || "no_image"}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
}
