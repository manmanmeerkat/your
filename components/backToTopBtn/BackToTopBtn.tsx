'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
    onClick={scrollToTop}
    className={`fixed bottom-6 right-6 z-50 
        w-12 h-12 flex items-center justify-center
        rounded-full 
        border border-[#df7163]  bg-[#df7163]  text-white 
        hover:bg-white hover:text-[#df7163]  hover:border-[#df7163]  hover:font-bold
        shadow-md hover:shadow-lg transition-all duration-300
        ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    aria-label="Back to top"
    >
    <ArrowUp strokeWidth={4} />
    </Button>
  );
}
