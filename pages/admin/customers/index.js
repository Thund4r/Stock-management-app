import { Box, Flex, Stack } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { ClickableCardCustomer } from "@components/ClickableCard";
import { useEffect, useState } from "react";


export default function page(){
    const [customers, setCustomers] = useState(null);
      
    useEffect(() => {
    checkCustomers();
    }, []);

    const checkCustomers = async () => {
        if (!(sessionStorage.getItem("customers"))){
            const response = await fetch (`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`, {
                method: "GET"
            });
            const customer = await response.json();
            sessionStorage.setItem("customers", JSON.stringify(customer));
            setCustomers(customer);
        }
        else{
            setCustomers(JSON.parse(sessionStorage.getItem("customers")));
        }
        
    }
    return(
        <Flex>
            <NavBar/>
            <Flex justify="flex-start" align="center" style={{ flex: 1 }}>
                <Stack w="60%" align="flex-end">
                    <a href ={`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/customers/new`}><button>Add new customer</button></a>
                    {customers && (
                        <Box w="100%">
                        <ClickableCardCustomer data={customers} />
                        </Box>
                    )}
                </Stack>
            </Flex>
        </Flex>
    )
}
