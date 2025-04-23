import { Flex, Textarea, TextInput } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { useEffect, useState } from "react";


export default function page(){
    const [settings, setSettings] = useState({Name: "", Phone: "", Address: ""});
    
    useEffect(() => {
        checkCustomers();
    }, []);

    const checkCustomers = async () => {
        console.log("Here")
        if (!(sessionStorage.getItem("settings"))){
            const response = await fetch (`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/settings`, {
                method: "GET"
            });
            const settings = await response.json();
            sessionStorage.setItem("settings", JSON.stringify(settings));
            setSettings(settings);
        }
        else{
            setSettings(JSON.parse(sessionStorage.getItem("settings")));
        }
        
    }


    const submitForm = async (event) => {
        event.preventDefault();

        // const normalisedNames = customerNames.map(customer => customer.Name.trim().toLowerCase());
        
        // if (normalisedNames.includes(customerName.trim().toLowerCase())){
        //     alert("A customer with this name already exists.");
        //     return;
        // }

        // const payload = JSON.stringify({
        //   name: customerName,
        //   phone: customerPhone,
        //   address: customerAddress,
        // });
        
        // const response = fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/customers`, {
        //   method: "POST",
        //   headers: {'Content-Type': 'application/json'},
        //   body: payload
        // });
        
        // sessionStorage.removeItem("customers");
        // router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/customers`);
    
    }

    return(
        <Flex>
            <NavBar/>
            <form onSubmit={submitForm}>
            
                <h4>Invoice Details</h4>
                <TextInput 
                    id="Name"
                    label="Name"
                    required
                    value={settings.Name}
                    onChange={(e) => {
                        const { id, value } = e.target;
                        setSettings(prev => ({ ...prev, [id]: value }));
                        console.log(settings)
                    }}
                />
    
                <TextInput 
                    id="Phone"
                    label="Phone"
                    required
                    value={settings.Phone}
                    onChange={(e) => {
                        const { id, value } = e.target;
                        setSettings(prev => ({ ...prev, [id]: value }));
                        console.log(settings)
                    }}
                />
    
                <Textarea 
                    id="Address"
                    label="Address"
                    required
                    autosize
                    value={settings.Address}
                    onChange={(e) => {
                        const { id, value } = e.target;
                        setSettings(prev => ({ ...prev, [id]: value }));
                        console.log(settings)
                    }}
                    style={{ width: '600px' }}
                />
        
                <button>Save</button>
            </form>
        </Flex>
    )
}
