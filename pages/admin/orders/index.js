import styles from "./index.module.css";
import OrderSearchContainer from "@components/AdminComponents/AdminOrderComponents/SearchContainer";
import BulkEditButton from "@components/AdminComponents/AdminOrderComponents/BulkEditButton";
// import { Test } from "@components/AdminComponents/AdminOrderComponents/AddOrderForm";
import { useEffect } from "react";

export const getServerSideProps = async () => {
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
          <BulkEditButton> bulk edit </BulkEditButton>
          {/* <Test> Post </Test> */}
        </div>
      </div>

      <OrderSearchContainer initialOrders={orders} />
    </main>
  );
}
