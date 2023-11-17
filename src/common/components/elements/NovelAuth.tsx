"use client";

import { Combobox, Dialog, Transition } from "@headlessui/react";
import { Fragment, useContext, useEffect, useState } from "react";
import { BiKey as KeyIcon, BiArrowFromLeft as LoginIcon } from "react-icons/bi";

import { NovelAuthContext } from "@/common/context/NovelAuthContext";
import clsx from "clsx";

const NovelAuth = () => {
  const [query, setQuery] = useState("");

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
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        onClose={() => null}
        className="fixed inset-0 z-[999] overflow-y-auto p-4 pt-[45vh] font-sora"
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-neutral-600/90 dark:bg-neutral-900/90" />
        </Transition.Child>

        <Dialog.Panel>
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition-transform duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Combobox
              as="div"
              className="relative mx-auto max-w-xl overflow-hidden rounded-xl border-2 border-neutral-100 bg-white shadow-3xl ring-1 ring-black/5 dark:divide-neutral-600 dark:border-neutral-800 dark:bg-[#1b1b1b80] backdrop-blur"
            >
              <div
                className={clsx(
                  "flex gap-3 items-center border-b border-neutral-300 dark:border-neutral-800 px-4",
                  error && "!border-red-500"
                )}
              >
                <KeyIcon size={22} />

                <Combobox.Input
                  onChange={handleSearch}
                  className={clsx(
                    "h-14 w-full border-0 bg-transparent text-neutral-800 placeholder-neutral-500 focus:outline-none focus:ring-0 dark:text-neutral-200 font-sora",
                    error && " !placeholder-red-500"
                  )}
                  placeholder={error ? error : "Enter your key here..."}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                />
                <Combobox.Button
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={handleSubmit}
                >
                  <LoginIcon
                    size={22}
                    className="text-neutral-500 dark:text-neutral-300"
                  />
                </Combobox.Button>
              </div>
            </Combobox>
          </Transition.Child>
        </Dialog.Panel>
      </Dialog>
    </Transition.Root>
  );
};

export default NovelAuth;
