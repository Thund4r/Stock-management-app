const paths = ["/admin/orders", "/admin/orders/400", "/admin/orders/401"]


export default function page(){
    return (
        <button onClick={async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/revalidations`, {
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify(paths)
            })
        }}>Click to see if serverless function calls nextJS api properly</button>
    )
}