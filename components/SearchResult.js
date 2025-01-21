import { useEffect, useState } from "react";
import { Grid, Col, Container } from '@mantine/core'

export default function SearchResult ({name, category, initial}) {

    const [content, setContent] = useState(<></>);

    const renderContent = (items) => {
        if (items.length !== 0){
            setContent(items.map(item => (
                <Grid.Col 
                    span={3} 
                    
                    key = {item.Name}>
                    <a href = {`/products/${item.Name}`}> 
                        <div>
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

    async function handleGet() {
        if (!name && category.length === 0){
            renderContent(initial);
        }

        else{
            const categories = category.map(cat => 
                `category=${cat}&`
            ).join("")
            const response = await fetch(`/.netlify/functions/products?${categories}name=${name}`, {
                method: "GET"
            });
            const data = await response.json();
            renderContent(data);
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
        <Grid w="80%" justify="flex-start" gutter="40">
            {content}
        </Grid>
    </>)
}