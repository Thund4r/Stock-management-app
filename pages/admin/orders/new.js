import Head from "next/head";
import Header from '@components/Header';
import { useEffect, useState } from "react";
import QtSelector from "@components/QtSelector";
import styles from './new.module.css';
import { Select, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useRouter } from 'next/router';
import ItemSelector from "@components/ItemSelector";


export default function page() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [date, setDate] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerNames, setCustomerNames] = useState([]);
  const [settings, setSettings] = useState({});
  const [products, setProducts] = useState(null)

  const getCustomerNames = async () => {
    const customerFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?nameOnly=True`);
    setCustomerNames(await customerFetch.json());
  }

  useEffect(() => {
      setCart(JSON.parse(localStorage.getItem("cart")) || []);
      getCustomerNames();
      checkSettings();
      checkProducts();
    }, []);

  const checkSettings = async () => {
      if (!(sessionStorage.getItem("settings"))){
          const response = await fetch (`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/settings?storeID=11219`, {
              method: "GET",
          });
          const responseSettings = await response.json();
          sessionStorage.setItem("settings", JSON.stringify(responseSettings));
          setSettings(responseSettings);
      }
      else{
          setSettings(JSON.parse(sessionStorage.getItem("settings")));
      }
  }

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

  const addToCart = (newItem) => {
    console.log(cart);
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(item => item.product === newItem.product);
      let newCart;

      if (itemIndex === -1) {
        newCart = [...prevCart, newItem];
      } else {
        newCart = [...prevCart];
        newCart[itemIndex].quantity += newItem.quantity;
      }

      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
};


  const updateQuant = (item, newQuantity) => {
    const itemIndex = cart.findIndex((oldItem) => oldItem.product === item.product)
    const newCart = [...cart];
    newCart[itemIndex].quantity = newQuantity;
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    console.log(products);
  }

  const removeItem = (item) => {
    const itemIndex = cart.findIndex((oldItem) => oldItem.product === item.product)
    const newCart = [...cart];
    newCart.splice(itemIndex, 1);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  }

  const totalPrice = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return (total)
  }

  const submitForm = async (event) => {
    event.preventDefault();

    const payload = JSON.stringify({
      custName: customerName,
      cart: cart,
      delivDate: date.toLocaleDateString("en-GB"),
      phone: settings.Phone,
    })
    
    const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: payload
    })
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/orders`)

  }

  return(
      <div className="container">
        <Head>
          <title>Checkout</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      <Header title="10 Gram Gourmet Sdn Bhd" />
        <ul>
          <form onSubmit={submitForm}>
          <div className={styles.formComponent}>
          <h4>Customer</h4>
          
          <Select
            label = "Name"
            placeholder= "Outlet name here..."
            required
            data = {customerNames.map(c => c.Name)}
            onChange={setCustomerName}
          />
          </div>

          <div className={styles.formComponent}>
            <ItemSelector 
              products={products}
              onItemAdd={(item) => {
                addToCart(item);
              }}/>
            <h4>Items</h4>
            {cart.map((item, index) => (
              <li key={index}>
                <div style={{ marginBottom: "8px"}}>
                  {item.product} 
                </div>
                <div className={styles.rowContainer}>
                <b style={{ display: "block", marginBottom: "16px"}}>RM {item.price}</b> <div style={{cursor:"pointer", color:"rgba(0,0,0,0.7)"}}onClick={() => {removeItem(item)}}>delete</div>
                </div>
                <QtSelector onQuantityChange={(newQuantity) => updateQuant(item, newQuantity)} quantity={item.quantity} maxQuant={item.stock}/>
              </li>
            ))}
          </div>

          <div className={styles.formComponent}>
            <DateInput 
            value={date} 
            valueFormat="YYYY/MM/DD"
            onChange={setDate} 
            required
            label="Select your delivery/pickup date"
            />
          </div>

          <div className={styles.formComponent}> 
            <h4>Order Summary</h4>
            <div className={styles.rowContainer}>
            <div>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</div>
            <div>RM {totalPrice()}</div>
            </div>
          </div>
          
          <button>Place Order</button>
          </form>
        </ul>
      </div>
  )
}