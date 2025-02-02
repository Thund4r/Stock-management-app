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



export default function page() {
    const searchParams = useSearchParams();
    const {replace} = useRouter();
    const pathname = usePathname();
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState(null);
    const [categories, setCategories] = useState(null)

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
          setCategories([...new Set(products.map(item => item.Category))]);
        }
        else{
          setProducts(JSON.parse(sessionStorage.getItem("products")))
          setCategories([...new Set(JSON.parse(sessionStorage.getItem("products")).map(item => item.Category))]);
        }
      }

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
                    {categories && categories.map(cat => {
                        const checked = searchParams.getAll('category').includes(cat);
                        return(
                        <Group wrap="nowrap" key={cat}>
                            <input type="checkbox" id={cat} checked={checked} onChange={(e) => filterClick(cat, e.target.checked)}/>
                            <label htmlFor={cat}>{cat}</label>
                        </Group>)
                    })}
                    </Stack>
                    {products && <SearchResult name = {searchParams.get("name")} category = {searchParams.getAll("category")} products = {products}/>}
                </Group>
            <Cart cart = {cart} setCart = {setCart}/>
            </main>
        </div>
    );
}
