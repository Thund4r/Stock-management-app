import { useEffect } from "react";

export const getStaticProps = async () => {
    let orders;
    try {
      let response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders`, {
        method: "GET",
      });
      console.log("Here's the response:", response)
      response = await response.json();
      orders = response.items;
      console.log(response)
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



export default function page({ orders }){

    useEffect(() => {
        sessionStorage.setItem("orders", JSON.stringify(orders));
      }, []); //empty dependency array so it only runs after initial render and that's it.

      
    return (
      <div>hello</div>
    )
}