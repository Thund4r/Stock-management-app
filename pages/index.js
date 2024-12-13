import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useState } from 'react'

export default function Home() {

  const [product, setProduct] = useState()

  const addToCart = () => {
    console.log("test")
  }

  return (
    <div className="container">
      <Head>
        <title>Product page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="This is a test shopping page!" />
        <form>
          <label htmlFor="product">Product:</label>
          <select 
          id="product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}>
            <option value="Bagel">Bagel</option>
            <option value="Cheese">Cheese</option>
          </select>
        </form>
        <button onClick={addToCart}>Submit</button>
      </main>

      <Footer />
    </div>
  )
}
