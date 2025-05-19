import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, Select, TextInput, Textarea } from '@mantine/core';
import { useRouter } from 'next/router';

export default function page({ item }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  let content = <></>

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
        setProduct(item);
        setProducts(products)
        setCategories([...new Set(products.map(item => item.Category))]);
      }
      else{
        setProducts(JSON.parse(sessionStorage.getItem("products")))
        setCategories([...new Set(JSON.parse(sessionStorage.getItem("products")).map(item => item.Category))]);
      }
      setProduct(item);
  }

  const deleteCustomer = async () => {
    if (confirm('Delete this item?')) {
      const payload = JSON.stringify({
        Name: item.Name,
        Category: item.Category,
      });
  
      const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
          method: "DELETE",
          headers: {'Content-Type': 'application/json'},
          body: payload
        });
  
      sessionStorage.removeItem("products");
      router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/products`);
    };
  }

  const submitForm = async (event) => {
    event.preventDefault();

    if (product.Name.toLowerCase().trim() !== item.Name.toLowerCase().trim() &&
        products.map(item => item.Name.toLowerCase().trim()).includes(product.Name.toLowerCase().trim())) {
        
      alert("Product with this name already exists");
      return;
    }
    else if (JSON.stringify(product) === JSON.stringify(item)) {
      alert("No changes detected.");
      return;
    }
    else {
      const payload = JSON.stringify([{ ...product, oldName: item.Name, oldCategory: item.Category }]);
      console.log(payload);
      const response = await fetch (`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
          method: "PUT",
          headers: {'Content-Type': 'application/json'},
          body: payload
      });
      sessionStorage.removeItem("products");
      router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/products`);
    }
  }

  if (product){
    content = (<>
    <form onSubmit={submitForm}>

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
                onChange={(value) => {
                  if (value !== null) {
                    setProduct(prev => ({ ...prev, Category: value }));
                  }
                }}
            />
    
        <button>Save</button>
    </form>
    <button onClick={deleteCustomer} style={{height: "30px"}}>Delete</button>
    </>
    );
  };


  return(
  <Flex>
    <NavBar/>
    {content}
  </Flex>
  )

}

export async function getStaticPaths() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`);
  let products = [];

  try {
    const data = await response.json();
    products = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  const paths = products.map(item => ({params: {product: encodeURIComponent(item.Name)}}));

  return {
    paths,
    fallback: "blocking",
  }
}

export async function getStaticProps({ params }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products?name=${encodeURIComponent(params.product)}&single=True`, {
    method: "GET"
  });
  const item = (await response.json())[0];
  return {
    props: {
      item,
    },
  };
}