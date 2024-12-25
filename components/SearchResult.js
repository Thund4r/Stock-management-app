import { useEffect, useState } from "react";

export default function SearchResult ({name, category}) {


    console.log(name);
    console.log(category);
    const [content, setContent] = useState(<></>);
    async function handleGet() {
        setContent(<>{name}</>)
        const response = await fetch(`/.netlify/functions/products?category=${category}&name=${name}`, {
            method: "GET"
        });
        const data = await response.json();
        console.log(data);
        if (data.length !== 0){
            setContent(data.map(item => (
                <a href = {`/products/${encodeURIComponent(JSON.stringify(item))}`} key = {item.Name}> 
                    <b>{item.Category} - {item.Name}</b> <br/>
                    RM {item.Price} <br/>
                </a>
            )));
        }
    }

    useEffect(() => {
            handleGet();
    }, [name]);

    return (
    <div>
        {content}
    </div>)
}