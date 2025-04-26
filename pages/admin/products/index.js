import { Flex } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import BulkUpload from "@components/AdminComponents/BulkUpload";


export default function page(){

    return(
        <Flex>
            <NavBar/>
            <BulkUpload/>
        </Flex>
    )
}
