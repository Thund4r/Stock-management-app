import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, TextInput, Textarea } from '@mantine/core';
import { useRouter } from 'next/router';

export default function page({ customerProp, orders }) {
  const router = useRouter();
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

    const payload = JSON.stringify([{
      oldName: customer.Name,
      newName: customerName,
      phone: customerPhone,
      orders: customer.Orders,
      address: customerAddress,
    }]);
    
    const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`, {
      method: "PUT",
      headers: {'Content-Type': 'application/json'},
      body: payload
    });

    sessionStorage.removeItem("customers");
    router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/customers`);

  }

  if (customer){
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
    fallback: "blocking",
  }
}

export async function getStaticProps({ params }) {
  const customerFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?name=${params.customer}`);
  if (!customerFetch) {
    console.error("Failed to fetch customer:", customerFetch.statusText);
    return { notFound: true };
  }
  const customerProp = (await customerFetch.json())[0];
  
  const ordersFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders?customerName=${params.customer}`);
  if (!ordersFetch) {
    console.error("Failed to fetch orders:", ordersFetch.statusText);
    return { notFound: true };
  }
  const orders = (await ordersFetch.json()).items;

  if (!customerProp) {
    return { notFound: true };
  }
  if (!orders) {
    return { notFound: true };
  }
  return {
    props: {
       customerProp,
      orders,
    },
  };
}