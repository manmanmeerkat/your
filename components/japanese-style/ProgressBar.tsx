// ProgressBar.tsx
import React, { useEffect, useState } from "react";

export const ProgressBar: React.FC = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const calculateScrollPercentage = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percentage = (scrollTop / scrollHeight) * 100;
      setScrollPercentage(Math.min(percentage, 100));
    };

    window.addEventListener("scroll", calculateScrollPercentage);
    // 初回ロード時に一度計算
    calculateScrollPercentage();

    return () => {
      window.removeEventListener("scroll", calculateScrollPercentage);
    };
  }, []);

  return (
    <div className="japanese-style-modern-progress-container">
      <div
        className="japanese-style-modern-progress-bar"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
};
