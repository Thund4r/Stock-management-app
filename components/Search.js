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
          params.set('query', query);
        } 
        else {
          params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);
    
    return (
    <div>
        <input
        placeholder="Search..."
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}/>
    </div>)
}