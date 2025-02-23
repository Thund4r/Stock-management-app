import { useEffect } from "react";
import NavBar from "components/NavBar";
import EditContainer from "@components/AdminOrderComponents/edit/EditContainer";
import styles from "./edit.module.css";

export const getServerSideProps = async () => {
  let orders;
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
      method: "GET",
    });
    response = await response.json();
    orders = response.items;
  } catch (err) {
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
  }, []);

  return (
    <div className={styles.pageLayout}>
      <nav className={styles.leftSideBarNav}>
        <NavBar/>
      </nav>
      <div className={styles.mainContainer}>
        <main className = {styles.content}>
          <h4>Bulk edit</h4>
          <EditContainer orders={orders} />
        </main>
      </div>
    </div>
  );
}
