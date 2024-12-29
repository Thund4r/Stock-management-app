import { useState } from "react";

export default function SearchBar() {
    const [input, setInput] = useState("")

    // Without value={input}, this button wouldn't clear the input display!
    const clearSearch = () => {
        setInput("")
    }

    return (
        <div>
            <input 
                onChange={(e) => console.log(e)}
                placeholder= "text"  // This ensures the input shows what's in state
            />
            <button onClick={clearSearch}>Clear</button>
        </div>
    )
}