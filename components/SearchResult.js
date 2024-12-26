import { useEffect, useState } from "react";
import styles from './SearchResult.module.css'

export default function SearchResult ({name, category, initial}) {

    const [content, setContent] = useState(<></>);

    async function handleGet() {
        if (!name){
            if (initial.length !== 0){
                setContent(initial.map(item => (
                    <a href = {`/products/${encodeURIComponent(JSON.stringify(item))}`} key = {item.Name} className={styles.item}> 
                        <div className={styles.itemContent}>
                            <b>{item.Name}</b> <br/>
                            RM {item.Price} <br/>
                        </div>
                    </a>
                )));
            }
        }

        else{
            const response = await fetch(`/.netlify/functions/products?category=${category}&name=${name}`, {
                method: "GET"
            });
            const data = await response.json();
            if (data.length !== 0){
                setContent(data.map(item => (
                    <a href = {`/products/${encodeURIComponent(JSON.stringify(item))}`} key = {item.Name} className={styles.item}> 
                        <div className={styles.itemContent}>
                            <b>{item.Name}</b> <br/>
                            RM {item.Price} <br/>
                        </div>
                    </a>
                )));
            }
        }

    }


    useEffect(() => {
            handleGet();
    }, [name]);

    return (
    <div className = {styles.result}>
        {content}
    </div>)
}