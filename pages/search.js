import Head from 'next/head'
import Header from '@components/Header'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import Search from '@components/Search'
import SearchResult from '@components/SearchResult'
import CustomerNav from '@components/CustomerNav'


export default function search({initial, categories}) {
    const searchParams = useSearchParams();
    const {replace} = useRouter();
    const pathname = usePathname();
    

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
            <main>
                <Head>
                    <title>Search</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <Header title="10 Gram Gourmet Sdn Bhd"/>
                <CustomerNav/>
                <Search/>
                {categories.map(cat => {
                    const checked = searchParams.getAll('category').includes(cat);
                    return(
                    <div key={cat}>
                        <input type="checkbox" id={cat} checked={checked} onChange={(e) => filterClick(cat, e.target.checked)}/>
                        <label htmlFor={cat}>{cat}</label>
                    </div>)
                })}
                <SearchResult name = {searchParams.get("name")} category = {searchParams.getAll("category")} initial = {initial}/>
                
                
            </main>
        </div>
    );
}


export async function getServerSideProps(context) {

    const response = await fetch(`http://localhost:8888/.netlify/functions/products?category=&name=`, {
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
