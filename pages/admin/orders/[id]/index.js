import Head from "next/head";
import styles from './index.module.css';
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
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
      method: "GET",
    });
    console.log(response)
    response = await response.json();
    const orders = response.items;
    return {
      paths: createPagesToRender(orders),
      fallback: 'blocking',
    };
  } catch (err) {
    console.log("Failed to retrieve orders from orderDB during build time");
    console.log(err);
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
    console.log("Error occured in orderID Api", err)
  } 
  
};



export default function page({ customerName, delivDate, totalPrice, delivStatus, orderID, cart}) {
  const [deliveryStatus, setDeliveryStatus] = useState(delivStatus);
  
  const setDelivStatus = async (value) => {
  console.log("Delivery status changed to:", value);

  let stockPayload = [];

  const goingToCancelled = value === "Cancelled" && deliveryStatus !== "Cancelled";
  const goingFromCancelled = deliveryStatus === "Cancelled" && value !== "Cancelled";

  if (goingToCancelled || goingFromCancelled) {
    const confirmText = goingToCancelled
      ? "Restock the items?"
      : "Deduct the items?";
    if (confirm(confirmText)) {
      const direction = goingToCancelled ? 1 : -1;
      stockPayload = cart
        .filter((item) => item.stock !== 9999)
        .map((item) => ({
          Name: item.product,
          Category: item.category,
          quantity: direction * item.quantity,
        }));

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockPayload),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("Stock adjustment failed:", data);
          alert("Stock update failed. See console for details.");
        } else {
          console.log("Stock adjustment successful.");
        }
      } catch (err) {
        console.error("Network error:", err);
        alert("Stock update failed due to network error.");
      }
    }
  }

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



