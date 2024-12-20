import Head from 'next/head'
import ClickableCard from '@components/ClickableCard'
import { useEffect, useState } from 'react'

export default function Home() {

    const [products, setProducts] = useState([])
    
    
    useEffect(() => {
        getProductCat()
      }, []);

    const getProductCat = async () => {
        const category = "Cheese";
        const params = {
            Category: category
                  };
        const response = await fetch(`/.netlify/functions/products?Category=${category}`, {
            method: "GET"
        });
        setProducts(await response.json());
        console.log(products);
      }
    

    
    return(
        <div>
            <main>
                <Head>
                    <title>Test page</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <ClickableCard data={products} title = ""/>
            </main>
        </div>
    )
}