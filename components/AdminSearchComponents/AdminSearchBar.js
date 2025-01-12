import { useDebouncedCallback } from 'use-debounce'



export default function searchBar({setResponseJSON, setNameQuery, API_URL}) {

    
    const handleSearchInput = async (event, API_URL) => {
        let API_data = undefined;
        try {
             API_data = await fetch(API_URL);
        }
        catch(e){
            console.log("Network Error when fetching"); //not too sure how to handle this part yet. Maybe change it just so it alerts the user but just for debugging purposes
        }
        if(API_data){
            setNameQuery(event.target.value);
            setResponseJSON(API_data);
        }
        else {
            console.log("No data received from fetching") //not too sure how to handle this part yet. Maybe change it just so it alerts the user but just for debugging purposes
        }
    }

    const debounceHandleSearchInput = useDebouncedCallback(handleSearchInput, 500); //this returns a function so everytime debounceHandleSearchInput is called, we are referring to the same function and not recreating it.

    return (
    <input 
        placeholder = "search" 
        onChange = {(event) => {
            debounceHandleSearchInput(event, API_URL)
        }}/> 
    )
}