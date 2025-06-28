import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, Stack } from '@mantine/core';
import { ClickableCardOrder } from '@components/ClickableCard';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';

export default function page({ customerTest, orders }) {
  const [customer, setCustomer] = useState(null);
  const pathName = usePathname();
  const router = useRouter();

  let content = <></>

  useEffect(() => {

    try {
    setCustomer(customerTest);
    console.log(pathName);
    } catch (error) {
    console.error("Error parsing customer:", error);
    }
  }, []);


  const deleteCustomer = async () => {
    if (confirm('Delete this customer?')) {
      const payload = JSON.stringify({
        name: customer.Name
      });
  
      const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`, {
          method: "DELETE",
          headers: {'Content-Type': 'application/json'},
          body: payload
        });
  
      sessionStorage.removeItem("customers");
      router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/customers`);
    };
  }


  if (customer){

    content = (<>
    <Stack>
        {customer.Name}
        <div>
            Some Order Details here
        </div>

        <div>
            Last orders
            <ClickableCardOrder data={orders}/>
        </div>
    </Stack>
    <Stack>
        <button onClick={deleteCustomer}>Delete</button>
        <Flex>
            <div>
                Customer info
            </div>
            <a href={`${pathName}/edit`}>
                <button>Edit</button>
            </a>
        </Flex>
        <div>
            Phone
        </div>
        <div>
            {customer.Phone}
        </div>
        <div>
            Address
        </div>
        <div>
            {customer.Address}
        </div>


    </Stack>
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
  const paths = customers.map(item => ({params: {customer: encodeURIComponent(item.Name)}}));

  return {
    paths,
    fallback: "blocking",
  }
}

export async function getStaticProps({ params }) {
  const customerFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?name=${encodeURIComponent(params.customer)}`);
  if (!customerFetch) {
    console.error("Failed to fetch customer:", customerFetch.statusText);
    return { notFound: true };
  }
  const customerTest = (await customerFetch.json())[0];
  
  const ordersFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders?customerName=${encodeURIComponent(params.customer)}`);
  if (!ordersFetch) {
    console.error("Failed to fetch orders:", ordersFetch.statusText);
    return { notFound: true };
  }
  const response = await ordersFetch.json();

  const orders = response.items.filter(order => !isNaN(order.orderID))
            .sort((a, b) => Number(b.orderID) - Number(a.orderID));
            
  if (!customerTest) {
    return { notFound: true };
  }
  if (!orders) {
    return { notFound: true };
  }
  return {
    props: {
      customerTest,
      orders,
    },
  };
}