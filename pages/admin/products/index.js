import { Button, Flex, Modal } from "@mantine/core";
import NavBar from "@components/AdminComponents/NavBar";
import BulkUpload from "@components/AdminComponents/BulkUpload";
import { useState } from "react";


export default function page(){
    const [opened, setOpened] = useState(false);
    const handleFinish = () => {
        console.log("Upload finished");

    }
    return(
        <Flex>
            <NavBar/>
            <Button onClick={() => setOpened(true)}>Import CSV</Button>
            <Modal
                opened={opened}
                onClose={() => {
                setOpened(false);
                }}
                title="Upload your CSV"
                size="lg"
                centered>
                <BulkUpload onFinish={handleFinish}/>
            </Modal>
        </Flex>
    )
}
