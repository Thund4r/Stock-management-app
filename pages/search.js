import Head from 'next/head'
import Header from '@components/Header'
import ClickableCard from '@components/ClickableCard'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Search from '@components/Search'
import SearchResult from '@components/SearchResult'
import CustomerNav from '@components/CustomerNav'

export default function search({initial, categories}) {
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
        <div className="container">
            <main>
                <Head>
                    <title>Test page</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header title="10 Gram Gourmet Sdn Bhd"/>
                <CustomerNav/>
                <Search/>
                <SearchResult name = {searchParams.get("name")} category = {searchParams.getAll("category")} initial = {initial}/>
                {searchParams.get("category")}
                {/*<ClickableCard data={products} title = ""/>*/}
                
            </main>
        </div>
    );
}


export async function getServerSideProps(context) {

    const { name = '', category = '' } = context.query;
    let categoryURL = `category=${category}&`;
    if (category.constructor === Array){
        categoryURL = category.map(cat => 
            `category=${cat}&`
        ).join("")
    }
    console.log(category);
    const response = await fetch(`http://localhost:8888/.netlify/functions/products?${categoryURL}name=${name}`, {
        method: "GET"
    });
    const initial = await response.json();
    const categories = [...new Set(initial.map(item => item.Category))];

    return {
        props: {
            initial,
            categories,
        },
    };
}
