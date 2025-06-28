import { Box, Flex, Stack } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
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
                    <h1>Page in progress, you can currently only add categories. If you want to remove a category, remove all products with that category.</h1>
                    {categories && (
                        <Box w="100%">
                        {categories.map(item => (
                            <div>
                                <b style={{paddingRight:"18px"}}>{item}</b>
                            </div>
                        ))}
                        </Box>
                    )}
                </Stack>
            </Flex>
        </Flex>
    )
}
