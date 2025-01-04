import React, { useState, useEffect } from 'react';

//deal with rate limiting here
export default function searchBar({setResponseJSON, setNameQuery}) {

    const fetchProducts = async () => {
        return fetch('https://jsonplaceholder.typicode.com/users')
    }
    
    return (
    <input 
        placeholder = "search" 
        onChange = {async (e) => {
            try {
                const product_data = await fetchProducts();
                setNameQuery(e.target.value)
                setResponseJSON(product_data)
            }
            catch(e){
                console.log("some EROR OBJECT thrown") //not too sure how to handle this part yet.
            }
        }}/>
    )
}