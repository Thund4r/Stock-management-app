import AdminSearchBar from "./AdminSearchBar.js"
import AdminSearchBarList from "./AdminSearchBarList.js"
import { useState } from 'react';

export default function searchContainer(){
    const [response_JSON, setResponseJSON] = useState("")
    const [nameQuery, setNameQuery] = useState("")


    return (
        <div>
            <AdminSearchBar setResponseJSON = {setResponseJSON} setNameQuery = {setNameQuery} />
            <AdminSearchBarList response_JSON = {response_JSON} nameQuery = {nameQuery} />
        </div>
    )
}