import { Button, Flex, Group, Modal, Stack } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";


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

    let content = <div></div>;
    if (customers){
        content = customers.map(item => (
        <div>
            {item.Name}
        </div>
        ));
    }
    

    return(
        <Flex>
            <NavBar/>
            {content}
        </Flex>
    )
}
