import { useEffect, useState } from "react";
import { Grid } from '@mantine/core'

export default function ProductSearchResult ({ name, category, products, destinationURL }) {

    const [content, setContent] = useState(<></>);

    const renderContent = (items) => {
        if (items.length !== 0){
            setContent(items.map(item => (
                <Grid.Col 
                    span={6} 
                    
                    key = {item.Name}>
                    <a href = {`${destinationURL}/${encodeURIComponent(item.Name)}`}> 
                        <div style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "12px",
                        background: "#fff",
                        }}>
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

    const handleGet = async() => {
        if (!name && category.length === 0){
            renderContent(products);
        }

        else{
            let data = products
            if (category && category.length !== 0){
                data = data.filter(item => category.some(cat => item.Category.includes(cat)));
            }
            if (name && name !== "null") {
                data = data.filter(item => item.Name.toLowerCase().includes(name.toLowerCase()));
            }
            renderContent(data);
        }

    }


    useEffect(() => {
            handleGet();
    }, [name, category]);

    return (
    <>
        <Grid w="80%" justify="flex-start" gutter="40">
            {content}
        </Grid>
    </>)
}