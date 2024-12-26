import Head from 'next/head'
import ClickableCard from '@components/ClickableCard'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Search from '@components/Search'
import SearchResult from '@components/SearchResult'

export default function Test({initial}) {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    
    
    // useEffect(() => {
    //     getProductCat()
    //   }, []);

    const getProductCat = async () => {
        const category = "Cheese";
        const params = {
            Category: category
                  };
        const response = await fetch(`/.netlify/functions/products?Category=${category}&Name=Com`, {
            method: "GET"
        });
        setProducts(await response.json());
      }

    
    return(
        <div>
            <main>
                <Head>
                    <title>Test page</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Search/>
                <SearchResult name = {searchParams.get("name")} category = {searchParams.get("category")} initial = {initial}/>
                {/*<ClickableCard data={products} title = ""/>*/}
                
            </main>
        </div>
    );
}


export async function getServerSideProps(context) {

    const { name = '', category = '' } = context.query;
    const response = await fetch(`http://localhost:8888/.netlify/functions/products?category=${category}&name=${name}`, {
        method: "GET"
    });
    const initial = await response.json();

    return {
        props: {
            initial,
        },
    };
}
