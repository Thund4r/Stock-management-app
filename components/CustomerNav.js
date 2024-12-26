import { useRouter } from "next/router";

export default function CustomerNav() {
    const router = useRouter();

    const navigateTo = (path) => {
        if (router.pathname !== path) {
            router.push(path); 
        }
    };

    return (
        <nav style={{ display: "flex", gap: "1rem" }}>
            <button 
                onClick={() => navigateTo("/")} 
                style={router.pathname === "/" ? { fontWeight: "bold" } : {}}
            >
                Home
            </button>
            <button 
                onClick={() => navigateTo("/search")} 
                style={router.pathname === "/search" ? { fontWeight: "bold" } : {}}
            >
                Search
            </button>
        </nav>
    );
}