import { Box, Flex, Stack } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import { ClickableCardCategory } from "@components/ClickableCard";
import { useEffect, useState } from "react";


export default function page(){
    const [categories, setCategories] = useState(null);
      
    useEffect(() => {
        checkCategories();
        
    }, []);

    const checkCategories = async () => {
        if (!(sessionStorage.getItem("products"))){
          const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
              method: "GET"
          });
          const products = await response.json();
          sessionStorage.setItem("products", JSON.stringify(products));
          setCategories([...new Set(products.map(item => item.Category))]);
        }
        else{
          setCategories([...new Set(JSON.parse(sessionStorage.getItem("products")).map(item => item.Category))]);
        }
        
    }

    return(
        <Flex>
            <NavBar/>
            <Flex justify="flex-start" align="center" style={{ flex: 1 }}>
                <Stack w="60%" align="flex-end">
                    <a href ={`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/category/new`}><button>Add new category</button></a>
                    {categories && (
                        <Box w="100%">
                        <ClickableCardCategory data={categories} />
                        </Box>
                    )}
                </Stack>
            </Flex>
        </Flex>
    )
}
