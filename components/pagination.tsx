import { cn } from "@/lib/utils";
import { useRouter } from "next/router";

function Pagination({ pager, onPaginate }: { pager: string, onPaginate: (page: number) => void }) {
  const pages = parsePager(pager);
  const router = useRouter();

  if (!Array.isArray(pages)) {
    return <div />;
  }

  if (Array.isArray(pages) && pages.length === 0) {
    return <div />;
  }

  return (
    <div className="flex justify-center items-center p-3 gap-1">
      {pages.map((item, key) => (
        <a 
          key={key}
          onClick={(e: any) => {
            e.preventDefault();
            onPaginate(item.page);
          }} 
          href={router.asPath + item.query}
          className={cn(
            "px-3.5 py-1.5 rounded-xl font-medium text-stone-500 bg-stone-100",
            item.active && 'bg-stone-800 text-stone-200 hover:bg-stone-800 hover:text-stone-200'
          )}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}

export function parsePager(html: string) {
  const links: any[] = [];

  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;

    const anchorTags = Array.from(div.querySelectorAll('a'));

    if (anchorTags.length <= 1) {
      return [];
    }

    anchorTags.forEach((elem, index) => {
      if (!elem) return;
      const li = div.querySelectorAll('li')[index];

      const url = new URL(elem.href);
      const params = url.searchParams;

      let pattern = /[+*\n]|^\d+/g;
      let string = elem.innerText;
      string = string.replace(pattern, " ").replace(/[ ]{2,}/g, " ").trim();

      links.push({
        query: '?page=' + params.get('page'),
        label: string,
        page: params.get('page'),
        active: li.classList.contains('active')
      });
    });
  }

  return links;
}

export default Pagination;