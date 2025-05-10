import { Button, Flex, Modal } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import BulkUpload from "@components/AdminComponents/BulkUpload";
import { useEffect, useState } from "react";
import { ClickableCardProduct } from "@components/ClickableCard";


export default function page(){
    const [opened, setOpened] = useState(false);
    const [products, setProducts] = useState(null)
    
      useEffect(() => {
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
        }
        else{
          setProducts(JSON.parse(sessionStorage.getItem("products")))
        }
      }

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

    return(
        <Flex>
            <NavBar/>
            <Button onClick={() => setOpened(true)}>Import CSV</Button>
            {products && <ClickableCardProduct data={products} title="" />}
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
