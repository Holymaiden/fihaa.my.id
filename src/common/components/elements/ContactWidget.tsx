'use client';

import { useState } from 'react';
import { HiOutlineMail, HiOutlineX } from 'react-icons/hi';

import { SOCIAL_MEDIA } from '@/common/constant/menu';

const ContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sora">
      {/* Contact Links */}
      {isOpen && (
        <div className="mb-4 space-y-2">
          {SOCIAL_MEDIA.map((link, index) => {
            const Icon = link.icon;
            return (
              <div
                key={link.title}
                className="transform transition-all duration-300 ease-out"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isOpen
                    ? 'fadeInUp 0.3s ease-out forwards'
                    : 'fadeOutDown 0.3s ease-out forwards',
                }}
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 rounded-lg ${link.className}  border p-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
                  title={`Contact via ${link.title}`}
                >
                  {Icon}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {link.title}
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/25 ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
      >
        {isOpen ? (
          <HiOutlineX className="h-6 w-6" />
        ) : (
          <HiOutlineMail className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10 bg-black bg-opacity-25"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactWidget;
