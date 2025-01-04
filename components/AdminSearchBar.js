import React, { useState, useEffect } from 'react'
import {debounce} from 'lodash'


const fetchProducts = async () => {
    return fetch('https://jsonplaceholder.typicode.com/users')
}

export default function searchBar({setResponseJSON, setNameQuery}) {
    
    const handleSearchInput = async (event) => {
        try {
            const product_data = await fetchProducts();
            setNameQuery(event.target.value)
            setResponseJSON(product_data)
            console.log(event.target.value)
        }
        catch(e){
            console.log("Error object thrown in TestAdminSearchBar") //not too sure how to handle this part yet.
        }
    }

    const debounceHandleSearchInput = debounce(handleSearchInput, 2000) //this returns a function so everytime debounceHandleSearchInput is called, we are referring to the same function and not recreating it.

    return (
    <input 
        placeholder = "search" 
        onChange = {debounceHandleSearchInput}/> //eventHandlers receive the event object implicitly.
    )
}