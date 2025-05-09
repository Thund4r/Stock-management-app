import { Button, Flex, Modal } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import BulkUpload from "@components/AdminComponents/BulkUpload";
import { useState } from "react";


export default function page(){
    const [opened, setOpened] = useState(false);
    const handleFinish = (products) => {
        const missingName = products.some(product => !product.Name || product.Name.trim() === "");
    
        if (missingName) {
            alert("All rows must include a Name field.");
            return;
        }
        products.forEach(product => {
            if (product.Price) {
              const cleaned = product.Price.replace(/[^0-9.,]/g, "").replace(",", ".");
              const numeric = parseFloat(cleaned);
              product.Price = isNaN(numeric) ? null : numeric;
            } else {
              product.Price = null;
            }
        });
        console.log("Upload finished");
        const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(products),
        })
    }

    const test = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([{"Category":"Test", "Name": "test", "Description" : "Duh"}, {"Category":"Test", "Name": "test2", "Duh" : "Duh"}, {"Category":"Test", "Name": "test3", "Duh" : "Duh"}, {"Category":"Test", "Name": "test4", "Duh" : "Duh"}]),

        });
        const data = await response.text();
        console.log(data);
    }
    return(
        <Flex>
            <NavBar/>
            <Button onClick={() => setOpened(true)}>Import CSV</Button>
            <Button onClick={() => test()}>Test</Button>
            <Modal
                opened={opened}
                onClose={() => {
                setOpened(false);
                }}
                title="Upload your CSV"
                size="100%"
                centered>
                <BulkUpload
                    onFinish={handleFinish}
                    destinationOptions={["Price", "Name", "Stock", "Category", "Description"]}
                    defaultValues={{ Category: "Uncategorized" }}
                />
            </Modal>
        </Flex>
    )
}
