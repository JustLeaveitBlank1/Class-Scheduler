import "./navigation.css";
import React, { useMemo } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { SemanticICONS, DropdownMenu, MenuMenu, IconGroup, ImageGroup } from "semantic-ui-react";
import logo from "../../assets/sched.png";
import { UserDto } from "../../constants/types";
import { logoutUser } from "../../authentication/authentication-services";
type PrimaryNavigationProps = {
  user?: UserDto;
};
type NavigationItem = {
  text: string;
  icon?: SemanticICONS | undefined;
  hide?: boolean;
} & (
  | {
      nav: Omit<
        NavLinkProps,
        keyof React.AnchorHTMLAttributes<HTMLAnchorElement>
      >;
      children?: never;
    }
  | { nav?: never; children: NavigationItem[] }
);
//navigation buttons
const DesktopNavigation = () => {
  const navigation: NavigationItem[] = useMemo(() => {
    return [
      {
        text: "Home",
        icon: "home",
        hide: false,
        nav: {
          to: '/',
        },
      },
      {
        text: "Courses",
        icon: "book",
        hide: false,
        nav: {
          to: '/courses',
        },
      },
      {
        text: "Add User",
        icon: "user",
        hide: false,
        nav: {
          to: '/users/create',
        },
      },
      
      {
        text: "User",
        icon: "user",
        hide: false,
        nav: {
          to: 'user',
        },
      },

    ];
  }, []);
  return (
    <MenuMenu
      secondary
      role="navigation"
      className="desktop-navigation"
      size="large"
    >
      {navigation
        .filter((x) => !x.hide)
        .map((x, i) => {
          if (x.children) {
            return (
              <DropdownMenu
                key={i}
                trigger={
                  <span>
                    {x.icon && <IconGroup size="small" fitted name={x.icon} />}{" "}
                    {x.text}
                  </span>
                }
                pointing
                className="link item"
              >
                <DropdownMenu.Menu>
                  {x.children
                    .filter((x) => !x.hide)
                    .map((y) => {
                      return (
                        <DropdownMenu.Item
                          key={`${y.text}`}
                          as={NavLink}
                          to={y.nav?.to}
                        >
                          {y.icon && <IconGroup size="small" fitted name={y.icon} />}{" "}
                          {y.text}
                        </DropdownMenu.Item>
                      );
                    })}
                </DropdownMenu.Menu>
              </DropdownMenu>
            );
          }
          return (
            <MenuMenu.Item key={i} as={NavLink} {...x.nav}>
              {x.icon && <IconGroup size="small" name={x.icon} />} {x.text}
            </MenuMenu.Item>
          );
        })}
    </MenuMenu>
  );
};
//container nav stuff at the top
export const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  user,
}) => {
  return (
    <MenuMenu secondary className="top-navigation">
      <MenuMenu.Item
        as={user ? NavLink : ""}
        to={'/'}
        className="logo-menu-item"
      >
        <ImageGroup size="mini" src={logo} alt="logo" className="logo" />
      </MenuMenu.Item>
      {user && (
        <>
          <DesktopNavigation />
          <MenuMenu.Menu position="right">
            <DropdownMenu
              item
              className="user-icon"
              trigger={
                <span
                  className="user-icon-initial"
                  title={`${user.firstName} ${user.lastName}`}
                >
                  {user.firstName.substring(0, 1).toUpperCase()}
                  {user.lastName.substring(0, 1).toUpperCase()}
                </span>
              }
              icon={null}
            >
              <DropdownMenu.Menu>
                <DropdownMenu.Item
                  onClick={async () => {
                    logoutUser();
                  }}
                >
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Menu>
            </DropdownMenu>
          </MenuMenu.Menu>
        </>
      )}
    </MenuMenu>
  );
};
