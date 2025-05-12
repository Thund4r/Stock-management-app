import Head from 'next/head'
import Header from '@components/Header'
import { useEffect, useState } from 'react'
import CustomerNav from '@components/CustomerComponents/CustomerNav'
import { ClickableCardProduct } from '@components/ClickableCard'
import Cart from '@components/CustomerComponents/Cart'

export default function page() {

  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(null)

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || []);
    checkProducts();
  }, []);

  const checkProducts = async () => {
    if (!(sessionStorage.getItem("products"))){
      const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
          method: "GET"
      });
      const products = await response.json();
      sessionStorage.setItem("products", JSON.stringify(products));
      setProducts(products)
    }
    else{
      setProducts(JSON.parse(sessionStorage.getItem("products")))
    }
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
        {products && <ClickableCardProduct data={products} title="" destinationURL={"/products"}/>}
        <button onClick={()=>testFunction()}> CLICK ME </button>
      </main>
      
      <Cart cart={cart} setCart={setCart}/>

    </div>
  )
}

