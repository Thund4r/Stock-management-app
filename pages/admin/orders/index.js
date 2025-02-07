import styles from "./index.module.css";
import OrderSearchContainer from "@components/AdminComponents/AdminOrderComponents/SearchContainer.js";
import BulkEditButton from "@components/AdminComponents/AdminOrderComponents/BulkEditButton.js";
import { Test } from "@components/AdminComponents/AdminOrderComponents/CreateOrderButton.js";
import { useEffect } from "react";


//set revalidate to 60s
//set an api call to res validate when the database (and any of its entries) change.
export const getStaticProps = async () => {
  let orders;
  try {
    let response = await fetch("/.netlify/functions/orders", {
      method: "GET",
    });
    response = await response.json();
    orders = response.items;
  } catch (err) {
    console.log("Failed to retrieve orders from orderDB during build time");
    console.log(err);
  }

  return {
    props: {
      orders: orders,
    },
    revalidate: 60,
  };
};


export default function page({ orders }) {
  useEffect(() => {
    sessionStorage.setItem("orders", JSON.stringify(orders));
  }, []); //empty dependency array so it only runs after initial render and that's it.

  return (
    <main className={styles.ordersContainer}>
      <div className={styles.actionToolbar}>
        <h3>Orders</h3>
        <div className={styles.actionButtonContainer}>
          <BulkEditButton />
          <Test />
        </div>
      </div>

      <OrderSearchContainer initialOrders={orders} />
    </main>
  );
}
