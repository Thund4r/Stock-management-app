import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, Select, TextInput } from '@mantine/core';
import { useRouter } from 'next/router';

export default function Page({ item, products }) {
  const router = useRouter();
  const [product, setProduct] = useState(item);
  const [categories, setCategories] = useState([...new Set(products.map(item => item.Category))]);

  const deleteCustomer = async () => {
    if (confirm('Delete this item?')) {
      const payload = JSON.stringify({
        Name: item.Name,
        Category: item.Category,
      });

      await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'},
        body: payload
      });

      router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/products`);
    };
  }

  const submitForm = async (event) => {
    event.preventDefault();

    if (product.Name.toLowerCase().trim() !== item.Name.toLowerCase().trim() &&
        products.map(p => p.Name.toLowerCase().trim()).includes(product.Name.toLowerCase().trim())) {
        
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
      await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: payload
      });

      router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/products`);
    }
  }

  return (
    <Flex>
      <NavBar/>
      <form onSubmit={submitForm}>
        <TextInput 
          id="Name"
          label="Name"
          required
          value={product.Name}
          onChange={(e) => setProduct(prev => ({ ...prev, Name: e.target.value }))}
        />
        <TextInput 
          id="Description"
          label="Description"
          value={product.Description}
          onChange={(e) => setProduct(prev => ({ ...prev, Description: e.target.value }))}
        />
        <TextInput 
          id="Price"
          label="Price"
          required
          value={product.Price}
          onChange={(e) => {
            let value = e.target.value;
            if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
              if (!/^0(\.|$)/.test(value)) {
                value = value.replace(/^0+/, '');
              }
              setProduct(prev => ({ ...prev, Price: value }));
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
            const value = e.target.value;
            if (value === "" || /^[0-9]+$/.test(value)) {
              setProduct(prev => ({ ...prev, Stock: value }));
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
    </Flex>
  );
}

// ⚡ NEW: getServerSideProps runs on every request
export async function getServerSideProps({ params }) {
  const productName = decodeURIComponent(params.product);
  
  try {
    // Fetch single product
    const productRes = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products?name=${encodeURIComponent(productName)}&single=True`);
    const productData = await productRes.json();
    const item = productData[0];

    // Fetch all products (for categories + name check)
    const allProductsRes = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`);
    const allProducts = await allProductsRes.json();

    if (!item) {
      return { notFound: true };
    }

    return {
      props: {
        item,
        products: allProducts,
      },
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return { notFound: true };
  }
}
