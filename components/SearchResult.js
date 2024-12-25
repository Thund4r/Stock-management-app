import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchResult ({name, category}) {


    console.log(name);
    console.log(category);
    const [content, setContent] = useState(<></>);
    const searchParams = useSearchParams();
    async function handleGet() {
        setContent(<>{name}</>)
        const params = {
            Category: category
                  };
        const response = await fetch(`/.netlify/functions/products?category=${category}&name=${name}`, {
            method: "GET"
        });
        console.log(await response.json())
    }

    useEffect(() => {
            handleGet();
    }, [name]);

    return (
    <div>
        {content}
    </div>)
}