import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from 'react';

const _linkClass = (active: Boolean | undefined) => {
  return cn(
    'px-4 py-2.5 flex items-center justify-between text-sidebarLink rounded-xl font-normal',
    'hover:bg-sidebarLinkHover focus:bg-sidebarLinkHover focus:outline-none transition-all duration-200',
  );
}

type SubSType = {
  href?: Url | any
  name: String
  icon?: React.ReactNode,
  active?: Boolean
};

type NavItemProps = {
  title: String,
  leftIcon?: React.ReactNode,
  rightIcon?: Boolean,
  href?: Url | any,
  active?: Boolean,
  subs?: SubSType[]
};

const NavItem = ({ title, leftIcon, href, active, subs }: NavItemProps) => {
  const linkClass = _linkClass(active);
  const linkRef = React.useRef<HTMLDivElement>(null);
  const [menuHeight, setMenuHeight] = React.useState(0);
  const [isOpenSubMenu, setIsOpenSubMenu] = React.useState(false);
  const pathName = usePathname();

  const onOpenSubMenu = () => {
    setIsOpenSubMenu(!isOpenSubMenu);
  };

  React.useEffect(() => {
    if (subs && Array.isArray(subs)) {
      const _subs = subs.map(item => item.href);
      if (_subs.includes(pathName)) {
        setIsOpenSubMenu(true);
      }
    }
  }, [subs, pathName]);

  React.useEffect(() => {
    if (subs && Array.isArray(subs) && subs.length > 0) {
      if (linkRef.current) {
        const { height } = linkRef.current.getBoundingClientRect();
        setMenuHeight(height);
      }
    }
  }, [subs]);

  if (subs && Array.isArray(subs) && subs.length > 0) {
    return (
      <li className="rounded-xl overflow-hidden">
        <div className="relative" ref={linkRef}>
          <Link href={href || '#'} 
            className={cn(
              linkClass, 
              'rounded-none',
              pathName === href && 'bg-sidebarLinkHover text-white rounded-bl-xl rounded-br-xl',
              isOpenSubMenu && 'bg-sidebarLinkHover hover:bg-stone-900 rounded-none',
            )}
          >
            <span className="flex items-center">
              {leftIcon}
              <span className="ms-3">{title}</span>
            </span>
          </Link> 
          <SubMenuToggler active={isOpenSubMenu} onClick={onOpenSubMenu} />
        </div>
        <div
          className={cn(
            'transition-all duration-300 ps-4 pe-2',
            isOpenSubMenu && 'bg-sidebarLinkHover border-t border-t-stone-700 py-2',
          )}
          style={{ 
            height: isOpenSubMenu ? `calc(1rem + ${(menuHeight * subs.length) + 'px'})` : 0 
          }}
        >
          {subs && subs.length > 0 && (
            subs.map((sub, key) => (
              <Link 
                key={key}
                href={sub.href || '#'} 
                className={cn(
                  linkClass, 
                  // 'rounded-none',
                  'hover:bg-stone-900',
                  pathName === sub.href && 'bg-stone-900'
                )}
              >
                <span className="flex items-center">
                  {sub.icon}
                  <span className="ms-3">{sub.name}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      </li>
    );
  }
  
  return (
    <li className="relative">
      <Link 
        href={href || '#'} 
        className={cn(
          linkClass, 
          pathName === href && 'bg-sidebarLinkHover text-white'
        )}
      >
        <span className="flex items-center">
          {leftIcon}
          <span className="ms-3">{title}</span>
        </span>
      </Link>
    </li>
  )
}

const SubMenuToggler = React.forwardRef((
  { active, direction = 'right', onClick, ...rest }: { active: Boolean, direction?: String, onClick?: () => void },
  ref: any
) => {
  const iconProps = {
    strokeWidth: 1,
    width: 18,
    height: 18,
  }

  return (
    <button 
      className={cn(
        'h-[70%] px-1.5 absolute right-0 top-1/2 translate-y-[-50%] focus:outline-none',
        'hover:bg-stone-900 text-stone-300 rounded-xl',
        active && 'bg-stone-900'
      )}
      onClick={onClick}
      {...rest}
      ref={ref}
    >
      <ChevronRight {...iconProps} 
        className={cn(
          'transition-transform duration-200',
          active ? 'rotate-90' : 'rotate-0'
        )}
      />
    </button>
  );
});

NavItem.displayName = 'NavItem';
SubMenuToggler.displayName = 'SubMenuToggler';

export default NavItem;