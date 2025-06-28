import Head from "next/head";
import styles from './[id].module.css';
import { Select } from "@mantine/core";
import { useState } from "react";

const createPagesToRender = (orders = []) => {
  return orders.map(({ orderID }) => {
    return { 
      params: {
        id: String(orderID),
      },
    };
  });
};

export const getStaticPaths = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`);
    const data = await res.json();

    const orders = Array.isArray(data.items) ? data.items : [];

    return {
      paths: createPagesToRender(orders),
      fallback: 'blocking',
    };
  } catch (err) {
    console.log("Failed to retrieve orders from orderDB during build time", err);

    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};


export const getStaticProps = async ({ params }) => {
  try{
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orderID?id=${params.id}`, { method: "GET" });
  
    response = await response.json()
    if(!response.items){
      return { notFound: true }
    }
    return {
      props: {
        customerName: String(response.items.customerName),
        delivDate:  String(response.items.deliveryDate),
        totalPrice:   String(response.items.totalPrice),
        delivStatus:  String(response.items.deliveryStatus),
        orderID:  String(response.items.orderID),
        cart: response.items.cart ?? [],
      },
    };
  }catch(err){
    console.log("Error occured in orderID Api", err);
    return { notFound: true };
  } 
  
};



export default function page({ customerName, delivDate, totalPrice, delivStatus, orderID, cart}) {
  const [deliveryStatus, setDeliveryStatus] = useState(delivStatus);
  const setDelivStatus = async (value) => {
    console.log("Delivery status changed to:", value);

    const payload = [
      {
        Update: {
          TableName: "OrderDB",
          Key: { orderID },
          UpdateExpression: "SET deliveryStatus = :status",
          ExpressionAttributeValues: {
            ":status": value
          }
        }
      }
    ];

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to update delivery status:", data);
      } else {
        setDeliveryStatus(value);
      }
    } catch (err) {
      console.error("Network error while updating delivery status:", err);
    }
  };
  
  return (
    <div className="container">      
      <Head>
        <title>Order {orderID}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">

        <div className={styles.formComponent}>
          <h2>Order {orderID} - {customerName}</h2>
        </div>

        <div className={styles.formComponent}>
          <Select
            label = "Delivery"
            placeholder= "Outlet name here..."
            data = {["Delivered", "Pending", "Cancelled"]}
            onChange={setDelivStatus}
            value={deliveryStatus}
          />
        </div>

        <div className={styles.formComponent}>
          <h4>Items</h4>
          <ul>
            {cart && cart.map((item, index) => (
              <li key={index}>
                <div>{item.product}</div>
                <div>Quantity: {item.quantity}</div>
                <div>Price: RM {item.price}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.formComponent}>
          <h4>Order Summary</h4>
          <div className={styles.rowContainer}>
            <div>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</div>
            <div>Total: RM {totalPrice}</div>
          </div>
        </div>

        <div className={styles.formComponent}>
          <h4>Delivery Date</h4>
          <div>{delivDate}</div>
        </div>

      </div>
      </div>
) 

}



