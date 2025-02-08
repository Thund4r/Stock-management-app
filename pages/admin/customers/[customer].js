import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, Stack } from '@mantine/core';
import { ClickableCardOrder } from '@components/ClickableCard';

export default function page({ customerTest, orders }) {
  const [customer, setCustomer] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState([]);

  let content = <></>

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
    try {
    setCustomer(customerTest);
    } catch (error) {
    console.error("Error parsing customer:", error);
    }
  }, []);


  if (customer){
    console.log(orders);

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
        <Flex>
            <div>
                Customer info
            </div>
            <div>
                Edit button goes here
            </div>
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
  const paths = customers.map(item => ({params: {customer: item.Name}}));

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const customerFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?name=${params.customer}`);
  const customerTest = (await customerFetch.json())[0];
  const ordersFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/orders?customerName=${params.customer}`);
  const orders = (await ordersFetch.json()).items;
  return {
    props: {
      customerTest,
      orders,
    },
  };
}