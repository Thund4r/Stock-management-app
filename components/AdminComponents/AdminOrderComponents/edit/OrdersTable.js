
import StatusDropdown from "./StatusDropdown";
import styles from "./OrdersTable.module.css"
function createHeaderContent() {
  const headerContent = ["orderID", "customerName", "deliveryDate", "deliveryStatus", "dateOfCreation", "totalPrice"];
  return (
    <tr>
      {headerContent.map((headerName) => (
        <th>{headerName}</th>
      ))}
    </tr>
  );
}

export default function OrdersTable({ liveOrders, orderUpdates, isOrdersTableReset, setOrderUpdates, setIsOrdersTableReset}) {
  
  function createBodyContent() {
    return liveOrders.map((order) => {
      return (
        <tr>
          <td>{order.orderID}</td>
          <td>{order.customerName}</td>
          <td>{order.deliveryDate}</td>
          <td>
            <StatusDropdown order={order} orderUpdates={orderUpdates} isOrdersTableReset={isOrdersTableReset} setOrderUpdates={setOrderUpdates} setIsOrdersTableReset={setIsOrdersTableReset} />
          </td>
          <td>{order.dateOfCreation}</td>
          <td>{order.totalPrice}</td>
        </tr>
      );
    });
  }

  return (
    <table className = {styles.ordersTable}>
      <thead>{createHeaderContent()}</thead>
      <tbody>{createBodyContent()}</tbody>
    </table>
  );
}
