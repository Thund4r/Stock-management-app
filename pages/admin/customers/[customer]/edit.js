import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, TextInput, Textarea } from '@mantine/core';

export default function page({ customerProp, orders }) {
  const [customer, setCustomer] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  let content = <></>

  useEffect(() => {
    try {
    setCustomer(customerProp);
    } catch (error) {
    console.error("Error parsing customer:", error);
    }
  }, []);

  useEffect(() => {
    if (customer){
        setCustomerName(customer.Name);
        setCustomerPhone(customer.Phone);
        setCustomerAddress(customer.Address);
    };
  }, [customer]);

  const submitForm = async (event) => {
    event.preventDefault();

    // const payload = JSON.stringify({
    //   custName: customerName,
    //   cart: cart,
    //   delivDate: date.toLocaleDateString("en-GB"),
    //   outName: outletName,
    // })
    
    // const response = fetch('${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders', {
    //   method: "POST",
    //   headers: {'Content-Type': 'application/json'},
    //   body: payload
    // })
    console.log("Submit");

  }

  if (customer){
    console.log(orders);

    content = (<>
    <form onSubmit={submitForm}>

            <h4>Customer</h4>
            <TextInput 
                id="custName"
                label="Name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
            />

            <TextInput 
                id="custPhone"
                label="Phone"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
            />

            <Textarea 
                id="custAddress"
                label="Address"
                required
                autosize
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                style={{ width: '600px' }}
            />
    
        <button>Save</button>
    </form>
    </>
    );
  };

  const checkMonthlySpending = () => {
    //TODO
  }


  return(
  <Flex>
    <NavBar/>
    {content}
  </Flex>
  )

}

export async function getStaticPaths() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`);
  let customers = [];

  try {
    const data = await response.json();
    customers = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
  const paths = customers.map(item => ({params: {customer: item.Name}}));

  return {
    paths,
    fallback: true,
  }
}

export async function getStaticProps({ params }) {
  const customerFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?name=${params.customer}`);
  const  customerProp = (await customerFetch.json())[0];
  const ordersFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders?customerName=${params.customer}`);
  const orders = (await ordersFetch.json()).items;
  return {
    props: {
       customerProp,
      orders,
    },
  };
}