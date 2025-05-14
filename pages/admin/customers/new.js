import { Flex, Textarea, TextInput } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";



export default function page(){

    const [customerNames, setCustomerNames] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const router = useRouter();
      
    useEffect(() => {
        getCustomerNames();
    }, []);
    
    const getCustomerNames = async () => {
        const customerFetch = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers?nameOnly=True`);
        setCustomerNames(await customerFetch.json());
    }

    const submitForm = async (event) => {
        event.preventDefault();

        const normalisedNames = customerNames.map(customer => customer.Name.trim().toLowerCase());
        
        if (normalisedNames.includes(customerName.trim().toLowerCase())){
            alert("A customer with this name already exists.");
            return;
        }

        const payload = JSON.stringify({
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
        });
        
        const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`, {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: payload
        });
        
        sessionStorage.removeItem("customers");
        router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/customers`);
    
    }

    return(
        <Flex>
            <NavBar/>
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
        </Flex>
    )
}
