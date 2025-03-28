import React from 'react';
import styles from './MenuScreen.module.css';
import { MenuButton } from '../MenuButton/MenuButton';

interface MenuScreenProps {
  onStartGame: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame }) => {
  return (
    <div className={styles.menuScreen}>
      <div className={styles.menuContainer}>
        <h1 className={styles.title}>Exillis</h1>
        <div className={styles.buttonContainer}>
          <MenuButton onClick={onStartGame}>Start Game</MenuButton>
          <MenuButton onClick={() => {}} disabled>Load Game</MenuButton>
          <MenuButton onClick={() => {}} disabled>Settings</MenuButton>
        </div>
      </div>
    </div>
  );
};
