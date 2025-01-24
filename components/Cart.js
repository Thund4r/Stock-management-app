import { useState } from 'react';
import styles from './Cart.module.css';
import QtSelector from './QtSelector';
import { Grid } from '@mantine/core';
export default function Cart({cart = [], setCart}) {

    const [cartOpen, setCartOpen] = useState(false);

    const toggleCart = () => {
        setCartOpen(!cartOpen);
    }

    const updateQuant = (item, newQuantity) => {
      const itemIndex = cart.findIndex((oldItem) => oldItem.product === item.product)
      const newCart = [...cart];
      newCart[itemIndex].quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
    }

    const removeItem = (item) => {
      const itemIndex = cart.findIndex((oldItem) => oldItem.product === item.product)
      const newCart = [...cart];
      newCart.splice(itemIndex, 1);
      localStorage.setItem("cart", JSON.stringify(newCart));
      setCart(newCart);
    }

    return (
    <>
    {cartOpen && <div className={styles.backdrop} onClick={toggleCart}></div>}
    <div className={`${styles.cart} ${cartOpen ? styles.open : ""}`}>
      <h4 style={{ padding: "10px"}}>Cart</h4>
        {cart.map((item, index) => (
          <div style={{ padding: "10px"}} key={index}>
            <div style={{ marginBottom: "5px"}}>
              {item.product} 
            </div>
            <Grid justify="space-between" p="10px">
              <b style={{ display: "block", marginBottom: "16px"}}>RM {item.price}</b> 
              <div style={{cursor:"pointer", color:"rgba(0,0,0,0.7)"}}onClick={() => {removeItem(item)}}>delete</div>
            </Grid>
            <QtSelector onQuantityChange={(newQuantity) => updateQuant(item, newQuantity)} initialQuant={item.quantity} maxQuant={item.stock}/>
          </div>
            ))}
        <a className={`${styles.checkoutButton} ${cartOpen ? styles.open : ""}`} href='/checkout'> Checkout </a>
    </div>
    <div className={`${styles.cartButton} ${cartOpen ? styles.dissapear : ""}`} onClick={toggleCart}>CART</div>
    </>
    )
}