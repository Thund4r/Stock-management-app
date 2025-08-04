import { useState } from 'react';
import NavBar from "@components/AdminComponents/NavBar";
import { Flex, TextInput, Button } from '@mantine/core';
import { useRouter } from 'next/router';

export default function Page({ initialCategory }) {
  const router = useRouter();
  const [newCategory, setNewCategory] = useState(initialCategory);

  const submitForm = async (event) => {
    event.preventDefault();

    if (newCategory.trim() === "" || newCategory === initialCategory) {
      alert("Please enter a new category name different from the current one.");
      return;
    }

    const payload = JSON.stringify({ 
      oldCategory: initialCategory, 
      newCategory: newCategory,
      renameCategory: true
    });

    console.log("Submitting payload:", payload);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/products`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      sessionStorage.removeItem("products");
      router.push(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/category`);
    } catch (error) {
      console.error("Failed to rename category:", error);
      alert("An error occurred while renaming the category.");
    }
  };

  return (
    <Flex>
      <NavBar />
      <form onSubmit={submitForm} style={{ maxWidth: '400px' }}>
        <TextInput
          label="New Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
        <Button type="submit" mt="md">Rename Category</Button>
      </form>
    </Flex>
  );
}

export async function getServerSideProps({ params }) {
  const categoryName = decodeURIComponent(params.category);

  return {
    props: {
      initialCategory: categoryName,
    },
  };
}
