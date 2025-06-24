import { useEffect, useState } from "react";
import { Grid } from '@mantine/core';
import QtSelector from "@components/QtSelector";

export default function ISSearchResult ({ name, category, products, tempCart , handleQty }) {

    const [content, setContent] = useState(<></>);

    const renderContent = (items) => {
        if (items.length !== 0){
            setContent(items.map(item => (
                <Grid.Col 
                    span={6} 
                    key = {item.Name}>
                    <div>
                        <b>{item.Name}</b> <br/>
                        RM {item.Price} <br/>
                    <QtSelector
                        quantity={tempCart[item.Name] || 0}
                        maxQuant={item.Stock}
                        onQuantityChange={(qty) => handleQty(item.Name, qty)}
                    />
                    </div>
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