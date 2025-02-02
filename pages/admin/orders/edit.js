export const getStaticProps = async () => {
    let orders;
    try {
      let response = await fetch("../../../.netlify/functions/orders", {
        method: "GET",
      });
      response = await response.json();
      orders = response.items;
    } catch (err) {
      console.log("Failed to retrieve orders from orderDB during build time");
      console.log(err);
    }
  
    return {
      props: {
        orders: orders,
      },
      revalidate: 60,
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