import F from "components/AdminOrderComponents/test/F";
import G from "components/AdminOrderComponents/test/G";

export default function C() {

  const module1 = (function IIFE(){
    console.log("hello")
  })()

  const module2 = (function IIFE(){
    console.log("hello")
  }())


  console.log("C");
  return (
    <div>
      <F>F</F>
      <G>G</G>
    </div>
  );
}
