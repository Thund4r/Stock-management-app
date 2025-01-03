import Head from "next/head";
import { useEffect, useState } from "react";
import QtSelector from "@components/QtSelector";

export default function Cart() {
    const [cart, setCart] = useState([])
    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem("cart")) || [])
      }, []);

    return(
        <div className="container">
          <Head>
            <title>Checkout</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
        <h2>Items</h2>
        {cart.length === 0 ? (
          <p>The cart is empty.</p>
        ) : (
          <ul>
            <form>
            {cart.map((item, index) => (
              <li key={index}>
                <div style={{ marginBottom: "8px"}}>
                  {item.product} - Quantity: {item.quantity}
                </div>
                <b style={{ display: "block", marginBottom: "16px"}}>RM {item.price}</b>
                <QtSelector/>
              </li>
            ))}
            </form>
          </ul>
        )}
        </div>
    )
}