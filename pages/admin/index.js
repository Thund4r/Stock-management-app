import { Flex } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";


export default function page(){

    return(
        <Flex>
            <NavBar/>
            <Flex>
                Temp Dashboard
            </Flex>
        </Flex>
    )
}
