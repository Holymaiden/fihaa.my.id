import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { BsBuildings as CompanyIcon } from 'react-icons/bs';

import Card from '@/common/components/elements/Card';
import Image from '@/common/components/elements/Image';
import type { CareerProps } from '@/common/types/careers';

const CareerCard = ({
  position,
  company,
  logo,
  location,
  start_date,
  end_date,
  link,
  type,
  location_type,
}: CareerProps) => {
  const parseYearMonth = (dateStr: string): Date => {
    const [year, month] = dateStr.split('-').map(Number);
    return new Date(year, month - 1);
  };

  const startDate = parseYearMonth(start_date);
  const endDate = end_date ? parseYearMonth(end_date) : new Date();

  const durationYears = differenceInYears(endDate, startDate);
  const durationMonths = differenceInMonths(endDate, startDate) % 12;

  let durationText = '';
  if (durationYears > 0) {
    durationText += `${durationYears} Year${durationYears > 1 ? 's' : ''} `;
  }
  if (durationMonths > 0 || durationYears === 0) {
    durationText += `${durationMonths} Month${durationMonths > 1 ? 's' : ''}`;
  }

  return (
    <Card className="flex items-center gap-5 py-4 px-6 border border-neutral-300 dark:border-neutral-900">
      {logo ? (
        <Image
          src={logo}
          width={55}
          height={55}
          alt={company}
          className="h-14 w-14 rounded bg-neutral-50 p-1 hover:scale-110 hover:bg-transparent"
        />
      ) : (
        <CompanyIcon size={50} />
      )}

      <div className="space-y-1">
        <h6>{position}</h6>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <div className="flex items-center gap-1 md:gap-2">
            <a
              href={link || '#'}
              target="_blank"
              data-umami-event={`Click Career Company Name: ${company}`}
            >
              <span className="underline cursor-pointer hover:text-dark hover:dark:text-white">
                {company}
              </span>
            </a>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span>{location}</span>
          </div>
          <div className="flex flex-col md:text-[12px]">
            <div className="flex gap-1">
              <span>{format(startDate, 'MMM yyyy')}</span> -{' '}
              <span>{end_date ? format(endDate, 'MMM yyyy') : 'Present'}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-neutral-500 dark:text-neutral-500">
                {durationText}
              </span>
              <span className="hidden text-neutral-300 dark:text-neutral-700 md:block">
                •
              </span>
              <span>{type}</span>
              <span className="hidden text-neutral-300 dark:text-neutral-700 md:block">
                •
              </span>
              <span>{location_type}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CareerCard;
