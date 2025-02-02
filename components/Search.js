import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useDebouncedCallback } from 'use-debounce';

export default function Search () {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    const handleSearch = useDebouncedCallback((query) => {
        const params = new URLSearchParams(searchParams);
        if (query) {
          params.set('name', query);
        } 
        else {
          params.delete('name');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);
    
    return (
    <div style={{padding: "20px"}}>
        <input
        placeholder="Search..."
        defaultValue={searchParams.get('name')?.toString()}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}/>
    </div>)
}