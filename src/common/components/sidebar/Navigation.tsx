import { MENU_ITEMS } from '@/common/constant/menu';

import Menu from './Menu';

const Navigation = () => {
  const filterdMenu = MENU_ITEMS?.filter((item) => item?.isShow);

  return (
    <nav role="navigation" aria-label="Main navigation">
      <Menu list={filterdMenu} />
    </nav>
  );
};

export default Navigation;
