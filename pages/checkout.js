import Head from "next/head";
import Header from '@components/Header'
import { useEffect, useState } from "react";
import QtSelector from "@components/QtSelector";
import styles from './checkout.module.css';
import { TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';


export default function Cart() {
    const [cart, setCart] = useState([]);
    const [date, setDate] = useState(null);
    const [customerName, setCustomerName] = useState("");
    const [outletName, setOutletName] = useState("");

    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem("cart")) || [])
      }, []);

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

    const totalPrice = () => {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return (total)
    }

    const submitForm = async (event) => {
      event.preventDefault();

      const payload = JSON.stringify({
        custName: customerName,
        cart: cart,
        delivDate: date.toLocaleDateString("en-GB"),
        outName: outletName,
      })
      
      const response = fetch('http://localhost:8888/.netlify/functions/orders', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: payload
      })

    }

    return(
        <div className="container">
          <Head>
            <title>Checkout</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
        <Header title="10 Gram Gourmet Sdn Bhd" />
        {cart.length === 0 ? (
          <p>The cart is empty.</p>
        ) : (
          <ul>
            <form onSubmit={submitForm}>
            <div className={styles.formComponent}>
            <h4>Customer</h4>
            <TextInput 
              id="cusName"
              label="Name"
              required
              onChange={(e) => setCustomerName(e.target.value)}
            />
            </div>

            <div className={styles.formComponent}>
              <h4>Items</h4>
              {cart.map((item, index) => (
                <li key={index}>
                  <div style={{ marginBottom: "8px"}}>
                    {item.product} 
                  </div>
                  <div className={styles.rowContainer}>
                  <b style={{ display: "block", marginBottom: "16px"}}>RM {item.price}</b> <div style={{cursor:"pointer", color:"rgba(0,0,0,0.7)"}}onClick={() => {removeItem(item)}}>delete</div>
                  </div>
                  <QtSelector onQuantityChange={(newQuantity) => updateQuant(item, newQuantity)} initialQuant={item.quantity} maxQuant={item.stock}/>
                </li>
              ))}
            </div>

            <div className={styles.formComponent}>
              <DateInput 
              value={date} 
              valueFormat="YYYY/MM/DD"
              onChange={setDate} 
              required
              label="Select your delivery/pickup date"
              />
            </div>

            <div className={styles.formComponent}>
              <TextInput 
              id="outName"
              label="Insert Your Outlet Name (CJ1, CJ2, 10Thai, 10PotsCJ, ICM, PJ1, 10PotsPJ)"
              required
              onChange={(e) => setOutletName(e.target.value)}
            />
            </div>

            <div className={styles.formComponent}> 
              <h4>Order Summary</h4>
              <div className={styles.rowContainer}>
              <div>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</div>
              <div>RM {totalPrice()}</div>
              </div>
            </div>
            
            <button>Place Order</button>
            </form>
          </ul>
        )}
        </div>
    )
}