import { useEffect, useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, Stack } from '@mantine/core';

export default function page({ item }) {
  const [customer, setCustomer] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [cart, setCart] = useState([]);

  let content = <></>

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || [])
    try {
    setCustomer(item);
    } catch (error) {
    console.error("Error parsing customer:", error);
    }
  }, []);


  if (customer){
    content = (<>
    <Stack>
        {customer.Name}
        <div>
            Some Order Details here
        </div>

        <div>
            Last orders
            <div>
                Orders go here
            </div>
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?name=${params.customer}`, {
    method: "GET"
});
  const item = (await response.json())[0];

  return {
    props: {
      item,
    },
  };
}