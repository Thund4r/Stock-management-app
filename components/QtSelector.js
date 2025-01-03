import { useState } from 'react';
import styles from './QtSelector.module.css';

export default function QtSelector({}) {

const [quantity, setQuantity] = useState(1);

const increment = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    //onQuantityChange(newQuantity);
};

const decrement = () => {
    if (quantity > 0) {
        const newQuantity = quantity - 1;
        setQuantity(newQuantity);
        //onQuantityChange(newQuantity);
    }
};

const inputChange = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) { //RegEx expression here is ^(match at beginning of text) [0-9](only numbers between 0 and 9 for each digit) +(one or more digits) and $(match up to the end of text)
      const newQuantity = value === "" ? 0 : parseInt(value, 10);
      setQuantity(newQuantity);
      //onQuantityChange(newQuantity);
    }
};

    return(
        <div className={styles.container}>
            <button className={styles.button} onClick={decrement} type="button"> - </button>
            <input 
                className={styles.input}
                type="text"
                value={quantity}
                onChange={inputChange}
            />
            <button className={styles.button} onClick={increment} type="button"> + </button>
        </div>
    )

}