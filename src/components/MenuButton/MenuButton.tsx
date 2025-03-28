import React from 'react';
import styles from './MenuButton.module.css';

interface MenuButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const MenuButton: React.FC<MenuButtonProps> = ({ onClick, disabled = false, children }) => {
  return (
    <button 
      className={`${styles.menuButton} ${disabled ? styles.disabled : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
