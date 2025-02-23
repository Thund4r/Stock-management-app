import { useState } from "react";
import OrdersTable from "./OrdersTable";
import SaveChanges from "./SaveChanges";
import style from "./EditContainer.module.css";

export default function EditContainer({ orders }) {
  const [orderUpdates, setOrderUpdates] = useState(new Map());
  const [isOrdersTableReset, setIsOrdersTableReset] = useState(false);
  //idea, alwayws render intermediateOrders.. On refresh, everthing behaves as usual. But i can now modifiy intermediateOrders in SaveChanges to cause a rerender with the updated data.
  const [liveOrders, setliveOrders] = useState(orders);
  return (
    <div className={style.editContainer}>
      <div className={style.tableContainer}>
        <OrdersTable orderUpdates={orderUpdates} setOrderUpdates={setOrderUpdates} liveOrders={liveOrders} isOrdersTableReset={isOrdersTableReset} setIsOrdersTableReset={setIsOrdersTableReset} />
      </div>
      <div className={style.saveAndRemoveContainer}>
        <SaveChanges orderUpdates={orderUpdates} setOrderUpdates={setOrderUpdates} setIsOrdersTableReset={setIsOrdersTableReset} setliveOrders={setliveOrders} />
      </div>
    </div>
  );
}


// need to call revalidation after editing entries