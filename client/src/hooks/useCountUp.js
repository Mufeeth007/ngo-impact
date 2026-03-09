import { useState, useEffect, useRef } from 'react';

export const useCountUp = (endValue, duration = 2000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (endValue === 0) return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(percentage * endValue));

      if (percentage < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [endValue, duration]);

  return count;
};