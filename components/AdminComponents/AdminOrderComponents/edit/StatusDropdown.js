import { useState, useRef, useEffect } from "react";

export default function StatusDropdown({ order, orderUpdates, isOrdersTableReset , setOrderUpdates, setIsOrdersTableReset }) {
  // const initialStatus = order.deliveryStatus;
  const [displayedSelectedStatus, setDisplayedSelectedStatus] = useState(order.deliveryStatus);
  const internalSelectedStatus = useRef(order.deliveryStatus);

  const handleChange = (event) => {
    const newStatus = event.target.value;
    setDisplayedSelectedStatus(newStatus);
    internalSelectedStatus.current = newStatus;
    const orderID = order.orderID;
    const isStatusDifferent = internalSelectedStatus.current != order.deliveryStatus;
    const keyExistInMap = orderUpdates.has(orderID);
    if (isStatusDifferent) {
      if (!keyExistInMap) {
        setOrderUpdates((orderUpdates) => {
          orderUpdates.set(orderID, { deliveryStatus: internalSelectedStatus.current })
          return new Map(orderUpdates);
        });
      }
    } else {
      if (keyExistInMap) {
        setOrderUpdates((orderUpdates) => {
          orderUpdates.delete(orderID)
          return new Map(orderUpdates);
        });
      }
    }
  };

  useEffect(()=> {
    setIsOrdersTableReset(false)
    setDisplayedSelectedStatus(order.deliveryStatus)
    internalSelectedStatus.current = order.deliveryStatus
  }, [isOrdersTableReset])

  return (
    <div>
      <select value={displayedSelectedStatus} onChange={handleChange}>
        <option value="Pending">Pending</option>
        <option value="Delivered">Delivered</option>
      </select>
    </div>
  );
}
