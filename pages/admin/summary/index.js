import { Flex } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { useEffect, useState } from "react";
import { ClickableCardOrder } from "@components/ClickableCard";

export default function CustomerSpendingPage() {
  const [customers, setCustomers] = useState(null);
  const MONTHS_BACK = 3; // configurable

  useEffect(() => {
    checkCustomers();
  }, []);

  const checkCustomers = async () => {
    let customerData;
    if (!sessionStorage.getItem("customers")) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`
      );
      customerData = await response.json();
      sessionStorage.setItem("customers", JSON.stringify(customerData));
    } else {
      customerData = JSON.parse(sessionStorage.getItem("customers"));
    }

    const ordersResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`
    );
    const ordersData = await ordersResponse.json();

    const now = new Date();
    const targetMonths = Array.from({ length: MONTHS_BACK }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return d.toLocaleString("default", { month: "long", year: "numeric" });
    });

    const customersWithOrders = customerData.map((customer) => {
      const customerOrders = ordersData.items.filter(
        (order) => order.customerName === customer.Name
      );

      const monthlyData = {};
      targetMonths.forEach((m) => {
        monthlyData[m] = {
          total: 0,
          orders: [],
        };
      });

      customerOrders.forEach((order) => {
        const orderMonth = new Date(order.dateOfCreation).toLocaleString(
          "default",
          { month: "long", year: "numeric" }
        );
        if (monthlyData[orderMonth]) {
          monthlyData[orderMonth].total += order.totalPrice || 0;
          monthlyData[orderMonth].orders.push(order);
        }
      });

      return {
        ...customer,
        monthlyData,
      };
    });

    setCustomers(customersWithOrders);
  };

  return (
    <Flex>
      <NavBar />
      <div style={{ padding: 20, width: "100%" }}>
        <h2>Customer Monthly Spendings (Past 3 Months)</h2>
        {customers &&
          customers.map((c, i) => (
            <div
              key={i}
              style={{
                marginBottom: 30,
                padding: 15,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            >
              <strong>{c.Name}</strong> ({c.Phone})
              <div style={{ marginTop: 10 }}>
                {Object.entries(c.monthlyData).map(([month, data]) => (
                  <div
                    key={month}
                    style={{
                      marginBottom: 15,
                      padding: 10,
                      background: "#f9f9f9",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>
                      {month}: RM {data.total.toFixed(2)}
                    </div>
                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        marginTop: 8,
                        padding: 5,
                      }}
                    >
                      {data.orders.length > 0 ? (
                        <ClickableCardOrder data={data.orders} invoice={true}/>
                      ) : (
                        <div style={{ color: "#888" }}>No orders</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </Flex>
  );
}
