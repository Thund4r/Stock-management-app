import React, { useState, useEffect } from 'react';

export default function searchBarList({response_JSON, nameQuery}){

    //this doesnt work need to fix, the issue is someting to do with how we are using useEffect() - https://claude.ai/chat/8a68d6c2-d741-4e5b-b992-c56ae40eea2b (look at this chat)
    //validate if response_JSON is what we expect it to be and not an error
    //fix issue of Listed element needing a unique id.
    const [data, setData] = useState([])

    const parseProductsJSON = async () => {
        if(response_JSON.ok){
            const arr_product_obj = await response_JSON.json()
            if (Array.isArray(arr_product_obj)){
                const arr_names = arr_product_obj.map((product_obj) => product_obj.name).filter((name) => name.toLowerCase().includes(nameQuery.toLowerCase())).map((name) => <li>{name}</li> )
                setData(arr_names)
            }
        }
        else{
            //http status is not correct
        }
    }

    useEffect(() => {
        parseProductsJSON()
    }, [response_JSON])

    return (
        <div>
            {data}
        </div>
    )
}

