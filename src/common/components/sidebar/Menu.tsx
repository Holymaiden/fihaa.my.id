import type { MenuItemProps } from '@/common/types/menu';

import MenuItem from './MenuItem';

type MenuProps = {
  title?: string;
  list: MenuItemProps[];
};

const Menu = ({ title, list }: MenuProps) => {
  return (
    <nav
      className="flex flex-col space-y-1"
      aria-label={title || 'Navigation menu'}
    >
      {title && (
        <div className="hidden lg:block text-sm ml-2 mt-1 mb-2 text-neutral-600 dark:text-neutral-500 font-sora">
          {title}
        </div>
      )}
      {list?.map((item: MenuItemProps, index: number) => (
        <MenuItem key={item.href || index} {...item} />
      ))}
    </nav>
  );
};

export default Menu;
