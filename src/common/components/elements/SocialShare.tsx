'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import {
  HiOutlineClipboard,
  HiOutlineClipboardCheck,
  HiOutlineShare,
} from 'react-icons/hi';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  via?: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description = '',
  via = 'fihaa_dev',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fullUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const shareData = {
    title,
    text: description,
    url: fullUrl,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title,
    )}&url=${encodeURIComponent(fullUrl)}&via=${via}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      fullUrl,
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      fullUrl,
    )}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `${title} ${fullUrl}`,
    )}`,
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error('Error sharing:', err);
      });
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleCopyClick = () => {
    copyToClipboard().catch((err) => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className={`relative ${className} font-sora`}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Share this content"
      >
        <HiOutlineShare className="h-4 w-4" />
        Share
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 p-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700">
          <div className="space-y-1">
            <Link
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FaTwitter className="h-4 w-4 text-blue-500" />
              Twitter
            </Link>

            <Link
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FaFacebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Link>

            <Link
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FaLinkedin className="h-4 w-4 text-blue-700" />
              LinkedIn
            </Link>

            <Link
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FaWhatsapp className="h-4 w-4 text-green-600" />
              WhatsApp
            </Link>

            <button
              onClick={handleCopyClick}
              className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {copied ? (
                <HiOutlineClipboardCheck className="h-4 w-4 text-green-600" />
              ) : (
                <HiOutlineClipboard className="h-4 w-4" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default SocialShare;
