'use client';

import 'nprogress/nprogress.css';

import NProgress from 'nprogress';
import { useEffect } from 'react';

type PushStateInput = [
  data: unknown,
  unused: string,
  url?: string | URL | null | undefined,
];

NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});
export default function ProgressBar() {
  useEffect(() => {
    NProgress.configure({
      minimum: 0.3,
      easing: 'ease',
      speed: 500,
      showSpinner: false,
    });

    const handleAnchorClick = (event: MouseEvent) => {
      const targetUrl = (event.currentTarget as HTMLAnchorElement).href;
      const currentUrl = window.location.href;
      if (targetUrl !== currentUrl) {
        NProgress.start();
      }
    };

    const handleMutation: MutationCallback = () => {
      const anchorElements: NodeListOf<HTMLAnchorElement> =
        document.querySelectorAll('a[href]');

      anchorElements.forEach((anchor) =>
        anchor.addEventListener('click', handleAnchorClick),
      );
    };

    const mutationObserver = new MutationObserver(handleMutation);

    mutationObserver.observe(document, { childList: true, subtree: true });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray: PushStateInput) => {
        NProgress.done();
        return target.apply(thisArg, argArray);
      },
    });
  });

  return null;
}
