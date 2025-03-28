import React, { useEffect } from 'react';
import styles from './IntroScreen.module.css';

interface IntroScreenProps {
  onIntroComplete: () => void;
}

const INTRO_DURATION = 3000; // 3 seconds

export const IntroScreen: React.FC<IntroScreenProps> = ({ onIntroComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onIntroComplete();
    }, INTRO_DURATION);

    return () => clearTimeout(timer);
  }, [onIntroComplete]);

  return (
    <div className={styles.introScreen}>
      {/* Add any intro animations or content here */}
    </div>
  );
};
