import { CONTACT } from '@content/contact';

import type { ContactChannel, ContactLink } from './types';

export const getContactLinks = (): ContactLink[] => CONTACT.links;

export const getContactLink = (
  channel: ContactChannel,
): ContactLink | undefined =>
  CONTACT.links.find((link) => link.channel === channel);

export const getResumeUrl = (): string => CONTACT.resumeUrl;
