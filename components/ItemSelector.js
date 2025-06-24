import {
  Button,
  Popover,
  ScrollArea,
  Group,
  Text,
  Box,
  Stack,
} from "@mantine/core";
import { useState } from "react";
import QtSelector from "./QtSelector"; // Adjust path as needed
import Search from "./Search";
import ISSearchResult from "./AdminComponents/ISSearchResult";
import { useSearchParams } from "next/navigation";

export default function ItemSelector({ products = [], onItemAdd }) {
  const [opened, setOpened] = useState(false);
  const [tempCart, setTempCart] = useState({});
  const searchParams = useSearchParams();

  const handleQty = (productName, qty) => {
    setTempCart((prev) => ({
      ...prev,
      [productName]: qty,
    }));
  };

  const handleDone = () => {
    Object.entries(tempCart).forEach(([name, qty]) => {
      if (qty > 0) {
        const product = products.find(p => p.Name === name);
        if (product) {
          onItemAdd({
            product: product.Name,
            quantity: qty,
            price: product.Price,
            stock: product.Stock,
          });
        }
      }
    });

    setOpened(false);
    setTempCart({});
  };

  return (
    <Popover opened={opened} onChange={setOpened} width={360} position="bottom-start">
      <Popover.Target>
        <Button onClick={() => setOpened((o) => !o)}>
          Add Items
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <ScrollArea h={420}>
          {/* {products.map((product) => (
            <Group key={product.Name} position="apart" mb="xs">
              <Text>{product.Name}</Text>
              <QtSelector
                initialQuant={tempCart[product.Name] || 0}
                maxQuant={product.Stock}
                onQuantityChange={(qty) => handleQty(product.Name, qty)}
              />
            </Group>
          ))} */}
          <Stack>
            
            <Search/>
            <Group wrap="nowrap" w="60vw" align="flex-start">
                {products && <ISSearchResult name = {searchParams.get("name")} category = {searchParams.getAll("category")} products = {products} tempCart = {tempCart} handleQty={handleQty}/>}
            </Group>
        </Stack>
        </ScrollArea>

        <Box mt="sm">
          <Button fullWidth onClick={handleDone}>
            Add to Cart
          </Button>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}
