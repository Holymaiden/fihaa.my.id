'use client';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import clsx from 'clsx';
import { useContext, useEffect, useState } from 'react';
import { BiArrowFromLeft as LoginIcon, BiKey as KeyIcon } from 'react-icons/bi';

import { NovelAuthContext } from '@/common/context/NovelAuthContext';

const NovelAuth = () => {
  const [query, setQuery] = useState('');

  const { isOpen, setIsOpen, error, setCookie, getCookie } =
    useContext(NovelAuthContext);

  const handleSearch = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => setQuery(value);

  const handleSubmit = () => {
    setCookie(query);
  };

  useEffect(() => {
    if (!error && isOpen) {
      setIsOpen(!getCookie());
    }
    // eslint-disable-next-line
  }, [error]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      className="relative z-[999] font-sora"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-neutral-600/90 dark:bg-neutral-900/90 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 overflow-y-auto p-4 pt-[45vh]">
        <DialogPanel
          transition
          className="relative mx-auto max-w-xl overflow-hidden rounded-xl border-2 border-neutral-100 bg-white shadow-3xl ring-1 ring-black/5 dark:divide-neutral-600 dark:border-neutral-800 dark:bg-[#1b1b1b80] backdrop-blur transition-all duration-200 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
        >
          <div
            className={clsx(
              'flex gap-3 items-center border-b border-neutral-300 dark:border-neutral-800 px-4',
              error && '!border-red-500',
            )}
          >
            <KeyIcon size={22} />

            <input
              onChange={handleSearch}
              className={clsx(
                'h-14 w-full border-0 bg-transparent text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-0 dark:text-neutral-200 font-sora',
                error && ' !placeholder-red-500',
              )}
              placeholder={error ? error : 'Enter your key here...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-4"
              onClick={handleSubmit}
            >
              <LoginIcon
                size={22}
                className="text-neutral-500 dark:text-neutral-300"
              />
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default NovelAuth;
