import AdminSearchBar from "./AdminSearchBar.js"
import AdminSearchBarList from "./AdminSearchBarList.js"
import { useState, useEffect } from 'react';

const initialDataFetch = async (API_URL) => {
    let API_data;
    try {
         API_data = await fetch(API_URL);
    }
    catch(e){
        console.log("Network Error when fetching"); //not too sure how to handle this part yet. Maybe change it just so it alerts the user but just for debugging purposes
    }
    if(API_data){
        return API_data
    }
    else {
        console.log("No data received from fetching") //not too sure how to handle this part yet. Maybe change it just so it alerts the user but just for debugging purposes
        return API_data
    }
}

export default function searchContainer({API_URL}){


    const [response_JSON, setResponseJSON] = useState("");
    const [nameQuery, setNameQuery] = useState("");


    /*why doesn't this cause the list to render on load of the page. Figure out why then see if it works as you and chong discussed (is it loading empty page, 
    then rendering after parsing data or is it doing serverside parsing of data and rendering with it ready so it appears instantaneously)*/
    useEffect(() => {
        const passData = async (API_URL) => {
            const response = await initialDataFetch(API_URL);
            setResponseJSON(response);
        };

        passData();
    }, [])

    return (
        <div>
            <AdminSearchBar setResponseJSON = {setResponseJSON} setNameQuery = {setNameQuery} API_URL = {API_URL} />
            <AdminSearchBarList response_JSON = {response_JSON} nameQuery = {nameQuery} />
        </div>
    )
}