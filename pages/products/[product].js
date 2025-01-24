import QtSelector from '@components/QtSelector';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
 
export default function Page({ item }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState([]);

  let content = <></>

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
    if (router.query.product) {
      try {
        setProduct(item);
      } catch (error) {
        console.error("Error parsing product:", error);
      }
    }
  }, [router.query.product]);


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
      <QtSelector onQuantityChange={(newQuantity) => setQuantity(newQuantity)} maxQuant={product.Stock}/>
    </div>
    </>
    )
  }

  const addToCart = () => {
    const newItem = {product: product.Name, quantity: parseInt(quantity), price: parseInt(product.Price), stock: parseInt(product.Stock)};
    const itemExists = cart.findIndex((item) => item.product === newItem.product);
    if (itemExists == -1){
      const newCart = [...cart, newItem];
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      router.back();
    }
    else{
      const newCart = [...cart]
      newCart[itemExists].quantity += newItem.quantity;
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      router.back();
    }
  }
  
  return (<div className="product">
    {content}
    <button type="button" onClick={addToCart}>Add to cart</button>
    </div>
  )
}

export async function getStaticPaths() {
  const response = await fetch(`http://localhost:8888/.netlify/functions/products`, {
    method: "GET"
});
  const products = await response.json();
  const paths = products.map(item => ({params: {product: item.Name}}));

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const response = await fetch(`http://localhost:8888/.netlify/functions/products?name=${params.product}&single=True`, {
    method: "GET"
});
  const item = (await response.json())[0];

  return {
    props: {
      item,
    },
  };
}