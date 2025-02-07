import { useState } from 'react';
import styles from './QtSelector.module.css';

export default function QtSelector({onQuantityChange, initialQuant = 1, maxQuant = 9000}) {

const [quantity, setQuantity] = useState(initialQuant);

const increment = () => {
    if (quantity < maxQuant){
        const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
    }
};

const decrement = () => {
    if (quantity > 1 ) {
        const newQuantity = quantity - 1;
        setQuantity(newQuantity);
        onQuantityChange(newQuantity);
    }
};

const inputChange = (event) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
        const newQuantity = value === "" ? "" : Math.min(maxQuant, Math.max(1, parseInt(value, 10)));
        setQuantity(newQuantity);
        if (newQuantity !== "") {
            onQuantityChange(newQuantity);
        }
    }
};

const handleBlur = () => {
    console.log(quantity)
    if (quantity === "") {
        setQuantity(1);
        onQuantityChange(1);
    }
};

    return(
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
    )

}