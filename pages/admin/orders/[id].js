import { revalidateTag } from "next/cache";


const createPagesToRender = (orders) => {
  return orders.map(({ orderID }) => {
    return {
      params: {
        id: String(orderID),
      },
    };
  });
};

export const getStaticPaths = async () => {
  try {
    let response = await fetch("http://localhost:8888/.netlify/functions/orders", {
      method: "GET",
    });
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
  try{
    let response = await fetch(`http://localhost:8888/.netlify/functions/orderID?id=${params.id}`, { method: "GET" });
  
    response = await response.json()
    if(!response.items){
      return { notFound: true }
    }
    return {
      props: {
        customerName: String(response.items.customerName),
        delivDate:  String(response.items.deliveryDate),
        totalPrice:   String(response.items.totalPrice),
        outletName:   String(response.items.outletName),
        delivStatus:  String(response.items.deliveryStatus),
        orderID:  String(response.items.orderID)
      },
      revalidate: 60,
    };
  }catch(err){
    console.log("Error occured in orderID Api", err)
  } 
};



export default function page({ customerName, delivDate, totalPrice, outletName, delivStatus, orderID }) {
  return (
  <div>information regarding orderID for this page: {`${customerName} ${delivDate} ${totalPrice} ${outletName} ${delivStatus} ${orderID}`}</div>
) 

}



