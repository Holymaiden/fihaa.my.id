'use client';

import AOS from 'aos';
import { useEffect } from 'react';

/** Inisialisasi animasi AOS khusus portfolio 2D. */
const AosInit = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      delay: 50,
    });
  }, []);

  return null;
};

export default AosInit;
