import React from 'react';
import styles from './style.module.scss';

interface ButtonProps {
  icon?: string;
  text?: string;
  color: string;
  type: 'text' | 'contained';
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ icon, text, color, type, onClick }) => {
  return (
    <button
      className={`${styles.button} ${type === 'contained' ? styles.contained : styles.text}`}
      style={{
        backgroundColor: type === 'contained' ? color : '#ffffff',
        color: type === 'contained' ? '#ffffff' : color,
        borderColor: color,
      }}
      onClick={onClick}
    >
      {icon && <img src={icon} alt="icon" className={styles.icon} />}
      {text && <span className={styles.text}>{text}</span>}
    </button>
  );
};

export default Button;
