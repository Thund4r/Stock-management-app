import { useEffect, useState } from "react";
import styles from './SearchResult.module.css'
import { Grid, Col } from '@mantine/core'

export default function SearchResult ({name, category, initial}) {

    const [content, setContent] = useState(<></>);

    async function handleGet() {
        console.log(category.length)
        if (!name && category.length === 0){
            if (initial.length !== 0){
                setContent(initial.map(item => (
                    <Grid.Col span={3} key = {item.Name}>
                        <a href = {`/products/${encodeURIComponent(JSON.stringify(item))}`} key = {item.Name} className={styles.item}> 
                            <div className={styles.itemContent}>
                                <b>{item.Name}</b> <br/>
                                RM {item.Price} <br/>
                            </div>
                        </a>
                    </Grid.Col>
                )));
            }
        }

        else{
            const categories = category.map(cat => 
                `category=${cat}&`
            ).join("")
            const response = await fetch(`/.netlify/functions/products?${categories}name=${name}`, {
                method: "GET"
            });
            const data = await response.json();
            if (data.length !== 0){
                setContent(data.map(item => (
                    <Grid.Col span={3} key = {item.Name}>
                        <a href = {`/products/${encodeURIComponent(JSON.stringify(item))}`} className={styles.item}> 
                            <div className={styles.itemContent}>
                                <b>{item.Name}</b> <br/>
                                RM {item.Price} <br/>
                            </div>
                        </a>
                    </Grid.Col>
                )));
            }
            else {
                setContent(<div>No results</div>)
            }
        }

    }


    useEffect(() => {
            handleGet();
    }, [name, category]);

    return (
        <>
    {/* <div className = {styles.result}>
        {content}
    </div> */}
    
    <Grid justify="flex-start" gutter="30">
        {content}
    </Grid>
    </>)
}