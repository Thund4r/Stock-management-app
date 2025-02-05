import styles from "./index.module.css";
import OrderSearchContainer from "../../../components/AdminOrderComponents/SearchContainer.js";
import BulkEditButton from "../../../components/AdminOrderComponents/BulkEditButton.js";
import { Test } from "../../../components/AdminOrderComponents/CreateOrderButton.js";
import { useEffect } from "react";


export const getStaticProps = async () => {
  let orders;
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
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
