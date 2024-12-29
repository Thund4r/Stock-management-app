export default function search() {

    //doesnt work as expected. fix tmr
    
    async function getData(){
        return await fetch("https://jsonplaceholder.typicode.com/todos/1", {
            method: "GET" 
        }) //is the await needed?
    }

    return(
        <input 
        type = "text" 
        placeholder = "Type to search" 
        onChange = {() => {
            const data =  getData().then((response) => response.json())
            console.log(data)
            }
        }
        />
    )
}
