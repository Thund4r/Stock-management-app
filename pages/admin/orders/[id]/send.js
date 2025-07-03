import Head from "next/head";
import { Button, Flex, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import Link from "next/link";

export const getStaticPaths = async () => {
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
      method: "GET",
    });
    response = await response.json();
    const orders = response.items;
    return {
      paths: orders.map(({ orderID }) => ({ params: { id: String(orderID) } })),
      fallback: "blocking",
    };
  } catch (err) {
    console.error("Failed to retrieve orders:", err);
  }
};

export const getStaticProps = async ({ params }) => {
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orderID?id=${params.id}`, {
      method: "GET"
    });

    response = await response.json();
    if (!response.items) return { notFound: true };

    return {
      props: {
        customerName: String(response.items.customerName),
        delivDate: String(response.items.deliveryDate),
        totalPrice: String(response.items.totalPrice),
        orderID: String(response.items.orderID),
        dateOfCreation: String(response.items.dateOfCreation),
        cart: response.items.cart ?? [],
      },
    };
  } catch (err) {
    console.error("Error in orderID API", err);
    return { notFound: true };
  }
};

export default function InvoicePage({ customerName, delivDate, totalPrice, orderID, dateOfCreation, cart }) {
    const [settings, setSettings] = useState({ Name: "", Phone: "", Address: "" });

    useEffect(() => {
        if (!sessionStorage.getItem("settings")) {
        fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/settings?storeID=11219`)
            .then((res) => res.json())
            .then((data) => {
            sessionStorage.setItem("settings", JSON.stringify(data));
            setSettings(data);
            });
        } else {
        setSettings(JSON.parse(sessionStorage.getItem("settings")));
        }
    }, []);
    const formattedItems = cart
        .map((item) => `${item.quantity}x ${item.product} (RM ${item.price})`)
        .join("\n");
    const message =
        `${settings.Name}\n` +
        `New order: #${orderID}\n\n` +
        `Order items: ${formattedItems}\n\n` +
        `Delivery date: ${delivDate}\n\n` +
        `Total amount: RM ${totalPrice}\n\n` +
        `Customer: ${customerName}\n\n` +
        `See order details: ${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/orders/${orderID}\n` +
        `To change order status, please follow the link.`;

    const phone = "01121009210";
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    return (
        <Flex direction="column" align="center" justify="center" style={{ padding: "40px", textAlign: "center" }}>
        <Text fw={700} size="lg" mb="md">
            Send us order details to confirm your order
        </Text>

        <Link href={waLink} target="_blank" rel="noopener noreferrer">
            <Button
            leftSection={<img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" style={{ width: 16 }} />}
            style={{
                backgroundColor: "#25D366",
                color: "white",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: 600,
            }}
            >
            Send WhatsApp
            </Button>
        </Link>
        </Flex>
    );
}