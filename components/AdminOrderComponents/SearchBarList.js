import styles from "./SearchBarList.module.css";
import Link from "next/link";

//finish validation, have to decide how much validation we do. At most, we can check each obj contains the property we expect it to but it seems very costly to do.
const isValid = (item) => {
  if (!Array.isArray(item)) {
    return false;
  }
  //check if object has any undefined properties
  //Could check if each element is an object
  //could check if each object has the properties we expect it to have.
  return true;
};

const parseProductsJson = (item) => {
  if (!isValid(item)) {
    return <li>No data found</li>;
  }

  const final_arr = item.map((item) => {
    return (
      <div>
        <Link href={`/admin/orders/${item.orderID}`} className={styles.elem}>
          <span>
            <span>#{item.orderID}</span>
            <span>{item.customerName}</span>
            <span>RM {item.totalPrice}</span>
          </span>
          <span>
            <span>{item.deliveryDate}</span>
            <span>{item.deliveryStatus}</span>
          </span>
        </Link>
      </div>
    );
  });

  return final_arr;
};

export default function SearchBarList({ item }) {
  return <div>{parseProductsJson(item)}</div>;
}
