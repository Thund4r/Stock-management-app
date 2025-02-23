import D from "components/AdminOrderComponents/test/D";
import E from "components/AdminOrderComponents/test/E";

export default function B({ val, setVal }) {
  console.log("B");
  return (
    <div>
      <D val={val} setVal={setVal}>
        {val}
      </D>
      <E>E</E>
    </div>
  );
}
