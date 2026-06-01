import { useState, useEffect } from 'react'

function useCountdown(targetDateString) {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  })

  useEffect(() => {
    if (!targetDateString) return;

    const target = new Date(targetDateString).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds, isExpired: false });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateString]);

  const formatNumber = (num) => String(num).padStart(2, '0')

  return {
    days: formatNumber(time.days),
    hours: formatNumber(time.hours),
    minutes: formatNumber(time.minutes),
    seconds: formatNumber(time.seconds),
    isExpired: time.isExpired
  }
}

export default useCountdown;
