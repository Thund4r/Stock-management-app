import AdminSearchContainer from "../../components/AdminSearchComponents/AdminSearchContainer.js"


export default function page(){
    return(
        <div>
            <AdminSearchContainer API_URL={'https://jsonplaceholder.typicode.com/users'}/>
        </div>
    )
}