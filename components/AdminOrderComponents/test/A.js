import B from "components/AdminOrderComponents/test/B";
import C from "components/AdminOrderComponents/test/C";
import { useState } from "react";

export default function A() {
  const [val, setVal] = useState("dog");
  console.log("A");
  return (
    <div>
      <B val={val} setVal={setVal}>
        {val}
      </B>
      <C>C</C>
    </div>
  );
}
