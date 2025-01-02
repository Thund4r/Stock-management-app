import { useEffect, useState } from "react";

export default function Cart() {
    const [cart, setCart] = useState([])
    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem("cart")) || [])
      }, []);

    return(
        <div>
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>The cart is empty.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.product} - Quantity: {item.quantity}
              </li>
            ))}
          </ul>
        )}
        </div>
    )
}