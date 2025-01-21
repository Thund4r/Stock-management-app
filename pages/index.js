import Head from 'next/head'
import Header from '@components/Header'
import { useEffect, useState } from 'react'
import CustomerNav from '@components/CustomerNav'
import ClickableCard from '@components/ClickableCard'
import Cart from '@components/Cart'

export default function Home({initial}) {

  const [cart, setCart] = useState([]);


  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
  }, []);

  const testFunction = () => {
    const payload = JSON.stringify({
        custName: "fake",
        cart: cart,
        delivDate: "1/1/2003",
        outName:"TN1",
    });
    const response = fetch('http://localhost:8888/.netlify/functions/orders', {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: payload
    })
    console.log(response)
  }

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
        <button onClick={() => testFunction()}> CLICK ME </button>
      </main>
      
      <Cart cart={cart} setCart={setCart}/>
      

    </div>
  )
}

export async function getServerSideProps() {

  const response = await fetch(`http://localhost:8888/.netlify/functions/products?name=`, {
      method: "GET"
  });
  const initial = await response.json();

  return {
      props: {
          initial,
      },
  };
}
