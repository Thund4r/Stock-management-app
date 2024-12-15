import Head from 'next/head'
import ClickableCard from '@components/ClickableCard'
import { useEffect, useState } from 'react'

export default function Home() {

    const [products, setProducts] = useState([])
    
    useEffect(() => {
        getProductCat()
      }, []);

    const getProductCat = async () => {
        const params = {
            Category: "Cheese"
                  };
        const response = await fetch("/.netlify/functions/getProductCat", {
            method: "POST",
            body: JSON.stringify(params),
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