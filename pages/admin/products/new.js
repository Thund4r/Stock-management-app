import { Flex, Select, Textarea, TextInput } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";


export default function page(){
    const [product, setProduct] = useState({Name: "", Description: "", Price: 0, Category: "Uncategorized", Stock: 9999});
    const [products, setProducts] = useState(null);
    const [categories, setCategories] = useState(null);
    const router = useRouter();


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


    const submitForm = async (event) => {
        event.preventDefault();

        if (product.Name in products.map(item => item.Name)){
            alert("Product already exists");
            return;
        }

        const payload = JSON.stringify([product]);
        const response = await fetch (`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: payload
        });
        router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/products`);
        sessionStorage.removeItem("products");
    }

    return(
        <Flex>
            <NavBar/>
            <form onSubmit={submitForm}>
            
                <h4>Add product</h4>
                <TextInput 
                    id="Name"
                    label="Name"
                    required
                    value={product.Name}
                    onChange={(e) => {
                        const { id, value } = e.target;
                        setProduct(prev => ({ ...prev, [id]: value }));
                    }}
                />
    
                <TextInput 
                    id="Description"
                    label="Description"
                    value={product.Description}
                    onChange={(e) => {
                        const { id, value } = e.target;
                        setProduct(prev => ({ ...prev, [id]: value }));
                    }}
                />
    
                <TextInput 
                    id="Price"
                    label="Price"
                    required
                    value={product.Price}
                    onChange={(e) => {
                        let { id, value } = e.target;
                        if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                            if (!/^0(\.|$)/.test(value)) {
                                value = value.replace(/^0+/, '');
                            }
                            setProduct(prev => ({ ...prev, [id]: value }));
                        }
                    }}
                    style={{ width: '600px' }}
                />

                <TextInput 
                    id="Stock"
                    label="Stock"
                    required
                    value={product.Stock}
                    onChange={(e) => {
                        const { id, value } = e.target;
                        if (value === "" || /^[0-9]+$/.test(value)) {
                            setProduct(prev => ({ ...prev, [id]: value }));
                        }
                    }}
                />
                
                <Select
                    id="Category"
                    label="Category"
                    data={categories}
                    value={product.Category}
                    onChange={(value) => setProduct(prev => ({ ...prev, Category: value }))}
                />
        
                <button>Add to Products</button>
            </form>
        </Flex>
    )
}
