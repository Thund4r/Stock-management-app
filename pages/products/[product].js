import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
 
export default function Page() {
  const router = useRouter();
  const [product, setProduct] = useState(null);

  let content = <></>
  useEffect(() => {
    if (router.query.product) {
      try {
        console.log(router.query.product);
        console.log(JSON.parse(decodeURIComponent(router.query.product)));
        setProduct(JSON.parse(decodeURIComponent(router.query.product)));
      } catch (error) {
        console.error("Error parsing product:", error);
      }
    }
  }, [router.query.product]);

  if (product){
    content = Object.keys(product).reverse().map(attribute => (
      <p>{attribute}: {product[attribute]}</p>
    ))
  }
  
  return (<div>
    {content}
    <button>Add to cart</button>
    </div>
  )
}