import { Button, Flex, Group, Stack, TextInput, NumberInput, Select, Center } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { useEffect, useRef, useState } from "react";
import styles from './edit.module.css';

export default function BulkEditPage() {
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);

const changesRef = useRef({});

useEffect(() => {
    checkProducts();
}, []);

const checkProducts = async () => {
    if (!sessionStorage.getItem("products")) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`);
    const productsData = await response.json();
    sessionStorage.setItem("products", JSON.stringify(productsData));
    setProducts(productsData);
    setCategories([...new Set(productsData.map((item) => item.Category))]);
    } else {
    const storedProducts = JSON.parse(sessionStorage.getItem("products"));
    setProducts(storedProducts);
    setCategories([...new Set(storedProducts.map((item) => item.Category))]);
    }
};

const handleChange = (index, field, value) => {
    if (!changesRef.current[index]) {
        changesRef.current[index] = {
        ...products[index],
        oldName: products[index].Name,
        oldCategory: products[index].Category,
        };
    }

    changesRef.current[index][field] = value;
};

const handleSave = async () => {
    const mergedProducts = products.map((p, index) => ({
        ...p,
        ...(changesRef.current[index] || {}),
    }));

    const seenNames = new Set();
    for (const product of mergedProducts) {
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

        const category = product.Category?.trim();
        if (!category) {
        alert(`Product "${product.Name}" is missing a Category.`);
        return;
        }

        if (product.Price !== undefined && product.Price !== null) {
        const cleaned = String(product.Price).replace(/[^0-9.,]/g, "").replace(",", ".");
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
    }

    const updatedProducts = Object.entries(changesRef.current).map(([index, changes]) => ({
        ...products[index],
        ...changes,
    }));


    const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProducts),
    });

    console.log("Response from server:", response);

    if (response.ok) {
    sessionStorage.removeItem("products");
    alert("Products updated successfully.");
    checkProducts();
    changesRef.current = {};
    } else {
    alert("Error updating products. Check console for details.");
    console.error(await response.text());
    }
};

return (
    <Flex>
    <NavBar />
    <Stack w="100%" p="md">
        <h2>Bulk Edit Products</h2>
        <Stack>
        {products.map((product, index) => (
            <Group key={index} grow>
            <TextInput
                label="Name"
                defaultValue={product.Name || ""} 
                onChange={(e) => handleChange(index, "Name", e.target.value)}
            />
            <Select
                label="Category"
                data={categories}
                defaultValue={product.Category || ""} 
                onChange={(value) => handleChange(index, "Category", value)}
            />
            <NumberInput
                label="Price"
                defaultValue={product.Price || 0} 
                precision={2}
                onChange={(value) => handleChange(index, "Price", value)}
            />
            <NumberInput
                label="Stock"
                defaultValue={product.Stock || 0} 
                onChange={(value) => handleChange(index, "Stock", value)}
            />
            </Group>
        ))}
        </Stack>
        <Center>
            <div className={styles.cartButton} onClick={handleSave}>Save All Changes</div>
        </Center>
        {/*Padding*/}
        <div style={{ height: "60px" }} />
    </Stack>
    </Flex>
);
}
