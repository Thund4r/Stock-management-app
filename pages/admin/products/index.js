import { Button, Flex, Group, Modal, Stack } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import BulkUpload from "@components/AdminComponents/BulkUpload";
import { useEffect, useState } from "react";
import Search from "@components/Search";
import ProductSearchResult from "@components/CustomerComponents/ProductSearchResult";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";


export default function page(){
    const [opened, setOpened] = useState(false);
    const [products, setProducts] = useState(null)
    const [categories, setCategories] = useState(null)
    const searchParams = useSearchParams();
    const {replace} = useRouter();
    const pathname = usePathname();
    
    
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
          setCategories([...new Set(products.map(item => item.Category))]);
        }
        else{
          setProducts(JSON.parse(sessionStorage.getItem("products")))
          setCategories([...new Set(JSON.parse(sessionStorage.getItem("products")).map(item => item.Category))]);
        }
      }

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

    const handleFinish = (products) => {
        const seenNames = new Set();
        for (const product of products) {
            const name = product.Name?.trim().toLowerCase();
            if (!name) {
                alert("All rows must include a Name field.");
                return;
            }
            if (seenNames.has(name)) {
                alert(`Duplicate product name found: "${product.Name}"`);
                return;
            }
            seenNames.add(name);
        }

        products.forEach(product => {
            if (product.Price) {
                const cleaned = product.Price.replace(/[^0-9.,]/g, "").replace(",", ".");
                const numeric = parseFloat(cleaned);
                product.Price = isNaN(numeric) ? 0 : numeric;
            } else {
                product.Price = 0;
            }
            if (product.Stock !== undefined && product.Stock !== null) {
                const parsedStock = parseInt(product.Stock, 10);
                product.Stock = isNaN(parsedStock) ? 9999 : parsedStock;
            } else {
                product.Stock = 9999;
            }
        });
        const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(products),
        })

        response.then(res => {
            if (res.status === 200) {
                sessionStorage.removeItem("products");
                alert("Products uploaded successfully.");
                checkProducts();
            } else {
                alert("Error uploading products. Check console for more details.");
                console.error("Error uploading products: ", res.statusText);
            }
        })

        sessionStorage.removeItem("products");
    }

    return(
        <Flex>
            <NavBar/>
            <Stack>
                <Search/>
                <Group wrap="nowrap" w="60vw" align="flex-start">
                    <Stack align="center" style={{ width: "20%", position: "sticky", top: 0,}}>
                    {categories && categories.map(cat => {
                        const checked = searchParams.getAll('category').includes(cat);
                        return(
                        <Group wrap="nowrap" key={cat}>
                            <input type="checkbox" id={cat} checked={checked} onChange={(e) => filterClick(cat, e.target.checked)}/>
                            <label htmlFor={cat}>{cat}</label>
                        </Group>)
                    })}
                    </Stack>
                    {products && <ProductSearchResult name = {searchParams.get("name")} category = {searchParams.getAll("category")} products = {products} destinationURL={"/admin/products"}/>}
                </Group>
            </Stack>
            <a href={`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/products/new`}><Button>Add Product</Button></a>
            <Button onClick={() => setOpened(true)}>Import Products</Button>
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
                    defaultValues={{ Category: "Uncategorized" , Stock: 9999 , Price: 0 }}
                />
            </Modal>
        </Flex>
    )
}
