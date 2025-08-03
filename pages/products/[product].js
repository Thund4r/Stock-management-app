import QtSelector from '@components/QtSelector';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
 
export default function page({ item }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [cart, setCart] = useState([]);

  let content = <></>

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
    try {
      setProduct(item);
    } catch (error) {
      console.error("Error parsing product:", error);
    }
  }, []);


  if (product){
    content = (<>
    <div className="productName">
      {product.Name}
    </div>
    <div className="productDescription">
      {product.Description}
    </div>
    <div className="productPrice">
      <b>
        Price
      </b>
      <div>
        {product.Price}
      </div>
    </div>
    <div className="productQuantity">
      <div >
        Quantity 
      </div>
      {product.Stock<10 && <div style={{marginRight:"80px"}}>{product.Stock} left</div>}
      <QtSelector onQuantityChange={(newQuantity) => setQuantity(newQuantity)} maxQuant={product.Stock} quantity = {quantity}/>
    </div>
    </>
    )
  }

  const addToCart = () => {
    if (quantity <= 0) {
      alert("Please select a valid quantity");
      return;
    }
    const newItem = {product: product.Name, quantity: parseInt(quantity), price: parseInt(product.Price), stock: parseInt(product.Stock), category: product.Category};
    const itemExists = cart.findIndex((item) => item.product === newItem.product);
    if (itemExists == -1){
      const newCart = [...cart, newItem];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      router.push('/');
    }
    else{
      const newCart = [...cart]
      newCart[itemExists].quantity += newItem.quantity;
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      router.push('/');
    }
  }
  
  return (<div className="product">
    {content}
    <button type="button" onClick={addToCart}>Add to cart</button>
    </div>
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
  const paths = products.map(item => ({params: {product: item.Name}}));
  return {
    paths,
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products?name=${encodeURIComponent(params.product)}&single=True`);
    if (!response) {
      console.error("Failed to fetch product:", response.statusText);
      return { notFound: true };
    }
    const data = await response.json();

    const item = Array.isArray(data) && data.length > 0 ? data[0] : null;

    if (!item) {
      return { notFound: true };
    }

    return {
      props: {
        item,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { notFound: true };
  }
}
