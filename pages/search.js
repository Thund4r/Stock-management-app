import Head from 'next/head'
import Header from '@components/Header'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Search from '@components/Search'
import SearchResult from '@components/SearchResult'
import CustomerNav from '@components/CustomerNav'
import Cart from '@components/Cart'
import { useEffect, useState } from 'react'
import { Group, Stack } from '@mantine/core';



export default function search({initial, categories}) {
    const searchParams = useSearchParams();
    const {replace} = useRouter();
    const pathname = usePathname();
    const [cart, setCart] = useState([]);

    useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
    }, []);
    

    function filterClick(cat, checked){
        const params = new URLSearchParams(searchParams.toString());

        if (checked) {
            params.append("category", cat)
        }
        else {
            params.delete("category", cat)
        }
        replace(`${pathname}?${params.toString()}`);
    }
    
    return(
        <div className="container">
            
            <Head>
                <title>Search</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Header title="10 Gram Gourmet Sdn Bhd"/>
                <CustomerNav/>
                <Search/>
                <Group wrap="nowrap" w="80vw" align="flex-start">
                    <Stack align="center" style={{ width: "20%", position: "sticky", top: 0,}}>
                    {categories.map(cat => {
                        const checked = searchParams.getAll('category').includes(cat);
                        return(
                        <Group wrap="nowrap" key={cat}>
                            <input type="checkbox" id={cat} checked={checked} onChange={(e) => filterClick(cat, e.target.checked)}/>
                            <label htmlFor={cat}>{cat}</label>
                        </Group>)
                    })}
                    </Stack>
                    <SearchResult name = {searchParams.get("name")} category = {searchParams.getAll("category")} initial = {initial}/>
                </Group>
            <Cart cart = {cart}/>
            </main>
        </div>
    );
}


export async function getServerSideProps(context) {

    const response = await fetch(`http://localhost:8888/.netlify/functions/products?name=`, {
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
