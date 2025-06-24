import { useState } from 'react';
import styles from './QtSelector.module.css';

export default function QtSelector({ onQuantityChange, quantity, maxQuant = 9000 }) {

  const increment = () => {
    if (quantity < maxQuant) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const inputChange = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      const newQuantity = value === "" ? "" : Math.min(maxQuant, Math.max(1, parseInt(value, 10)));
      if (newQuantity !== "") {
        onQuantityChange(newQuantity);
      }
    }
  };

  const handleBlur = () => {
    if (quantity === "") {
      onQuantityChange(1);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={decrement} type="button"> - </button>
      <input 
        className={styles.input}
        type="text"
        value={quantity}
        onBlur={handleBlur}
        onChange={inputChange}
      />
      <button className={styles.button} onClick={increment} type="button"> + </button>
    </div>
  );
}
