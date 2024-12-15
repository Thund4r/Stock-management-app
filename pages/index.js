import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useEffect, useState } from 'react'

export default function Home() {

  const [product, setProduct] = useState("Bagel");
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
  }, []);

  const addToCart = () => {
    const newItem = {product, quantity:parseInt(quantity)};
    const itemExists = cart.findIndex((item) => item.product === newItem.product)
    if (itemExists == -1){
      const newCart = [...cart, newItem];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      console.log("New cart:", newCart);
    }
    else{
      const newCart = [...cart]
      newCart[itemExists].quantity += newItem.quantity;
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      console.log("New cart:", newCart);
    }
  }

  // const addToProducts = async () => {
  //   const params = {
  //       Product: {
  //                 CustomerID: 7236,
  //                 Name: product,
  //                 Quantity: 1
  //               }
  //             };
  //   const cart = await fetch("/.netlify/functions/addToCart", {
  //       method: "POST",
  //       body: JSON.stringify(params),
  //   });
  //   const response = await cart.json();
  //   console.log(response);
  // }

  return (
    <div className="container">

      <Head>
        <title>Product page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="This is a test shopping page!" />
        <a href="/test/">Click Here</a>
        <form>
          <label htmlFor="product">Product:</label>
          <select 
          id="product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}>
            <option value="Bagel">Bagel</option>
            <option value="Cheese">Cheese</option>
            <option value="Jam">Jam</option>
            <option value="Butter">Butter</option>
          </select>
          <label htmlFor="quantity">Quantity:</label>
          <input
          type="number"
          id="quantity"
          min="1"
          max="10"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}/>
        </form>
        <button onClick={addToCart}>Submit  NOW</button>
      </main>
      <div id="cart">
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

      <Footer />
    </div>
  )
}
