import Head from "next/head";
import { Flex, Stack } from "@mantine/core";
import { useEffect, useState } from "react";


export const getStaticPaths = async () => {
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
      method: "GET",
    });
    console.log(response)
    response = await response.json();
    const orders = response.items;
    return {
      paths: createPagesToRender(orders),
      fallback: 'blocking',
    };
  } catch (err) {
    console.log("Failed to retrieve orders from orderDB during build time");
    console.log(err);
  }
};


export const getStaticProps = async ({ params }) => {
  try {
    let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orderID?id=${params.id}`, { method: "GET" });
    response = await response.json();

    if (!response.items) {
      return { notFound: true };
    }

    const orderID = String(response.items.orderID);
    const dateOfCreation = String(response.items.dateOfCreation);

    // Generate invoice number
    const date = new Date(dateOfCreation);
    const yy = String(date.getFullYear()).slice(-2);   // e.g. "25"
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // e.g. "07"
    const invoiceNumber = `${yy}${mm}${orderID}`;       // e.g. "250772"

    return {
      props: {
        customerName: String(response.items.customerName),
        totalPrice: String(response.items.totalPrice),
        orderID,
        dateOfCreation,
        cart: response.items.cart ?? [],
        invoiceNumber,   // ✅ pass it to the page
      },
    };
  } catch (err) {
    console.log("Error occurred in orderID Api", err);
    return { notFound: true };
  }
};

const createPagesToRender = (orders = []) => {
    return orders.map(({ orderID }) => {
        return { 
        params: {
            id: String(orderID),
        },
        };
    });
};


export default function page({ customerName, totalPrice, dateOfCreation, cart, invoiceNumber}) {
    const [settings, setSettings] = useState({Name: "", Phone: "", Address: ""});

    useEffect(() => {
        checkSettings();
    }, []);
    
    const checkSettings = async () => {
        if (!(sessionStorage.getItem("settings"))){
            const response = await fetch (`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/settings?storeID=11219`, {
                method: "GET",
            });
            const responseSettings = await response.json();
            sessionStorage.setItem("settings", JSON.stringify(responseSettings));
            setSettings(responseSettings);
        }
        else{
            setSettings(JSON.parse(sessionStorage.getItem("settings")));
        }
    }

    const downloadPDF = async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.getElementById("invoice");
        html2pdf().from(element).save(`order${invoiceNumber}invoice.pdf`);
    };


    return (
        <>
            <button type="button" onClick={downloadPDF}>
                    Save as PDF
            </button>
            <Stack id="invoice">
                <Flex justify={"space-between"}>
                    <Stack gap="0">
                        <h2>Invoice #{invoiceNumber}</h2>
                        <div>Order Date: {dateOfCreation}</div>
                        <div>DEBIT NOTE</div>
                    </Stack>
                    <Stack align="flex-end" gap="0">
                        <b>{settings.Name}</b>
                        <a style = {{ color: "blue" }} href={`${process.env.NEXT_PUBLIC_ROOT_PAGE}`}>{process.env.NEXT_PUBLIC_ROOT_PAGE} </a>
                        <div>{settings.Phone}</div>
                        {settings.Address.split('\n').map((line, index) => (
                            <div key={index}>{line}</div>
                        ))}
                    </Stack>
                </Flex>
                <div style={{ borderTop: "1px solid #ccc", paddingTop: "8px" }}>
                    <b>{customerName}</b>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                    <thead>
                        <tr>
                        <th style={{ textAlign: "left", borderBottom: "1px solid black", padding: "8px" }}>Items</th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid black", padding: "8px" }}>Qty</th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid black", padding: "8px" }}>Price</th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid black", padding: "8px" }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: "8px", color: "steelblue" }}>{item.product}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>{item.quantity}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>RM {item.price}</td>
                            <td style={{ padding: "8px", textAlign: "right" }}>RM {(item.quantity * item.price)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ textAlign: "right", marginTop: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <div><b>Items total ({cart.length})</b></div>
                        <div><b>RM {totalPrice}</b></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px dashed #ccc", marginTop: "8px", paddingTop: "4px" }}>
                        <div><b>Subtotal</b></div>
                        <div><b>RM {totalPrice}</b></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px dashed #ccc", marginTop: "4px", paddingTop: "4px" }}>
                        <div><b>Total</b></div>
                        <div><b>RM {totalPrice}</b></div>
                    </div>
                </div>
            </Stack>
        </>
) 

}



