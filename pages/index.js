import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useEffect, useState } from 'react'
import CustomerNav from '@components/CustomerNav'
import ClickableCard from '@components/ClickableCard'

export default function Home({initial}) {

  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
  }, []);

  return (
    <div className="container">

      <Head>
        <title>Product page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="10 Gram Gourmet Sdn Bhd" />
        <CustomerNav/>
        <ClickableCard data={initial} title = ""/>
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
export async function getServerSideProps() {

  const response = await fetch(`http://localhost:8888/.netlify/functions/products?category=&name=`, {
      method: "GET"
  });
  const initial = await response.json();

  return {
      props: {
          initial,
      },
  };
}
