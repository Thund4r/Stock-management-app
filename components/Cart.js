import { useState } from 'react';
import styles from './Cart.module.css';
export default function Cart({cart = []}) {

    const [cartOpen, setCartOpen] = useState(false);

    const toggleCart = () => {
        setCartOpen(!cartOpen);
      }

    return (
    <>
    {cartOpen && <div className={styles.backdrop} onClick={toggleCart}></div>}
    <div className={`${styles.cart} ${cartOpen ? styles.open : ""}`}>
        <ul>
        {cart.map((item, index) => (
              <li key={index}>
                {item.product} - Quantity: {item.quantity}
              </li>
            ))}
        </ul>
        <a className={`${styles.checkoutButton} ${cartOpen ? "" : styles.dissapear}`} href='/cart'> Checkout </a>
    </div>
    <div className={`${styles.cartButton} ${cartOpen ? styles.dissapear : ""}`} onClick={toggleCart}>CART</div>
    </>
    )
}