import { Flex } from "@mantine/core";
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
            setCustomers(customer)
        }
        else{
            setCustomers(JSON.parse(sessionStorage.getItem("customers")))
        }
        
    }
    return(
        <Flex>
            <NavBar/>
            <Flex flex={1}>
                {customers && <ClickableCardCustomer data={customers}/>}
            </Flex>
        </Flex>
    )
}
