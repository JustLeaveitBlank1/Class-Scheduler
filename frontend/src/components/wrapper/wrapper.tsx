import './wrapper.css'
import React from 'react'
import { User } from '../../constants/types'
import { PrimaryNavigation } from '../navigation/navigation'
type WrapperProps = {
  user?: User;
  children?: React.ReactNode
};
//wrapper that surrounds pages
export const Wrapper: React.FC<WrapperProps> = ({ user, children }) => {
  return (
    <div className="content">
      <PrimaryNavigation user={user} />
      <div className="main-content">{children}</div>
    </div>
  );
};